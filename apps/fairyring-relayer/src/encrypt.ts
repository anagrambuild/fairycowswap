const encryptSignedTxForFairyring = (
    targetBlockHeight: string,
    publicKey: string,
    plainText: string,
) => {

    const { spawnSync } = require( 'child_process' );
    const ls = spawnSync( './binaries/encrypter', [ targetBlockHeight, publicKey, plainText ] );
    
    console.log( `stderr: ${ ls.stderr.toString() }` );
    console.log( `stdout: ${ ls.stdout.toString() }` );

    const maybeEncryptedResult: string = ls.stdout.toString()
    return maybeEncryptedResult.trim();
}

export {
    encryptSignedTxForFairyring,
}