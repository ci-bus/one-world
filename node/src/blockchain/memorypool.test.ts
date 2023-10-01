import Wallet from "../wallet/wallet";
import Transaction from "../wallet/transaction";
import Blockchain from "./blockchain";

describe('Memorypool', () => {

  let blockchain: Blockchain;
  let wallet: Wallet;
  let transaction: Transaction;

  beforeEach(() => {
    blockchain = new Blockchain();
    wallet = new Wallet(blockchain);
    transaction = Transaction.create(wallet, 'testing-address', 5);
    blockchain.memorypool.addOrUpdate(transaction);
  });

  it('has one transaction', () => {
    expect(blockchain.memorypool.transactions.length).toEqual(1);
  });

  it('adds a transaction to the memorypool', () => {
    const found = blockchain.memorypool.transactions.find(({ id }) => id === transaction.id);
    expect(found).toEqual(transaction);
  });

  it('updates a transaction in the memorypool', () => {
    const oldTransaction = JSON.stringify(transaction);
    transaction.update(wallet, 'testing-address-2', 10);
    blockchain.memorypool.addOrUpdate(transaction);
    expect(blockchain.memorypool.transactions.length).toEqual(1);
    const found = blockchain.memorypool.transactions.find(({ id }) => id === transaction.id);
    expect(JSON.stringify(found)).not.toEqual(oldTransaction);
    expect(found).toEqual(transaction);
  });

  it('wipe transactions', () => {
    blockchain.memorypool.wipe(blockchain.memorypool.transactions);
    expect(blockchain.memorypool.transactions.length).toEqual(0); 
  })

});