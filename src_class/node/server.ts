import dgram, { Socket } from 'dgram';
import chalk from "chalk";
import { v4 as uuidv4 } from 'uuid';
import { logError, logOk } from "../libraries/utilities";
import { MessageType, TailMessage } from '../interfaces/message';
import { MessagesHelper } from '../libraries/messages';
import { NodeInfo, NodePeer } from '../interfaces/node';
import { NodeActions } from './actions';
import DataHelper from '../data/helper';

export class ServerUDP {

  // Node info
  nodeInfo: NodeInfo;
  // Socket udp dgram
  socket: Socket;
  // Messages helper with tail
  messagesHelper: MessagesHelper;
  // Peers data helper
  peers: DataHelper;
  // Actions functions
  actions: NodeActions;

  constructor(
    nodeInfo: NodeInfo
  ) {
    this.nodeInfo = nodeInfo;
  }

  static async create(nodeInfo: NodeInfo): Promise<ServerUDP> {
    const server = new ServerUDP(nodeInfo);
    await server.createSocket();
    server.peers = new DataHelper(`${nodeInfo.wallet}-peers`);
    server.actions = new NodeActions(server.peers);
    server.messagesHelper = new MessagesHelper(server, server.actions);
    await server.checkServer();
    return server;
  }

  async createSocket() {
    this.socket = dgram.createSocket('udp4');
    // On receive message from other node
    this.socket.on('message', (message: Buffer, rinfo: dgram.RemoteInfo) => {
      try {
        this.messagesHelper.receiveMessage(message.toString('utf8'), rinfo);
      } catch (error) {
        logError(`${error}`);
      }
    });
    // Init socket
    this.socket.bind({
      address: '0.0.0.0',
      port: this.nodeInfo.port,
      exclusive: true,
    });
  }

  async checkServer() {
    try {
      const checkResult: TailMessage = await this.messagesHelper.sendAndReceiveMessage(this.nodeInfo as NodePeer, {
        id: uuidv4(),
        timestamp: Date.now(),
        type: MessageType.ping
      });
      logOk(`Server UDP listening ${chalk.green(this.nodeInfo.host)}:${chalk.green(this.nodeInfo.port)} with ${chalk.green(checkResult.latency)}ms latency`);
      return true;
    } catch (error) {
      logError(`${error}`);
      logError(`The server is not accessible from outside.`);
      return false;
    }
  }
}
