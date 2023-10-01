import Transaction, { REWARD } from "./transaction";
import Wallet from "./wallet";
import Blockchain from "../blockchain/blockchain";

describe('Transaction', () => {

  let blockchain: Blockchain;
  let wallet: Wallet;
  let transaction: Transaction;
  let amount: number;
  let recipientAddress: string;

  beforeEach(() => {
    blockchain = new Blockchain();
    wallet = new Wallet(blockchain);
    recipientAddress = 'testing-recipient';
    amount = 5;
    transaction = Transaction.create(wallet, recipientAddress, amount);
  });

  it('output the amount subtracted from the wallet balance', () => {
    const output = transaction.outputs.find(({ address }) => address === wallet.publicKey);
    expect(output?.amount).toEqual(wallet.balance - amount);
  });

  it('outputs the amount added to the recipient', () => {
    const output = transaction.outputs.find(({ address }) => address === recipientAddress);
    expect(output?.amount).toEqual(amount);
  });

  describe('transacting with an amount that exceeds he balance', () => {
    beforeEach(() => {
      amount = 200;
    });
    it('does not create the transaction', () => {
      expect(() => {
        transaction = Transaction.create(wallet, recipientAddress, amount)
      }).toThrowError(`Amount: ${amount} exceeds balance.`);
    });
  });

  it('inputs the balance of the wallet', () => {
    expect(transaction.input?.amount).toEqual(wallet.balance);
  });

  it('inputs the sender address of the wallet', () => {
    expect(transaction.input?.address).toEqual(wallet.publicKey);
  });

  it('inputs has a signature sign the wallet', () => {
    expect(typeof transaction.input?.signature).toEqual('object');
    expect(transaction.input?.signature).toEqual(wallet.sign(transaction.outputs));
  });

  it('use sign', () => {
    const signature = wallet.sign('testing-sign');
    expect(typeof signature).toEqual('object');
    expect(signature).toEqual(wallet.sign('testing-sign'));
  });


  it('invalidates a corrupt transaction', () => {
    transaction.outputs[0].amount = 100;
    expect(Transaction.verify(transaction)).toBe(false);
  });

  it('input sign is missing', () => {
    transaction.input = null;
    expect(() => {
      Transaction.verify(transaction);
    }).toThrowError(`Missing transaction input sign.`);
  });

  it('validates a valid transaction', () => {
    const result = Transaction.verify(transaction);
    expect(result).toBe(true);
  });

  describe('update a transaction', () => {
    let nextAmount: number;
    let nextRecipient: string;

    beforeEach(() => {
      nextAmount = 3;
      nextRecipient = 'testing-update-transaction';
      transaction = transaction.update(wallet, nextRecipient, nextAmount);
    });

    it('validates a updated valid transaction', () => {
      const result = Transaction.verify(transaction);
      expect(result).toBe(true);
    });

    it('subtracts the next amount from the sender wallet', () => {
      const output = transaction.outputs.find(({ address }) => address === wallet.publicKey);
      expect(output?.amount).toEqual(wallet.balance - amount - nextAmount);
    });

    it('outputs an amount for the next recipient', () => {
      const output = transaction.outputs.find(({ address }) => address === nextRecipient);
      expect(output?.amount).toEqual(nextAmount);
    });

    it('does not find sender wallet output', () => {
      wallet.publicKey = 'fake-public-key';
      expect(() => {
        transaction = transaction.update(wallet, nextRecipient, nextAmount);
      }).toThrowError(`Missing output to address ${wallet.publicKey}.`);
    });
  });

  describe('creating reward transaction', () => {
    let blockchain: Blockchain;
    let wallet: Wallet;
    let blockchairWallet: Wallet;
    let transaction: Transaction;

    beforeEach(() => {
      blockchain = new Blockchain();
      wallet = new Wallet(blockchain);
      blockchairWallet = new Wallet(blockchain);
      transaction = Transaction.reward(wallet, blockchairWallet)
    });

    it('reward the miners wallet', () => {
      expect(transaction.outputs.length).toEqual(2);
      let output = transaction.outputs.find(({ address }) => address === wallet.publicKey);
      expect(output?.amount).toEqual(REWARD);
      output = transaction.outputs.find(({ address }) => address === blockchairWallet.publicKey);
      expect(output?.amount).toEqual(blockchairWallet.balance - REWARD);
    })
  })
});