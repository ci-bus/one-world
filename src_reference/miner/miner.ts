import Blockchain from "../blockchain/blockchain";
import P2PService, { MESSAGE } from "../service/p2p";
import Transaction from "../wallet/transaction";
import Wallet, { blockchainWallet } from "../wallet/wallet";

class Miner {

  private blockchain: Blockchain;
  private p2pservice: P2PService;
  private wallet: Wallet;

  constructor(blockchain: Blockchain, p2pservice: P2PService, wallet: Wallet) {
    this.blockchain = blockchain;
    this.p2pservice = p2pservice;
    this.wallet = wallet;
  }

  mine() {
    const memorypool = this.blockchain.memorypool;
    if (memorypool.transactions.length === 0) {
      throw(`There dont have unconfirmed transactions.`);
    }
    memorypool.addOrUpdate(Transaction.reward(this.wallet, blockchainWallet));
    const block = this.blockchain.addBlock(JSON.stringify(memorypool.transactions));
    this.p2pservice.sync();
    this.p2pservice.broadcast(MESSAGE.WIPE, memorypool.transactions);
    memorypool.wipe(memorypool.transactions);
  }
}