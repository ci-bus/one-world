import Blockchain from '../blockchain/blockchain';
import { createHash, elliptic } from '../modules';
import Elliptic from 'elliptic';
import Transaction from './transaction';

const INITIAL_BALANCE = 100;

class Wallet {

  public blockchain: Blockchain;
  public balance: number;
  public keyPair: Elliptic.ec.KeyPair;
  public publicKey: string;

  constructor(blockchain: Blockchain) {
    this.balance = INITIAL_BALANCE;
    this.keyPair = elliptic.createKeyPair();
    this.publicKey = elliptic.getPublicKey(this.keyPair);
    this.blockchain = blockchain;
  }

  sign(data: any): Elliptic.ec.Signature {
    return this.keyPair.sign(createHash({ ...data }));
  }

  toString(): string {
    const { balance, publicKey } = this;
    return `Wallet -
    balance        : ${balance}
    publicKey      : ${publicKey?.toString()}
    `
  }

  createTransaction(recipientAddress: string, amount: number): Transaction {
    const { balance } = this;
    if (amount > balance) {
      throw (`Amount ${amount} exceeds current balance ${balance}.`);
    }
    let transaction = this.blockchain.memorypool.find(this.publicKey);
    if (transaction) {
      transaction.update(this, recipientAddress, amount);
    } else {
      transaction = Transaction.create(this, recipientAddress, amount);
      this.blockchain.memorypool.addOrUpdate(transaction);
    }
    return transaction;
  }

  calculateBalance() {
    const { blockchain: { blocks = [] }, publicKey } = this;
    let { balance } = this;
    let txs:Transaction[] = [];

    blocks.forEach(({ data = [] }) => {
      if (Array.isArray(data)) data.forEach((tx) => txs.push(tx));
    });

    const walletInputTxs = txs.filter((tx) => tx.input!.address === publicKey);
    let timestamp = 0;

    if (walletInputTxs.length > 0) {
      const recentInputTx = walletInputTxs
        .sort((a, b) => a.input!.timestamp - b.input!.timestamp)
        .pop();

      balance = recentInputTx!.outputs.find(({ address }) => address === publicKey)!.amount;
      timestamp = recentInputTx!.input!.timestamp;
    }

    txs
      .filter(({ input }) => input!.timestamp > timestamp)
      .forEach(({ outputs }) => {
        outputs.find(({ address, amount }) => {
          if (address === publicKey) balance += amount;
        });
      });

    return balance;
  }
}

const blockchainWallet = new Wallet(new Blockchain());

export { INITIAL_BALANCE, blockchainWallet };

export default Wallet;