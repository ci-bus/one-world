import DataHelper from "../data/helper";
import { MessageBase, MessageType } from "../interfaces/message";
import { NodePeer } from "../interfaces/node";

export class NodeActions {

  peers: DataHelper;

  constructor(
    peers: DataHelper
  ) {
    this.peers = peers;
  }

  processMessage(message: MessageBase): MessageBase | null {
    let response: MessageBase | null = null;
    switch (message.type) {
      case MessageType.ping:
        response = this.ping(message.id);
        break;
      case MessageType.connect:
        response = this.connect(message.id, message.data as NodePeer);
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

  connect(id: string, peer: NodePeer) {
    console.log('peer', peer);
    return {
      id,
      timestamp: Date.now(),
      type: MessageType.connected,
    };
  }
}
