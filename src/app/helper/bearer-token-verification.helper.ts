// Based on git://github.com/Gnafu/keycloak-lambda-authorizer.git
import {isValidBase64String} from "./base64.helper";
import {decodeBearerToken} from "./bearer-token-decoding.helper";

const jose= require('node-jose');
const b64u= require('base64url');
const pAny = require('p-any');
const { pki } = require('node-forge');
const log  = require('loglevel');
log.setLevel("trace");

export function verifyBearerToken(jwt: string, secretOrPublicKeyString: string, base64Secret = false): Promise<boolean> {
    // Prüft ob das Token aus validen Base64 Strings besteht
    if(!isToken(jwt)) {
        return Promise.resolve(false);
    }

    // Das Token wird dekodiert
    const decoded = decodeBearerToken(jwt);

    // @ts-ignore
    if(!decoded.header.alg) {
        return Promise.resolve(false);
    }

    return getJoseKey(decoded.header, secretOrPublicKeyString, base64Secret).then(
        key => {
            return jose.JWS.createVerify(key)
                .verify(jwt)
                .then(() => true, () => false);
        }, e => {
            log.warn('Could not verify token, ' +
                'probably due to bad data in it or the keys: ', e);
            return false;
        }
    );
}

function getJoseKey(header: any, key: string, base64Secret: boolean): Promise<string> {
    if(header.alg.indexOf('HS') === 0) {
        return jose.JWK.asKey({
            kty: 'oct',
            use: 'sig',
            alg: header.alg,
            k: paddedKey(key, header.alg, base64Secret)
        });
    } else {
        if(header.alg.indexOf('RS') === 0) {
            key = plainRsaKeyToX509Key(key);
        }

        return pAny(['json'].map(form => {
            try {
                return jose.JWK.asKey(key, form);
            } catch(e) {
                return Promise.reject(e);
            }
        }));
    }
}

function isToken(jwt: string, checkTypClaim = false) {
    const decoded = decodeBearerToken(jwt);

    if(decoded.errors) {
        return false;
    }

    // @ts-ignore
    if(checkTypClaim && decoded.header.typ !== 'JWT') {
        return false;
    }

    const split = jwt.split('.');
    let valid = true;
    split.forEach(s => valid = valid && isValidBase64String(s, true));

    return valid;
}

// node-jose does not support keys shorter than block size. This is a
// limitation from their implementation and could be resolved in the future.
// See: https://github.com/cisco/node-jose/blob/master/lib/jwk/octkey.js#L141
function paddedKey(key: string, alg: string, base64Secret: boolean) {
    const blockSizeBytes = alg.indexOf('256') !== -1 ? 512 / 8 : 1024 / 8;

    let buf = base64Secret ? Buffer.from(key, 'base64') : Buffer.from(key);

    if(buf.length < blockSizeBytes) {
        const oldBuf = buf;
        buf = Buffer.alloc(blockSizeBytes);
        buf.set(oldBuf);
    }

    return b64u.encode(buf);
}

/*
 * This function handles plain RSA keys not wrapped in a
 * X.509 SubjectPublicKeyInfo structure. It returns a PEM encoded public key
 * wrapper in that structure.
 * See: https://stackoverflow.com/questions/18039401/how-can-i-transform-between-the-two-styles-of-public-key-format-one-begin-rsa
 * @param {String} publicKey The public key as a PEM string.
 * @returns {String} The PEM encoded public key in
 *                   X509 SubjectPublicKeyInfo format.
 */
function plainRsaKeyToX509Key(key: string) {
    try {
        const startTag = '-----BEGIN RSA PUBLIC KEY-----';
        const endTag = '-----END RSA PUBLIC KEY-----';
        const startTagPos = key.indexOf(startTag);
        const endTagPos = key.indexOf(endTag);

        return startTagPos !== -1 && endTagPos !== -1 ?
            pki.publicKeyToPem(pki.publicKeyFromPem(key)) :
            key;
    } catch(e) {
        // If anything fails, it may not be a plain RSA key, so return the same key.
        return key;
    }
}
