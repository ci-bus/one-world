import Transaction from "../wallet/transaction";

class Memorypool {
  public transactions: Transaction[];

  constructor () {
    this.transactions = [];
  }

  addOrUpdate(transaction: Transaction) {
    if (!Transaction.verify(transaction)) {
      throw(`Invalid transaction from ${transaction.input?.address}.`);
    }
    const { input, outputs } = transaction;
    const outputTotal = outputs.reduce((total, output) => total + output.amount, 0);
    if (input?.amount !== outputTotal) {
      throw(`Invalid transaction from ${input?.address}.`);
    }
    const index = this.transactions.findIndex(({ id }) => id === transaction.id);
    if (index >= 0) {
      this.transactions[index] = transaction;
    } else {
      this.transactions.push(transaction);
    }
  }

  find(address: string): Transaction | undefined {
    return this.transactions.find(({ input }) => input?.address === address);
  }

  wipe(transactions: Transaction[]) {
    this.transactions = this.transactions.filter(
      transaction => !transactions.find(transaction2 => transaction2.id === transaction.id)
    );
  }
}

export default Memorypool;