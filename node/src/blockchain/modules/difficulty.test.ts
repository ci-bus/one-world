import Block from "../block";
import adjustDifficulty from "./difficulty";

describe('Block', () => {

  let block: Block;

  beforeEach(() => {
    block = Block.getGenesis();
    block.timestamp = Date.now();
  });

  it('lowers the difficulty for slowly mined blocks', () => {
    expect(adjustDifficulty(block, block.timestamp + 30000)).toEqual(block.difficulty - 1);
  });

  it('increased the difficulty for quick mined blocks', () => {
    expect(adjustDifficulty(block, block.timestamp + 300)).toEqual(block.difficulty + 1);
  });

});