import readline from 'readline';
import DataHelper from "../data/helper";
import { NodeAddress, NodeInfo, NodePeer } from "../interfaces/node";
import { ServerUDP } from "./server";
import { MessageBase, MessageType } from '../interfaces/message';
import { randomUUID } from 'crypto';
import { getGeoIp, getLatency, logError, logOk } from '../libraries/utilities';
import { GeoLocation } from '../interfaces/utilities';

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
    node.peersData = new DataHelper(`peers-${info.wallet}`);
    node.server = await ServerUDP.create(info);
    node.initConsole();
    return node;
  }

  initConsole() {
    consoleReadline.question('\n> ', async command => {
      try {
        const parts = command.split(' ');
        switch (parts[0]) {
          case 'connect':
            const node: NodeAddress = {
              host: parts[1],
              port: parseInt(parts[2]),
            };
            const geoLocation: GeoLocation = await getGeoIp(parts[1]);
            const latency: number = await getLatency(this.server, node);
            const peer: NodePeer = {
              ...this.info,
              geoLocation,
              latency,
              connected: 0
            };
            const connectMsg: MessageBase = {
              id: randomUUID(),
              timestamp: Date.now(),
              type: MessageType.connect,
              data: peer
            };
            await this.server.messagesHelper.sendAndReceiveMessage(node, connectMsg);
            logOk('Conectado!');
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