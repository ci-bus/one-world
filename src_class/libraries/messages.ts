import { RemoteInfo } from "dgram";
import { MessageBase, MessageType, TailMessage } from "../interfaces/message";
import { NodeAddress, NodeInfo } from "../interfaces/node";
import { logError, logInfo } from "./utilities";
import { ServerUDP } from "../node/server";
import chalk from "chalk";
import { NodeActions } from "../node/actions";

export class MessagesHelper {

  // Messages tail
  messages: TailMessage[] = [];
  // UDP server
  server: ServerUDP;
  // Interval to check timeouts
  interval: NodeJS.Timeout;
  // Timeout
  private timeout: number;
  // Retries sending messages
  private retries: number;
  // Control to not check timeouts receiving messages
  private receiving: boolean;
  // Actions to proccess messages and response
  private actions: NodeActions;

  constructor(
    server: ServerUDP,
    actions: NodeActions
  ) {
    this.server = server;
    this.actions = actions;
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

  async sendAndReceiveMessage(node: NodeAddress, message: MessageBase): Promise<TailMessage> {
    return new Promise((ok, fail) => {
      this.messages.push({
        ...message,
        node,
        ok, fail,
        retries: 1
      });
      this.sendMessage(message, node.port, node.host);
    });
  }

  sendMessage(message: MessageBase, port: number, host: string) {
    const messageStr = JSON.stringify(message);
    this.server.socket.send(messageStr, port, host);
    logInfo(`Message type ${chalk.cyan(message.type)} sended to ${chalk.cyan(host)}:${chalk.cyan(port)}`);
  }

  receiveMessage(message: string, rInfo: RemoteInfo) {
    this.receiving = true;
    try {
      const messageObj: MessageBase = JSON.parse(message);
      const tailMsgIndex: number = this.messages.findIndex(
        message => message.id === messageObj.id
      );
      if (tailMsgIndex !== -1) {
        const tailMsg = this.messages[tailMsgIndex];
        if (tailMsg.node.host !== rInfo.address) {
          tailMsg.fail(`Host ${tailMsg.node.host} !== ${rInfo.address}`);
        } else if (tailMsg.timestamp > messageObj.timestamp) {
          tailMsg.fail(`Received timestamp is earlier thant sent`);
        } else if (messageObj.type == MessageType.error) {
          tailMsg.fail(messageObj.data);
          this.messages.splice(tailMsgIndex, 1);
        } else {
          tailMsg.latency = messageObj.timestamp - tailMsg.timestamp;
          tailMsg.ok({
            ...tailMsg,
            ...messageObj
          });
          this.messages.splice(tailMsgIndex, 1);
        }
      } else {
        const response = this.actions.processMessage(messageObj, this.server);
        if (response) {
          this.sendMessage(response, rInfo.port, rInfo.address);
        }
      }
    } catch (error) {
      logError(`${rInfo.address}:${rInfo.port} ${error}`);
    }
    this.receiving = false;
  }

  checkTimeouts() {
    if (!this.receiving) {
      for (let i = this.messages.length - 1; i >= 0; i--) {
        const tailMessage = this.messages[i];
        if (tailMessage.timestamp < Date.now() - this.timeout) {
          const { node, ok, fail, retries, ...message } = tailMessage;
          if (tailMessage.retries < this.retries) {
            // Send message again
            tailMessage.timestamp = Date.now();
            this.sendMessage(message, node.port, node.host);
            this.messages[i].retries++;
          } else {
            // Remove message
            fail(`The message ${chalk.red(tailMessage.type)} sent to ${chalk.red(node.host)}:${chalk.red(node.port)} was not replied to.`);
            this.messages.splice(i, 1);
          }
        }
      }
    }
  }
}