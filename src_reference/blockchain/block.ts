import adjustDifficulty, { DIFFICULTY } from './modules/difficulty';
import createHash from '../modules/hash';

class Block {

  public timestamp: number;
  public previousHash: string;
  public hash: string;
  public data: string;
  public nonce: number;
  public difficulty: number;

  constructor(
    timestamp: number,
    previousHash: string,
    hash: string,
    data: string,
    nonce: number,
    difficulty: number
  ) {
    this.timestamp = timestamp;
    this.previousHash = previousHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static getGenesis(): Block {
    const timestamp = (new Date(2023, 8, 20)).getTime(),
      previousHash = '',
      data = 'One World',
      hash = this.hash(timestamp, previousHash, data, 0, DIFFICULTY);
    return new this(timestamp, '', hash, data, 0, DIFFICULTY);
  }

  static mine(previousBlock: Block, data: string): Block {
    const previousHash = previousBlock.hash;
    let timestamp: number,
      hash: string,
      nonce: number = 0,
      difficulty: number = previousBlock.difficulty;

    do {
      timestamp = Date.now();
      nonce++;
      difficulty = adjustDifficulty(previousBlock, timestamp);
      hash = Block.hash(timestamp, previousHash, data, nonce, difficulty)
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

    return new this(timestamp, previousHash, hash, data, nonce, difficulty);
  }

  static hash(
    timestamp: number,
    previousHash: string,
    data: string,
    nonce: number,
    difficulty: number
  ): string {
    return createHash(`${timestamp} ${previousHash} ${data} ${nonce} ${difficulty}`);
  }

  toString(): string {
    const { timestamp, previousHash, hash, data, nonce } = this;
    return `Block -
    timestamp    : ${timestamp}
    previousHash : ${previousHash}
    hash         : ${hash}
    data         : ${data}
    nonce        : ${nonce}
    `
  }
}

export default Block;