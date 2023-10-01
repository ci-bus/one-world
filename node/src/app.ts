import Block from "./blockchain/block";

const blockGenesis = Block.getGenesis();

console.log(blockGenesis.toString());

const block1 = Block.mine(blockGenesis, 'Primer bloque');
console.log(block1.toString());