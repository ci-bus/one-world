import Block from './block';
import Memorypool from './memorypool';

class Blockchain {

  public blocks: Block[];
  public memorypool: Memorypool;

  constructor() {
    this.blocks = [Block.getGenesis()];
    this.memorypool = new Memorypool();
  }

  static validate (allBlocks: Block[]): boolean {
    const [genesisBlock, ...blocks] = allBlocks;
    if (JSON.stringify(genesisBlock) !== JSON.stringify(Block.getGenesis())) {
      throw('Invalid Genesis block.');
    }
    for (let i = 0; i < blocks.length; i += 1) {
      const {
        timestamp, previousHash, hash, data, nonce, difficulty
      } = blocks[i];
      const previousBlock = allBlocks[i];
      if (previousHash !== previousBlock.hash) {
        throw('Invalid previous hash.');
      }
      if (hash !== Block.hash(timestamp, previousHash, data, nonce, difficulty)) {
        throw('Invalid hash.');
      }
    }
    return true;
  }

  addBlock(jsonTransactions: string): Block {
    const previousBlock = this.blocks[this.blocks.length - 1];
    const block = Block.mine(previousBlock, jsonTransactions);
    this.blocks.push(block);
    return block;
  }

  replace(newBlocks: Block[]): Block[] {
    if (newBlocks.length < this.blocks.length) {
      throw('Receive chain is not longer that current chain.')
    }
    try {
      Blockchain.validate(newBlocks);
    } catch (error) {
      throw('Received chain is invalid.');
    }
    this.blocks = newBlocks;
    return this.blocks;
  }
}

export default Blockchain;