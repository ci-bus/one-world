import readline from 'readline';
import DataHelper from "../data/helper";
import { NodeAddress, NodeInfo, NodePeer } from "../interfaces/node";
import { ServerUDP } from "./server";
import { MessageBase, MessageType } from '../interfaces/message';
import { randomUUID } from 'crypto';
import { getGeoIp, getLatency, logError, logOk } from '../libraries/utilities';
import { GeoLocation } from '../interfaces/utilities';
import chalk from 'chalk';
import { NodeConsole } from './console';



export class CryptoNode {

  // Info
  info: NodeInfo;
  // Peers nodes
  peersData: DataHelper;
  // Server with socket UDP
  server: ServerUDP;
  // Console to execute commands
  console: NodeConsole;

  constructor() { }

  static async create(info: NodeInfo) {
    const node = new CryptoNode();
    node.info = info;
    node.peersData = new DataHelper(`${info.wallet}-peers`, '');
    node.server = await ServerUDP.create(node);
    node.console = new NodeConsole(node);
    return node;
  }

  
}