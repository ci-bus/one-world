import express from 'express';
import bodyParser from 'body-parser';

import Blockchain from '../blockchain/blockchain';
import P2PService, { MESSAGE } from './p2p';
import Wallet from '../wallet/wallet';

const { HTTP_PORT = 3000 } = process.env;

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet(blockchain);
const p2pService = new P2PService(blockchain);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
  res.json(blockchain.blocks);
});

app.post('/mine', (req, res) => {
  const { body: { data } } = req;
  const block = blockchain.addBlock(data);
  // Sync blocks with other nodes
  p2pService.sync();
  res.json({
    blocksLength: blockchain.blocks.length,
    block,
  });
});

app.get('/transactions', (req, res) => {
  res.json(blockchain.memorypool.transactions);
});

app.post('/transaction', (req, res) => {
  try {
    const { body: { recipient, amount }} = req;
    const transaction = wallet.createTransaction(recipient, amount);
    p2pService.broadcast(MESSAGE.TRANSACTIONS, transaction);
    res.json(transaction);
  } catch (error: any) {
    res.json({ error });
  }
});

app.listen(HTTP_PORT, () => {
  console.log(`Service http://localhost:${HTTP_PORT} listening...`);
  p2pService.listen();
});