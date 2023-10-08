import Wallet, { INITIAL_BALANCE } from "./wallet";
import Blockchain from "../blockchain/blockchain";
import Transaction from "./transaction";

describe('Wallet', () => {

  let blockchain: Blockchain;
  let wallet: Wallet;

  beforeEach(() => {
    blockchain = new Blockchain();
    wallet = new Wallet(blockchain);
  });

  it('it is a healthy wallet', () => {
    expect(wallet.balance).toEqual(INITIAL_BALANCE);
    expect(typeof wallet.keyPair).toEqual('object');
    expect(typeof wallet.publicKey).toEqual('string');
    expect(wallet.publicKey.length).toEqual(130);
  });

  describe('creating a transaction', () => {
    let transaction: Transaction;
    let recipientAddress: string;
    let amount: number;

    beforeEach(() => {
      recipientAddress = 'testing-address';
      amount = 5;
      transaction = wallet.createTransaction(recipientAddress, amount);
    });

    describe('create the same transaction', () => {
      beforeEach(() => {
        transaction = wallet.createTransaction(recipientAddress, amount);
      });

      it('double the amount subtracted from the wallet balance', () => {
        const output = transaction.outputs.find(({ address }) => address === wallet.publicKey);
        expect(output?.amount).toEqual(wallet.balance - amount * 2);
      });

      it('clones the amount output for the recipient', () => {
        const amounts = transaction.outputs
          .filter(({ address }) => address === recipientAddress)
          .map(output => output.amount);
        expect(amounts).toEqual([amount, amount]);
      });
    });
  });

});