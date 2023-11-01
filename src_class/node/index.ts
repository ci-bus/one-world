import readline from 'readline';
import DataHelper from "../data/helper";
import { NodeAddress, NodeInfo, NodePeer } from "../interfaces/node";
import { ServerUDP } from "./server";
import { MessageBase, MessageType } from '../interfaces/message';
import { randomUUID } from 'crypto';
import { getGeoIp, getLatency, logError, logOk } from '../libraries/utilities';
import { GeoLocation } from '../interfaces/utilities';
import chalk from 'chalk';

const consoleReadline = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export class CryptoNode {

  // Info
  info: NodeInfo;
  // Peers nodes
  peersData: DataHelper;
  // Server with socket UDP
  server: ServerUDP;

  constructor() { }

  static async create(info: NodeInfo) {
    const node = new CryptoNode();
    node.info = info;
    node.peersData = new DataHelper(`${info.wallet}-peers`, '');
    node.server = await ServerUDP.create(node);
    node.initConsole();
    return node;
  }

  initConsole() {
    consoleReadline.question('\n$ ', async command => {
      const parts = command.split(' ');
      try {
        switch (parts[0]) {
          case 'connect':
            // Node info to connect
            const node: NodeAddress = {
              host: parts[1],
              port: parseInt(parts[2]),
            };
            const geoLocation: GeoLocation = await getGeoIp(parts[1]);
            const latency: number = await getLatency(this.server, node);
            // This node info
            const thisNode: NodePeer = {
              ...this.info,
              geoLocation,
              latency,
              connected: 0
            };
            // Message to connect
            const connectMsg: MessageBase = {
              id: randomUUID(),
              timestamp: Date.now(),
              type: MessageType.connect,
              data: thisNode
            };
            // Wait for response
            const response = await this.server.messagesHelper.sendAndReceiveMessage(node, connectMsg);
            let peerNode = response.data as NodePeer;
            // Calculate the average latency
            peerNode.latency = (peerNode.latency + latency) / 2 | 0;
            // Update connected time
            peerNode.connected = Date.now();
            // Save connected peer node
            await this.peersData.updateOrPushData(peerNode, ['host', 'port']);
            logOk(`Connected to ${chalk.green(peerNode.host)}:${chalk.green(peerNode.port)} with ${chalk.green(peerNode.latency)}ms latency`);
            break;
          case 'show':
            if (parts[1] === 'peers') {
              console.log(this.peersData.getData());
            }
            break;
          case 'clear':
            if (parts[1] === 'peers') {
              this.peersData.setAllData('');
            }
            break;
        }
      } catch (error) {
        logError(error);
      } finally {
        this.initConsole();
      }
    });
  }
}