import Elliptic from 'elliptic';
const ec = new Elliptic.ec('secp256k1');

export default {
  createKeyPair: (): Elliptic.ec.KeyPair => {
    return ec.genKeyPair();
  },
  getPublicKey: (keyPair: Elliptic.ec.KeyPair): string => {
    return keyPair.getPublic().encode('hex', false);
  },
  verifySignature: (publicKey: string, signature: Elliptic.ec.Signature, data: string): boolean => {
    return ec.keyFromPublic(publicKey, 'hex').verify(data, signature);
  }
}
