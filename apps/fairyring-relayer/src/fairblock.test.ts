/* eslint-disable */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import { test } from 'vitest'
import {
  DirectSecp256k1HdWallet,
  OfflineDirectSigner,
} from '@cosmjs/proto-signing'
import { Client } from 'fairyring-client-ts'
import { SigningStargateClient } from '@cosmjs/stargate'
import { toHex } from '@cosmjs/encoding'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { FAIRYRING_TESTNET_API_URL, FAIRYRING_TESTNET_RPC_URL } from './config'
import { timelockEncrypt } from 'ts-ibe'

const TO_ADDRESS_THROWAWAY = 'fairy1df2xxdwq5usuwrvu63etkvh52m6f49llkm00vu'

const sandboxAsync = async () => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    'enlist hip relief stomach skate base shallow young switch frequent cry park',
    { prefix: 'fairy' }
  )
  const [firstAccount] = await wallet.getAccounts()
  const offlineSigner: OfflineDirectSigner = wallet

  const signer = await SigningStargateClient.connectWithSigner(FAIRYRING_TESTNET_RPC_URL, offlineSigner)

  const fromWalletAddress = firstAccount?.address!
  console.log('fromAddress', fromWalletAddress)

  const fairblockClient = new Client(
    {
      apiURL: FAIRYRING_TESTNET_API_URL,
      rpcURL: FAIRYRING_TESTNET_RPC_URL,
    },
    wallet
  )

  const msg = fairblockClient.CosmosBankV1Beta1.tx.msgSend({
    value: {
      fromAddress: fromWalletAddress,
      toAddress: TO_ADDRESS_THROWAWAY,
      amount: [{ denom: 'ufairy', amount: '1' }],
    },
  })

  const pepNonce = await fairblockClient.FairyringPep.query.queryPepNonce(fromWalletAddress)

  const signedMsg = await signer.sign(
    fromWalletAddress!,
    [msg],
    {
      amount: [{ denom: 'ufairy', amount: '1' }],
      gas: '200000',
    },
    // 'TEST1234',
    // JSON.parse('{\"memo\":\"abc958\",\"payload\":{\"amount\":[{\"denom\":\"ufairy\",\"amount\":\"1\"}],\"toAddress\":\"fairy1f6mx8wgea8xdxeswwavh9008uv6d7yga3qqtyv\",\"fromAddress\":\"fairy14qemq0vw6y3gc3u3e0aty2e764u4gs5lht73ps\"}}'),
    // MEMO: 
    '{"memo":"abcdefg","payload":{"amount":[{"denom":"ufairy","amount":"1"}],"toAddress":"fairy1f6mx8wgea8xdxeswwavh9008uv6d7yga3qqtyv","fromAddress":"fairy14qemq0vw6y3gc3u3e0aty2e764u4gs5lht73ps"}}',
    {
      chainId: 'fairyring-testnet-1',
      accountNumber: 1916,
      sequence: parseInt(pepNonce!.data.pepNonce!.nonce!) ?? undefined,
    }
  )

  const serializedSignedMsg = toHex(TxRaw.encode(signedMsg).finish())

  const fairyBalance = await fairblockClient.CosmosBankV1Beta1.query.queryBalance(fromWalletAddress, {
    denom: 'ufairy',
  })

  const keysharePubkeyResult = await fairblockClient.FairyringKeyshare.query.queryPubKey({})
  const pepPubkeyResult = await fairblockClient.FairyringPep.query.queryPubKey({})

  const activePubKey = keysharePubkeyResult.data.activePubKey?.publicKey!

  const latestHeightResult = await fairblockClient.FairyringPep.query.queryLatestHeight({})

  const lastestBlockHeight = latestHeightResult.data.height

  // Target block 10 blocks ahead
  const targetBlockHeight = parseInt(lastestBlockHeight!, 10) + 5

  const encryptedData =await timelockEncrypt(
    targetBlockHeight.toString(10),
    activePubKey!,
    new TextEncoder().encode(serializedSignedMsg)
  )

  const encryptTxSubmitData = await fairblockClient.FairyringPep.tx.msgSubmitEncryptedTx({
    value: {
      creator: fromWalletAddress,
      data: encryptedData,
      targetBlockHeight: targetBlockHeight,
    },
  })

  const signedAndBroadcatsedResult = await fairblockClient.signAndBroadcast(
    [encryptTxSubmitData],
    {
      amount: [{ denom: 'ufairy', amount: '1' }],
      gas: '500000',
    },
    ''
  )
  console.log('signedAndBroadcatsedResult', signedAndBroadcatsedResult)
  console.log('txHash', signedAndBroadcatsedResult.transactionHash)
}

test(
  'fairblock',
  async () => {
    await sandboxAsync()
  },
  { timeout: 1000 * 60 * 2 }
)
