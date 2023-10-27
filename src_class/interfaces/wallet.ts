import Elliptic from 'elliptic';

export interface Wallet {
  publicKey: string // La clave publica es la dirección de la wallet
  keyPair?: Elliptic.ec.KeyPair // Conjunto de claves
}