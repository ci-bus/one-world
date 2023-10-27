import DataHelper from "../data/helper";
import { InfoNode } from "../interfaces/node";
import { ServerUDP } from "./server";

export class CryptoNode {

  // Info
  info: InfoNode;
  // Peers nodes
  peersData: DataHelper;
  // Server with socket UDP
  server: ServerUDP;
  
  constructor () {}

  static async create(info: InfoNode){
    const node = new CryptoNode();
    node.peersData = new DataHelper(`peers-${info.wallet}`);
    node.server = await ServerUDP.create(info);
    return node;
  }
}