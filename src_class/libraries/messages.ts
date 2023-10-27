import { RemoteInfo } from "dgram";
import { BaseMessage } from "../interfaces/message";
import { PeerNode } from "../interfaces/node";
import { logInfo } from "./utilities";
import { ServerUDP } from "../node/server";
import chalk from "chalk";

export interface TailMessage extends BaseMessage {
  peer: PeerNode
  ok: Function
  fail: Function
  retries: number
  latency?: number
}

export class MessagesHelper {

  // Messages tail
  messages: TailMessage[] = [];
  // UDP server
  server: ServerUDP;
  // Interval to check timeouts
  private interval: NodeJS.Timeout;
  // Timeout
  private timeout: number;
  // Retries sending messages
  private retries: number;
  // Control to not check timeouts receiving messages
  private receiving: boolean;

  constructor(
    server: ServerUDP
  ) {
    this.server = server;
    this.timeout = parseInt(process.env.MESSAGES_TIMEOUT as string) || 1000;
    this.retries = parseInt(process.env.MESSAGE_RETRIES as string) || 3;
    this.createInterval();
  }

  createInterval() {
    const timeloop = this.timeout / 10 | 0;
    this.interval = setInterval(() => {
      this.checkTimeouts();
    }, timeloop);
  }

  async sendAndReceiveMessage(peer: PeerNode, message: BaseMessage): Promise<TailMessage> {
    return new Promise((ok, fail) => {
      this.messages.push({
        ...message,
        peer,
        ok, fail,
        retries: 1
      });
      this.sendMessage(message, peer.port, peer.host);
    });
  }

  sendMessage(message: BaseMessage, port: number, host: string) {
    const messageStr = JSON.stringify(message);
    this.server.socket.send(messageStr, port, host);
    logInfo(`Message type ${chalk.cyan(message.type)} sended to ${chalk.cyan(host)}:${chalk.cyan(port)}`);
  }

  receiveMessage(message: string, remoteInfo: RemoteInfo) {
    this.receiving = true;
    const messageObj: BaseMessage = JSON.parse(message);
    const tailMsgIndex: number = this.messages.findIndex(
      message => message.id === messageObj.id
    );
    if (tailMsgIndex !== -1) {
      const tailMsg = this.messages[tailMsgIndex];
      if (tailMsg.peer.host !== remoteInfo.address) {
        tailMsg.fail(`Host ${tailMsg.peer.host} !== ${remoteInfo.address}`);
      } else if (tailMsg.timestamp > messageObj.timestamp) {
        tailMsg.fail(`Received timestamp is earlier thant sent`);
      } else {
        this.messages.splice(tailMsgIndex, 1);
        tailMsg.latency = messageObj.timestamp - tailMsg.timestamp;
        tailMsg.ok(tailMsg);
      }
    }
    this.receiving = false;
  }

  checkTimeouts() {
    if (!this.receiving) {
      for (let i = this.messages.length - 1; i >= 0; i--) {
        const tailMessage = this.messages[i];
        if (tailMessage.timestamp < Date.now() - this.timeout) {
          const { peer, ok, fail, retries, ...message } = tailMessage;
          if (tailMessage.retries < this.retries) {
            // Send message again
            tailMessage.timestamp = Date.now();
            this.sendMessage(message, peer.port, peer.host);
            this.messages[i].retries++;
          } else {
            // Remove message
            fail(`The message ${chalk.red(tailMessage.type)} sent to ${chalk.red(peer.host)}:${chalk.red(peer.port)} was not replied to.`);
            this.messages.splice(i, 1);
          }
        }
      }
    }
  }
}