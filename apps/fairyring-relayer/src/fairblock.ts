import { OrderCreation } from '@cowprotocol/cow-sdk'
import { Client } from 'fairyring-client-ts'
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
import { SigningStargateClient } from '@cosmjs/stargate'
import { toHex } from '@cosmjs/encoding'

import { encryptSignedTxForFairyring } from './encrypt'

import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { FAIRYRING_TESTNET_API_URL, FAIRYRING_TESTNET_RPC_URL } from './config'

const TO_ADDRESS_THROWAWAY = 'fairy1df2xxdwq5usuwrvu63etkvh52m6f49llkm00vu'

export type FairyringCosmosSdkClient = typeof Client

export const serializeCowswapOrder = (tx: OrderCreation): string => {
  return JSON.stringify(tx)
}

export const deserializeCowswapOrder = (tx: string): OrderCreation => {
  return JSON.parse(tx)
}

export const getFairblockClientWithSigner = async () => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    'enlist hip relief stomach skate base shallow young switch frequent cry park',
    { prefix: 'fairy' }
  )
  const [firstAccount] = await wallet.getAccounts()
  const offlineSigner: OfflineDirectSigner = wallet

  const signer = await SigningStargateClient.connectWithSigner(FAIRYRING_TESTNET_RPC_URL, offlineSigner)

  const fromWalletAddress = firstAccount?.address!

  const fairblockClient = new Client(
    {
      apiURL: FAIRYRING_TESTNET_API_URL,
      rpcURL: FAIRYRING_TESTNET_RPC_URL,
    },
    wallet
  )

  return fairblockClient
}

export const cowswapOrderToSignedBankMsgSend = async (order: OrderCreation) => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    'enlist hip relief stomach skate base shallow young switch frequent cry park',
    { prefix: 'fairy' }
  )
  const [firstAccount] = await wallet.getAccounts()
  const offlineSigner: OfflineDirectSigner = wallet

  const signer = await SigningStargateClient.connectWithSigner(FAIRYRING_TESTNET_RPC_URL, offlineSigner)

  const fromWalletAddress = firstAccount?.address!

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

  return {
    signedMsg,
    serializedSignedMsg,
  }
}

export const encryptSignedTx = async (serializedSignedMessage: string) => {
  const fairblockClient = await getFairblockClientWithSigner()

  const keysharePubkeyResult = await fairblockClient.FairyringKeyshare.query.queryPubKey({})

  const activePubKey = keysharePubkeyResult.data.activePubKey
  const queuedPubKey = keysharePubkeyResult.data.queuedPubKey

  const latestHeightResult = await fairblockClient.FairyringPep.query.queryLatestHeight({})

  const lastestBlockHeight = latestHeightResult.data.height

  console.log('lastestBlockHeight', lastestBlockHeight)

  const targetBlockHeight = parseInt(lastestBlockHeight!, 10) + 3

  const encryptedData = encryptSignedTxForFairyring(
    targetBlockHeight.toString(),
    activePubKey?.publicKey!,
    serializedSignedMessage
  ).trim()

  console.log('encryptedData', `~${encryptedData}~`)

  const encryptTxSubmitData = await fairblockClient.FairyringPep.tx.msgSubmitEncryptedTx({
    value: {
      creator: serializedSignedMessage,
      data: encryptedData,
      targetBlockHeight: targetBlockHeight + 1,
    },
  })

  return encryptTxSubmitData
}
