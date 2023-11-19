import chalk from "chalk";
import readline from 'readline';
import { CryptoNode } from ".";
import { getGeoIp, getLatency, logError, logInfo, logOk } from "../libraries/utilities";
import { NodeAddress, NodePeer } from "../interfaces/node";
import { randomUUID } from "crypto";
import { MessageBase, MessageType } from "../interfaces/message";
import { GeoLocation } from "../interfaces/utilities";

const consoleReadline = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export class NodeConsole {
  node: CryptoNode;

  constructor(node: CryptoNode) {
    this.node = node;
  }

  init() {
    consoleReadline.question('\n$ ', async command => {
      const parts = command.split(' ');
      try {
        switch (parts[0]) {
          case 'connect':
            logInfo(`Connecting to ${parts[1]}...`);
            const address = parts[1].split(':');
            // Node info to connect
            const node: NodeAddress = {
              host: address[0],
              port: parseInt(address[1]),
            };
            const geoLocation: GeoLocation = await getGeoIp(address[0]);
            const latency: number = await getLatency(this.node.server, node);
            // This node info
            const thisNode: NodePeer = {
              ...this.node.info,
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
            const response = await this.node.server.messagesHelper.sendAndReceiveMessage(node, connectMsg);
            let peerNode = response.data as NodePeer;
            // Calculate the average latency
            peerNode.latency = (peerNode.latency + latency) / 2 | 0;
            // Update connected time
            peerNode.connected = Date.now();
            // Save connected peer node
            await this.node.peersData.updateOrPushData(peerNode, ['host', 'port']);
            logOk(`Connected to ${chalk.green(peerNode.host)}:${chalk.green(peerNode.port)} with ${chalk.green(peerNode.latency)}ms latency`);
            break;
          case 'ping':
            // Message ping
            const pingMsg: MessageBase = {
              id: randomUUID(),
              timestamp: Date.now(),
              type: MessageType.ping,
            };
            const pingAddress = parts[1].split(':');
            // Node info to connect
            const pingNode: NodeAddress = {
              host: pingAddress[0],
              port: parseInt(pingAddress[1]),
            };
            // Wait for response
            const pingResponse = await this.node.server.messagesHelper.sendAndReceiveMessage(pingNode, pingMsg);
            logOk(`Response received in ${chalk.green(pingResponse.latency)}ms`);
          break;
          case 'show':
            if (parts[1] === 'peers') {
              console.log(this.node.peersData.getData());
            }
            break;
          case 'clear':
            if (parts[1] === 'peers') {
              await this.node.peersData.setAllData('').then(() => {
                logOk(`Peers cleared`);
              }).catch(() => {
                logError(`The peers could not be cleared`);
              });
            }
            break;
          case 'neighbors':

        }
      } catch (error) {
        logError(error);
      } finally {
        this.init();
      }
    });
  }
}