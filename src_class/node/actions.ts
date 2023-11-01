import DataHelper from "../data/helper";
import { MessageBase, MessageType } from "../interfaces/message";
import { NodePeer } from "../interfaces/node";
import { getLatency } from "../libraries/utilities";
import { ServerUDP } from "./server";

export class NodeActions {

  peersData: DataHelper;

  constructor(
    peersData: DataHelper
  ) {
    this.peersData = peersData;
  }

  async processMessage(message: MessageBase, server: ServerUDP): Promise<MessageBase | null> {
    let response: MessageBase | null = null;
    try {
      switch (message.type) {
        case MessageType.ping:
          response = this.ping(message.id);
          break;
        case MessageType.connect:
          response = await this.connect(message, server);
          break;
      }
    } catch (error) {
      response = {
        id: message.id,
        timestamp: Date.now(),
        type: MessageType.error,
        data: error
      };
    }
    return response;
  }

  ping(id: string) {
    return {
      id,
      timestamp: Date.now(),
      type: MessageType.pong,
    };
  }

  async connect(message: MessageBase, server: ServerUDP) {
    const maxConnections = parseInt(process.env.MAX_PEERS_CONECTIONS as string);
    if (this.peersData.getData().length >= maxConnections) {
      throw (`Connections have exceeded the maximum.`);
    }
    const peer = message.data as NodePeer;
    const peerTimeout = parseInt(process.env.PEERS_CONECTION_TIMEOUT as string);
    let latency = await getLatency(server, peer);
    if (latency > peerTimeout) {
      throw (`Latency has exceeded the maximum allowable threshold.`);
    }
    const peerNode: NodePeer = {
      ...peer,
      latency: message.data.latency,
      connected: Date.now()
    };
    // Calculate the average latency
    peerNode.latency = (peerNode.latency + latency) / 2 | 0;
    this.peersData.updateOrPushData(peerNode, ['host', 'port']);
    const thisNode = {
      ...server.nodeInfo,
      latency,
      connected: peerNode.connected
    };
    return {
      id: message.id,
      timestamp: Date.now(),
      type: MessageType.connected,
      data: thisNode
    };
  }
}
