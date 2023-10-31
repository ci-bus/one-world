import DataHelper from "../data/helper";
import { MessageBase, MessageType } from "../interfaces/message";
import { NodePeer } from "../interfaces/node";
import { ServerUDP } from "./server";

export class NodeActions {

  peers: DataHelper;

  constructor(
    peers: DataHelper
  ) {
    this.peers = peers;
  }

  processMessage(message: MessageBase, server: ServerUDP): MessageBase | null {
    let response: MessageBase | null = null;
    switch (message.type) {
      case MessageType.ping:
        response = this.ping(message.id);
        break;
      case MessageType.connect:
        response = this.connect(message.id, message.data as NodePeer, server);
        break;
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

  connect(id: string, peer: NodePeer, server: ServerUDP) {
    console.log('peer', peer);
    return {
      id,
      timestamp: Date.now(),
      type: MessageType.connected,
      data: server.nodeInfo
    };
  }
}
