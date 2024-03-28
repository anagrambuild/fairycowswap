/* eslint-disable */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import { expect, test } from 'vitest'

import {
  DirectSecp256k1HdWallet,
  OfflineDirectSigner,
  OfflineSigner,
  decodeTxRaw,
  DecodedTxRaw,
} from '@cosmjs/proto-signing'
import { Client } from 'fairyring-client-ts'
import { SigningStargateClient } from '@cosmjs/stargate'
import { toHex } from '@cosmjs/encoding'

import { encryptSignedTxForFairyring } from './encrypt'

import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { FAIRYRING_TESTNET_API_URL, FAIRYRING_TESTNET_RPC_URL } from './config'

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
  console.log('pepNonce', pepNonce)

  const signedMsg = await signer.sign(
    fromWalletAddress!,
    [msg],
    {
      amount: [{ denom: 'ufairy', amount: '1' }],
      gas: '200000',
    },
    'test memo',
    {
      chainId: 'fairyring-testnet-1',
      accountNumber: 1916,
      sequence: parseInt(pepNonce!.data.pepNonce!.nonce!) ?? undefined,
    }
  )

  const serializedSignedMsg = toHex(TxRaw.encode(signedMsg).finish())

  console.log('serializedSignedMsg', serializedSignedMsg)

  const fairblockRegistry = fairblockClient.registry

  const fairyBalance = await fairblockClient.CosmosBankV1Beta1.query.queryBalance(fromWalletAddress, {
    denom: 'ufairy',
  })

  console.log('fairyBalance', fairyBalance)

  const keysharePubkeyResult = await fairblockClient.FairyringKeyshare.query.queryPubKey({})

  const activePubKey = keysharePubkeyResult.data.activePubKey
  const queuedPubKey = keysharePubkeyResult.data.queuedPubKey

  const latestHeightResult = await fairblockClient.FairyringPep.query.queryLatestHeight({})

  const lastestBlockHeight = latestHeightResult.data.height

  console.log('lastestBlockHeight', lastestBlockHeight)
  console.log('signedMsgJson -serialized', JSON.stringify(signedMsg))
  console.log('signedMsgJson', signedMsg)

  const targetBlockHeight = parseInt(lastestBlockHeight!, 10) + 3

  const encryptedData = encryptSignedTxForFairyring(
    targetBlockHeight.toString(),
    activePubKey?.publicKey!,
    serializedSignedMsg
  ).trim()

  console.log('encryptedData', `~${encryptedData}~`)

  const encryptTxSubmitData = await fairblockClient.FairyringPep.tx.msgSubmitEncryptedTx({
    value: {
      creator: fromWalletAddress,
      data: encryptedData,
      targetBlockHeight: targetBlockHeight + 1,
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
