import Block from './block'
import { DIFFICULTY } from './modules/difficulty';

describe('Block', () => {

  let timestamp: number;
  let previousBlock: Block;
  let hash: string;
  let data: string;
  let nonce: number;
  let difficulty: number;

  beforeEach(() => {
    timestamp = new Date(2023, 7, 20).getTime();
    previousBlock = Block.getGenesis();
    hash = 'testing-hash';
    data = 'testing-data';
    nonce = 64;
    difficulty = DIFFICULTY;
  });

  it('create an instance with parameters', () => {
    const block = new Block(timestamp, previousBlock.hash, hash, data, nonce, difficulty);
    expect(block.timestamp).toEqual(timestamp);
    expect(block.previousHash).toEqual(previousBlock.hash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
    expect(block.nonce).toEqual(nonce);
    expect(block.difficulty).toEqual(difficulty);
  });

  it('use static mine()', () => {
    const block = Block.mine(previousBlock, data);
    expect(block.hash.length).toEqual(64);
    expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
    expect(block.previousHash).toEqual(previousBlock.hash);
    expect(block.nonce).not.toEqual(0);
    expect(block.data).toEqual(data);
  });

  it('use static hash()', () => {
    hash = Block.hash(timestamp, previousBlock.hash, data, 1, difficulty);
    const hastOutput = '99dff0f2d583af758db03efe25ece4257256e4b22e22189af4c40c6135fde64d';
    expect(hash).toEqual(hastOutput);
  });

  it('use toString()', () => {
    const block = Block.mine(previousBlock, data);
    expect(typeof block.toString()).toEqual('string');
  });

});