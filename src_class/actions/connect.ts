import { randomUUID } from "crypto";
import { MessageBase, MessageType } from "../interfaces/message";
import { NodeAddress, NodeInfo, NodePeer } from "../interfaces/node";
import { GeoLocation } from "../interfaces/utilities";
import { getGeoIp, getLatency } from "../libraries/utilities";
import { ServerUDP } from "../node/server";
import DataHelper from "../data/helper";

export const connect = async (host: string, port: number, server: ServerUDP, nodeInfo: NodeInfo, peers: DataHelper): Promise<boolean> => {
  const node: NodeAddress = { host, port };
  const geoLocation: GeoLocation = await getGeoIp(host);
  const latency: number = await getLatency(server, node);
  const peer: NodePeer = {
    ...nodeInfo,
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
  const response = await server.messagesHelper.sendAndReceiveMessage(node, connectMsg);
  return Boolean(response.type === MessageType.connected);
}