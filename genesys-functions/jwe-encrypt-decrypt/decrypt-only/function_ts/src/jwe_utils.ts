'use strict';

// Import needed built in and external libraries.
import { Buffer } from 'node:buffer';
import { JWK, JWE, parse } from 'node-jose';

async function jweEncrypt(jwePublicKey: string, textToEncrypt: string): Promise<string> {
    const alg = 'RSA-OAEP';
    const enc = 'A256GCM';  
    const encFormat = 'compact';

    // Test for undefined, null or empty string
    if (!jwePublicKey) {
        throw new Error('Unset JWE PUBLIC KEY');
    }
    if (!textToEncrypt) {
        throw new Error('No text to process');
    }

    // Input and parse the RSA Public Key
    let publicKey = Buffer.from(jwePublicKey).toString('utf8');
    let pemPublicKey = await JWK.asKey(publicKey, "pem");
    const buffer = Buffer.from(textToEncrypt);
    const encrypted = await JWE.createEncrypt({ format: encFormat, contentAlg: enc, fields: { alg: alg } }, pemPublicKey).update(buffer).final();
    
    return encrypted;
}

async function jweDecrypt(jwePrivateKey: string, textToDecrypt: string): Promise<string> {
    // Test for undefined, null or empty string
    if (!jwePrivateKey) {
        throw new Error('Unset JWE PRIVATE KEY');
    }
    if (!textToDecrypt) {
        throw new Error('No text to process');
    }

    const encryptedPayload = Buffer.from(textToDecrypt).toString('utf8');
    let keystore = JWK.createKeyStore();
    await keystore.add(await JWK.asKey(jwePrivateKey, 'pem'));
    let output = parse.compact(encryptedPayload);
    let decryptedVal = await output.perform(keystore);
    let decrypted = Buffer.from((decryptedVal as JWE.DecryptResult).plaintext).toString();

    return decrypted;
}

/*
------------------------------------------------------------------------------
* Module Exports
------------------------------------------------------------------------------
*/

export {
    jweEncrypt,
    jweDecrypt
}