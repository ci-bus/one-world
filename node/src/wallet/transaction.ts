import { v1 as uuidv1 } from 'uuid';
import Wallet from './wallet';
import { createHash, elliptic } from '../modules';
import Elliptic from 'elliptic';
import Blockchain from '../blockchain/blockchain';

const REWARD = 1;

export interface TransactionOutput {
  amount: number
  address: string
};

export interface TransactionSign {
  timestamp: number
  amount: number
  address: string
  signature: Elliptic.ec.Signature
}

class Transaction {
  public id: string;
  public input: TransactionSign | null;
  public outputs: TransactionOutput[];

  constructor() {
    this.id = uuidv1();
    this.input = null;
    this.outputs = [];
  }

  static verify(transaction: Transaction) {
    if (!transaction.input) {
      throw (`Missing transaction input sign.`);
    }
    const { input: { address, signature }, outputs } = transaction;
    return elliptic.verifySignature(address, signature, createHash(outputs));
  }

  static create(senderWallet: Wallet, recipientAddress: string, amount: number): Transaction {
    const { balance, publicKey } = senderWallet;
    if (amount > balance) {
      throw (`Amount: ${amount} exceeds balance.`);
    }
    const transaction = new Transaction();
    // Transaction outputs
    transaction.outputs.push(...[
      { amount: balance - amount, address: publicKey },
      { amount, address: recipientAddress }
    ]);
    transaction.input = Transaction.sign(transaction, senderWallet);
    return transaction;
  }

  static sign(transaction: Transaction, senderWallet: Wallet): TransactionSign {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(transaction.outputs),
    };
  }

  static reward(minerWallet: Wallet, blockchainWallet: Wallet) {
    return this.create(blockchainWallet, minerWallet.publicKey, REWARD);
  }

  update(senderWallet: Wallet, recipientAddress: string, amount: number): Transaction {
    const senderOutput = this.outputs.find((output) => output.address === senderWallet.publicKey);
    if (!senderOutput) {
      throw (`Missing output to address ${senderWallet.publicKey}.`);
    }
    if (amount > senderOutput.amount) {
      throw (`Amount: ${amount} exceeds balance.`);
    }
    senderOutput.amount -= amount;
    this.outputs.push({ amount, address: recipientAddress });
    this.input = Transaction.sign(this, senderWallet);
    return this;
  }
}

export { REWARD };

export default Transaction;