/* eslint-disable */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { Client } from 'fairyring-client-ts'
import { SigningStargateClient } from '@cosmjs/stargate'

const rpcUrl = 'https://testnet-rpc.fairblock.network'

const doAsync = async () => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic('')
  const [firstAccount] = await wallet.getAccounts()

  const signingClient = await SigningStargateClient.connectWithSigner(rpcUrl, wallet)

  const c = new Client(
    {
      apiURL: 'https://testnet-api.fairblock.network',
      rpcURL: rpcUrl,
    },
    wallet as any
  )

  const msg = c.CosmosBankV1Beta1.tx.msgSend({
    value: {
      fromAddress: 'sender_address',
      toAddress: 'recipient_address',
      amount: [{ denom: 'uatom', amount: '100000' }],
    },
  })

  const subimittedEncryptedTx = await c.FairyringPep.tx.msgSubmitEncryptedTx({
    value: {
      creator: '',
      data: '',
      targetBlockHeight: 0,
    },
  })

}


// doAsync();
export { doAsync }
