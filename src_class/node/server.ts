import dgram, { Socket } from 'dgram';
import chalk from "chalk";
import { v4 as uuidv4 } from 'uuid';
import { logError, logOk } from "../libraries/utilities";
import { BaseMessage, MessageType } from '../interfaces/message';
import { MessagesHelper, TailMessage } from '../libraries/messages';
import { InfoNode, PeerNode } from '../interfaces/node';

export class ServerUDP {

  // Node info
  nodeInfo: InfoNode;
  // Socket udp dgram
  socket: Socket;
  // Messages helper with tail
  messagesHelper: MessagesHelper;

  constructor(
    nodeInfo: InfoNode
  ) {
    this.nodeInfo = nodeInfo;
  }

  static async create(nodeInfo: InfoNode): Promise<ServerUDP> {
    const server = new ServerUDP(nodeInfo);
    await server.createSocket();
    server.messagesHelper = new MessagesHelper(server);
    await server.checkServer();
    return server;
  }

  async createSocket() {
    this.socket = dgram.createSocket('udp4');
    // On receive message from other node
    this.socket.on('message', (message: Buffer, rinfo: dgram.RemoteInfo) => {
      try {
        const messageObj: BaseMessage = JSON.parse(message.toString('utf8'));
        //conditionalStatement(this.socket, message, rinfo, new DataHelper());
        switch (messageObj.type) {
          case MessageType.ping:
            const response: BaseMessage = {
              id: messageObj.id,
              timestamp: Date.now(),
              type: MessageType.pong
            };
            this.messagesHelper.sendMessage(response, rinfo.port, rinfo.address);
            break;
          default:
            this.messagesHelper.receiveMessage(message.toString('utf8'), rinfo);
            break;
        }
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

  async checkServer(count: number = 1) {
    try {
      const checkResult: TailMessage = await this.messagesHelper.sendAndReceiveMessage(this.nodeInfo as PeerNode, {
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
