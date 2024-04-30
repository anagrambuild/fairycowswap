import { test } from 'vitest'

import { app } from "./api";
import { orderBookApi } from "./cow";
// import { submitMsgToFairychain } from "./fairy";
// const submitToFairy = require('./fairy');
// import { apiConfig } from "./api-config";
import { logger } from "./logger";

// Start the server
const port = process.env.PORT || 3001;

app.get("/heartbeat", (req, res) => {
  res.send("OK");
});

app.post('/submit-order', async (req, res) => {
    // console.log('submit-order', req.body);
    // console.log(req.body.payload);

    console.log('hello')

    const orderPayload = req.body.payload;
    console.log('hello1')

    const apiContext = req.body.apiContext;
    // const foo = await import('./fairy').then((module) => {
    //   return module.submitMsgToFairychain(JSON.stringify(orderPayload))
    // })

    console.log('hello2')



    console.log('calling into fn')
    await submitMsgToFairychain(JSON.stringify(orderPayload))

    const orderId = await orderBookApi.sendOrder(orderPayload, apiContext)

    console.log('orderId', orderId)
    res.json({
        status: "OK",
        orderId,
    });
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});





/* eslint-disable */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
const { DirectSecp256k1HdWallet, EncodeObject, OfflineDirectSigner } = require('@cosmjs/proto-signing');
const { Client } = require('fairyring-client-ts');
const { SigningStargateClient } = require('@cosmjs/stargate');
const { toHex } = require('@cosmjs/encoding');
const { TxRaw } = require('cosmjs-types/cosmos/tx/v1beta1/tx');
const { FAIRYRING_TESTNET_API_URL, FAIRYRING_TESTNET_RPC_URL } = require('./config');
const { timelockEncrypt } = require('ts-ibe');

const TO_ADDRESS_THROWAWAY = 'fairy1df2xxdwq5usuwrvu63etkvh52m6f49llkm00vu'

export const encryptSignedTx = async (pubKeyHex: string, targetHeight: number, signedBuf: Buffer): Promise<string> => {
  return await timelockEncrypt(targetHeight.toString(), pubKeyHex, signedBuf)
}

export const submitMsgToFairychain = async (msg: string) => {
    console.log('submitting...')
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    'enlist hip relief stomach skate base shallow young switch frequent cry park',
    { prefix: 'fairy' }
  )
  const [firstAccount] = await wallet.getAccounts()
  const offlineSigner = wallet

  const signer = await SigningStargateClient.connectWithSigner(FAIRYRING_TESTNET_RPC_URL, offlineSigner)

  const address = 'fairy14qemq0vw6y3gc3u3e0aty2e764u4gs5lht73ps' // firstAccount?.address!

  const signerAddress = 'fairy14qemq0vw6y3gc3u3e0aty2e764u4gs5lht73ps' // firstAccount?.address!

  const { accountNumber } = await signer.getSequence(signerAddress)
  const offlineSignerAccount = (await offlineSigner.getAccounts()).find((account: any) => account.address === signerAddress)

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

  const messages: readonly any[] = [sendMsg]

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

// export default submitMsgToFairychain


const s = app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
console.log('here')

const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))


test('do server hack', async (res) => {
  await sleep(1000 * 60 * 10 )
}, { timeout: 1000 * 60 * 10})