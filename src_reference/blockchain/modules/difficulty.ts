import Block from "../block";

const MINE_RATE = 3000;

export const DIFFICULTY = 3;

export default (previousBlock: Block, timestamp: number): number => {
  return previousBlock.timestamp + MINE_RATE > timestamp
    ? previousBlock.difficulty + 1
    : previousBlock.difficulty - 1;
};