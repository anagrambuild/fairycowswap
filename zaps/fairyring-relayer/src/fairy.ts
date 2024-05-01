/* eslint-disable */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import { DirectSecp256k1HdWallet, EncodeObject, OfflineDirectSigner } from '@cosmjs/proto-signing'
import { Client } from 'fairyring-client-ts'
import { SigningStargateClient } from '@cosmjs/stargate'
import { toHex } from '@cosmjs/encoding'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { FAIRYRING_TESTNET_API_URL, FAIRYRING_TESTNET_RPC_URL } from './config'
import { timelockEncrypt } from 'ts-ibe'

const TO_ADDRESS_THROWAWAY = 'fairy1df2xxdwq5usuwrvu63etkvh52m6f49llkm00vu'

export const encryptSignedTx = async (pubKeyHex: string, targetHeight: number, signedBuf: Buffer): Promise<string> => {
  return await timelockEncrypt(targetHeight.toString(), pubKeyHex, signedBuf)
}

export const submitMsgToFairychain = async (msg: string) => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    'enlist hip relief stomach skate base shallow young switch frequent cry park',
    { prefix: 'fairy' }
  )
  const [firstAccount] = await wallet.getAccounts()
  const offlineSigner: OfflineDirectSigner = wallet

  const signer = await SigningStargateClient.connectWithSigner(FAIRYRING_TESTNET_RPC_URL, offlineSigner)

  const address = 'fairy14qemq0vw6y3gc3u3e0aty2e764u4gs5lht73ps' // firstAccount?.address!

  const signerAddress = 'fairy14qemq0vw6y3gc3u3e0aty2e764u4gs5lht73ps' // firstAccount?.address!

  const { accountNumber } = await signer.getSequence(signerAddress)
  const offlineSignerAccount = (await offlineSigner.getAccounts()).find((account) => account.address === signerAddress)

  if (offlineSignerAccount == null) {
    throw new Error('Offline Signer Account is null...')
  }

  console.log('fromAddress', signerAddress)
  const fromWalletAddress = signerAddress

  const fairblockClient = new Client(
    {
      apiURL: FAIRYRING_TESTNET_API_URL,
      rpcURL: FAIRYRING_TESTNET_RPC_URL,
    },
    wallet
  )

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

  const payload = {
    fromAddress: fromWalletAddress,
    toAddress: TO_ADDRESS_THROWAWAY,
    amount: [{ denom: 'ufairy', amount: '1' }],
  }

  const memoObj = {
    memo: msg,
    payload: payload,
  }

  const memo = JSON.stringify(memoObj)

  const sendMsg = fairblockClient.CosmosBankV1Beta1.tx.msgSend({
    value: payload,
  })

  const messages: readonly EncodeObject[] = [sendMsg]

  const fee = {
    amount: [
      {
        denom: 'ufairy',
        amount: '0',
      },
    ],
    gas: '500000',
  }
  const signedTxRaw = await signer.sign(
    signerAddress!,
    messages,
    fee,
    memo,
    {
      chainId: 'fairyring-testnet-1',
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
  console.log('success submitting tx...')
  console.log('TXHASH:', txResult.transactionHash)
  return {
    txHash: txResult.transactionHash,
    currentBlock: currentBlockHeight,
    targetBlock: targetHeight,
  }
}

