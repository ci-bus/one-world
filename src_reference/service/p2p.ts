import WebSocket from 'ws';
import Blockchain from '../blockchain/blockchain';
import Transaction from '../wallet/transaction';

const { P2P_PORT = 5000, PEERS } = process.env;
const peers = PEERS ? PEERS.split(',') : [];
const MESSAGE = {
  BLOCKS: 'blocks',
  TRANSACTIONS: 'transactions',
  WIPE: 'wipe'
};

class P2PService {

  blockchain: Blockchain;
  sockets: WebSocket[];

  constructor(blockchain: Blockchain) {
    this.blockchain = blockchain;
    this.sockets = [];
  }

  listen() {
    // Create server
    const port = P2P_PORT as number | undefined;
    const server = new WebSocket.Server({ port });
    server.on('connection', (socket) => {
      this.onConnection(socket)
    });
    // Connect to other nodes
    for (let peer of peers) {
      const socket = new WebSocket(peer);
      socket.on('open', () => {
        this.onConnection(socket)
      });
    }
    console.log(`Service ws://localhost:${P2P_PORT} listening...`);
  }

  onConnection(socket: WebSocket) {
    // Add socket
    this.sockets.push(socket);
    // Subscribe to receive messages
    socket.on('message', (message: string) => {
      const { type, value } = JSON.parse(message);
      console.log(`[ws:message]`, { type, value });
      try {
        switch (type) {
          case MESSAGE.BLOCKS:
            this.blockchain.replace(value);
            break;
          case MESSAGE.TRANSACTIONS:
            this.blockchain.memorypool.addOrUpdate(value);
            break;
          case MESSAGE.WIPE:
            this.blockchain.memorypool.wipe(value as Transaction[]);
          default:
            throw (`Unknown message type: ${type}.`);
        }

      } catch (error) {
        console.log(`[ws:message]`, error);
        throw (error);
      }
    });
    // Send blocks
    const message: string = JSON.stringify({
      type: MESSAGE.BLOCKS, value: this.blockchain.blocks
    });
    socket.send(message);
    console.log(`[ws:socket] connected`);
  }

  sync() {
    this.broadcast(MESSAGE.BLOCKS, this.blockchain.blocks);
  }

  broadcast(type: string, value: any) {
    const message: string = JSON.stringify({ type, value });
    for (let socket of this.sockets) {
      socket.send(message);
    }
    console.log(`[ws:broadcast] ${type}`);
  }
}

export { MESSAGE };

export default P2PService;