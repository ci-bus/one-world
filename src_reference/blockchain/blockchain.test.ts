import Blockchain from './blockchain'
import Block from './block'

describe('Blockchain', () => {

  let blockchain: Blockchain;
  let tempBlockchain: Blockchain;

  beforeEach(() => {
    blockchain = new Blockchain();
    tempBlockchain = new Blockchain();
  });

  it('blockchain has a genesis block', () => {
    const [genesisBlock] = blockchain.blocks;
    expect(genesisBlock).toEqual(Block.getGenesis());
    expect(blockchain.blocks.length).toEqual(1);
  });

  it('use addBlock()', () => {
    const data = 'testing-data';
    blockchain.addBlock(data);

    const [ ,lastBlock] = blockchain.blocks;
    expect(lastBlock.data).toEqual(data);
    expect(blockchain.blocks.length).toEqual(2);
  });

  it('validate a valid chain', () => {
    blockchain.addBlock('testing-data');
    blockchain.addBlock('testing-data-2');
    expect(Blockchain.validate(blockchain.blocks)).toEqual(true);
  });

  it('invalidate a chain with a corrupt genesis block', () => {
    blockchain.blocks[0].data = 'fake-data';
    expect(() => {
      Blockchain.validate(blockchain.blocks);
    }).toThrowError('Invalid Genesis block.');
  });

  it('invalidate a chain with a corrupt previousHash', () => {
    blockchain.addBlock('testing-data');
    blockchain.blocks[1].previousHash = 'fake-previousHash';
    expect(() => {
      Blockchain.validate(blockchain.blocks);
    }).toThrowError('Invalid previous hash.');
  });

  it('invalidate a chain with a corrupt hash', () => {
    blockchain.addBlock('testing-data');
    blockchain.blocks[1].hash = 'fake-hash';
    expect(() => {
      Blockchain.validate(blockchain.blocks);
    }).toThrowError('Invalid hash.');
  });

  it('replace the chain', () => {
    tempBlockchain.addBlock('testing-data');
    blockchain.replace(tempBlockchain.blocks);
    expect(blockchain.blocks).toEqual(tempBlockchain.blocks);
  });

  it('does not replace the chain with less blocks', () => {
    blockchain.addBlock('testing-data');
    expect(() => {
      blockchain.replace(tempBlockchain.blocks);
    }).toThrowError('Receive chain is not longer that current chain.')
  });

  it('does not replace the chain with invalid chain', () => {
    tempBlockchain.addBlock('testing-data');
    tempBlockchain.blocks[1].data = 'fake-data';
    expect(() => {
      blockchain.replace(tempBlockchain.blocks);
    }).toThrowError('Received chain is invalid.');
  });

});