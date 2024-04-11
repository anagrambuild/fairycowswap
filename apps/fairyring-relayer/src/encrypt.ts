import { timelockEncrypt } from 'ts-ibe'

const encryptSignedTxForFairyring = async (targetBlockHeight: string, publicKey: string, plainText: string) => {
  const s = await timelockEncrypt(
    targetBlockHeight,
    publicKey,
    new TextEncoder().encode(plainText)
  )
  return s

//   const { spawnSync } = require('child_process')
//   const ls = spawnSync('./binaries/encrypter', [targetBlockHeight, publicKey, plainText])
//   console.log(`stderr: ${ls.stderr.toString()}`)
//   console.log(`stdout: ${ls.stdout.toString()}`)
//   const maybeEncryptedResult: string = ls.stdout.toString()
//   return maybeEncryptedResult.trim()
}

export { encryptSignedTxForFairyring }
