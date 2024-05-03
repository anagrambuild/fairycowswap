/* eslint-disable */
import { EncodeObject, OfflineDirectSigner } from '@cosmjs/proto-signing'
import { Client } from 'fairyring-client-ts'
import { SigningStargateClient } from '@cosmjs/stargate'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { timelockEncrypt } from 'ts-ibe'
import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import {
  ApiContext,
  OrderCreation,
  OrderSigningUtils,
  SupportedChainId,
  UnsignedOrder,
} from '@cowprotocol/cow-sdk'

const FAIRYRING_TESTNET_RPC_URL = 'https://testnet-rpc.fairblock.network'
const FAIRYRING_TESTNET_API_URL = 'https://testnet-api.fairblock.network'
const FAIRYRING_TESTNET_CHAIN_ID = 'fairyring-testnet-1'
const ECHO_CONTRACT_ADDRESS = 'fairy17p9rzwnnfxcjp32un9ug7yhhzgtkhvl9jfksztgw5uh69wac2pgsl7lw4w'

export const doEncryptAndSubmitCowswapOrderToFairychain = async (
  orderPayload: OrderCreation,
  unsignedOrder: UnsignedOrder,
  apiContext: Partial<ApiContext> & { chainId: SupportedChainId },
  wallet: OfflineDirectSigner
) => {
  delete orderPayload.quoteId // KLUDGE(johnrjj) - weird behavior sometimes with quote not found error. safe to remove.
  const fairblock = await submitMsgToFairychain(JSON.stringify(orderPayload), wallet)

  const { hashOrder, packOrderUidParams } = await import('@cowprotocol/contracts')
  const domain = await OrderSigningUtils.getDomain(apiContext.chainId)
  const orderDigest = hashOrder(domain, unsignedOrder as any)
  const precomputedOrderId = packOrderUidParams({
    orderDigest,
    owner: unsignedOrder.receiver!,
    validTo: unsignedOrder.validTo,
  })

  return {
    status: 'OK',
    fairblock,
    fairblockTxHash: fairblock.txHash,
    encrypted: true,
    orderId: precomputedOrderId,
  }
}

const encryptSignedTx = async (pubKeyHex: string, targetHeight: number, signedBuf: Buffer): Promise<string> => {
  return await timelockEncrypt(targetHeight.toString(), pubKeyHex, signedBuf)
}

const submitMsgToFairychain = async (userMsg: string, wallet: OfflineDirectSigner) => {
  const [firstAccount] = await wallet.getAccounts()
  const address = firstAccount.address

  // Now user has enough fairy token
  // In the future this will be done via cosmos x/feegrant module

  const fromWalletAddress = address
  const offlineSigner: OfflineDirectSigner = wallet

  const fairblockClient = new Client(
    {
      apiURL: FAIRYRING_TESTNET_API_URL,
      rpcURL: FAIRYRING_TESTNET_RPC_URL,
    },
    wallet
  )

  const fairyringBalanceResponseData = await fairblockClient.CosmosBankV1Beta1.query.queryBalance(address, {
    denom: 'ufairy',
  })
  const fairyringBalance = fairyringBalanceResponseData.data.balance
  console.log('Fairyring: balance', fairyringBalance, fairyringBalance?.amount)

  if (fairyringBalance.amount === '0') {
    console.log('Fairyring: no balance, sending some')
    const faucetReq = await fetch(`https://testnet-faucet.fairblock.network/send/${address}/ufairy`)
    const faucetJson = await faucetReq.json()

    if (faucetJson.result === 'You requested too often') {
      console.log(faucetJson)
      throw new Error('Faucet disperse error')
    }
    const maybeFaucetTx = faucetJson?.result?.txHash
    console.log(`Faucet tx: ${maybeFaucetTx}`)
  }

  const signer = await SigningStargateClient.connectWithSigner(FAIRYRING_TESTNET_RPC_URL, offlineSigner)

  fairblockClient.registry.forEach(([name, type]) => {
    signer.registry.register(name, type)
  })

  const { accountNumber } = await signer.getSequence(address)
  const offlineSignerAccount = (await offlineSigner.getAccounts()).find((account) => account.address === address)

  if (offlineSignerAccount == null) {
    throw new Error('Offline Signer Account is null...')
  }

  const getBlockHeight = async () => {
    try {
      const res = await fairblockClient.FairyringPep.query.queryLatestHeight()
      if (!res.data.height) {
        throw new Error('Latest Block height not found...')
      }
      return parseInt(res.data.height)
    } catch (e) {
      return 0
    }
  }

  const {
    data: { pepNonce },
  } = await fairblockClient.FairyringPep.query.queryPepNonce(fromWalletAddress)
  const {
    data: { encryptedTxArray },
  } = await fairblockClient.FairyringPep.query.queryEncryptedTxAll()

  let nonceUsing = 0

  let userSent = 0
  if (encryptedTxArray != null) {
    for (let i = 0; i < encryptedTxArray.length; i++) {
      if (encryptedTxArray[i] == null) {
        continue
      }
      const nowEArr = encryptedTxArray[i].encryptedTx
      if (nowEArr == null) {
        continue
      }
      for (let j = 0; j < nowEArr.length; j++) {
        if (nowEArr[j].creator == address) {
          userSent++
        }
      }
    }
  }
  if (!pepNonce?.nonce) {
    nonceUsing = userSent
  } else {
    nonceUsing = parseInt(pepNonce.nonce) + userSent
  }

  const currentBlockHeight = await getBlockHeight()

  const msg = {
    Echo: {
      message: userMsg,
    },
  }

  const executeContractMsg: MsgExecuteContractEncodeObject = {
    typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
    value: MsgExecuteContract.fromPartial({
      sender: fromWalletAddress,
      contract: ECHO_CONTRACT_ADDRESS,
      msg: new TextEncoder().encode(JSON.stringify(msg)),
      funds: [],
    }),
  }

  const messages: EncodeObject[] = [executeContractMsg]

  const signedTxRaw = await signer.sign(
    address,
    messages,
    {
      amount: [
        {
          denom: 'ufairy',
          amount: '0',
        },
      ],
      gas: '500000',
      //   granter: '', // TODO x/feegrant
      //   payer: '', // TODO x/feegrant
    },
    '',
    {
      chainId: FAIRYRING_TESTNET_CHAIN_ID,
      accountNumber: accountNumber,
      sequence: nonceUsing,
    }
  )

  const signedRawByte = TxRaw.encode(signedTxRaw).finish()
  const signed = Buffer.from(signedRawByte)

  const keysharePubkeyResult = await fairblockClient.FairyringKeyshare.query.queryPubKey({})
  const latestHeightResult = await fairblockClient.FairyringPep.query.queryLatestHeight({})
  const lastestBlockHeight = latestHeightResult.data.height
  const targetHeight = parseInt(lastestBlockHeight!, 10) + 10

  const pubkey = keysharePubkeyResult.data

  let keysharePubKeyForEncryption: string = pubkey?.activePubKey?.publicKey as string
  // if (
  //   targetHeightRange?.end &&
  //   state.targetHeight <= (pubkey?.queuedPubKey?.publicKey ? targetHeightRange.end - 100 : targetHeightRange.end)
  // ) {
  //   keysharePubKeyForEncryption = pubkey?.activePubKey?.publicKey as string
  // } else {
  //   keysharePubKeyForEncryption = pubkey?.queuedPubKey?.publicKey as string
  // }

  const encryptedHex = await encryptSignedTx(keysharePubKeyForEncryption, targetHeight, signed)

  const txResult = await fairblockClient.FairyringPep.tx.sendMsgSubmitEncryptedTx({
    value: {
      creator: address,
      data: encryptedHex,
      targetBlockHeight: targetHeight,
    },
    fee: {
      amount: [
        {
          denom: 'ufairy',
          amount: '0',
        },
      ],
      gas: '500000',
    },
  })
  if (txResult.code) {
    throw new Error(txResult.rawLog)
  }
  console.log('Fairyring: Success submitting tx...')
  console.log('Fairyring: TxHash:', txResult.transactionHash)

  return {
    txHash: txResult.transactionHash,
    currentBlock: currentBlockHeight,
    targetBlock: targetHeight,
  }
}
