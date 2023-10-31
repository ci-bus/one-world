import dgram, { Socket } from 'dgram';
import { Action, MessageBase, ConnectData, ConnectType } from '../../interfaces/action';
import ping from '../../actions/ping';
import chalk from 'chalk';
import { disconnectNodes, getCloseNodes, logError, logInfo, logOk } from '../../libraries/utilities';
import Node from '../../interfaces/node';
import connectNode from '../../actions/connect-node';
import DataHelper from '../../data/helper';
import BaseAction from '../../actions/base';
import updateConecctionNodes from '../../actions/update-connection-nodes';

export default async (server: Socket, message: Buffer, rinfo: dgram.RemoteInfo, nodes: DataHelper) => {
  // Decode JSON messaje
  const messageObj: MessageBase = JSON.parse(message.toString('utf8'));
  logInfo(`Message ${chalk.blue(messageObj.action)} received from ${chalk.blue(rinfo.address)}:${chalk.blue(rinfo.port)}`);
  // Actions
  switch (messageObj.action) {
    case Action.ping:
      ping(server, rinfo.port, rinfo.address);
      break;
    case Action.connect:
      const data: ConnectData = messageObj.data as ConnectData;
      if (data.type == ConnectType.node) {
        // Connect node
        const resultAction = await connectNode(data, rinfo.address, nodes);
        // Send result
        server.send(resultAction.getJSONMessage(), data.port, rinfo.address);
        // If it is connected
        if (resultAction.action === Action.connected) {
          // Send half of maximum number of peers ordered by proximity
          const connectedNode: Node = resultAction.data;
          const halfMaxPeers = parseInt(process.env.MAX_PEERS_CONECTIONS as string) / 2 | 0;
          const closeNodes = disconnectNodes(getCloseNodes(nodes, connectedNode.geoLocation.lat, connectedNode.geoLocation.lon, halfMaxPeers, connectedNode));
          const actionNodes = new BaseAction(Action.nodes, closeNodes);
          server.send(actionNodes.getJSONMessage(), connectedNode.port, connectedNode.host);
        }
      } else {
        logError(`Connect type ${chalk.red(data.type)} not soported.`);
      }
      break;
    case Action.connected:
      const data2: ConnectData = messageObj.data as ConnectData;
      const connectedNode: Node = messageObj.data;
      // Update o save conected node info
      nodes.updateOrPushData({
        host: rinfo.address,
        port: data2.port,
        latency: connectedNode.latency,
        connected: Date.now()
      }, ['host', 'port']);

      break;
    case Action.nodes:
      const receivedNodes: Node[] = messageObj.data;
      if (receivedNodes.length) {
        logInfo(`Received ${chalk.yellow(receivedNodes.length)} peers`);
        updateConecctionNodes(nodes, receivedNodes);
      } else {
        logOk(`You are the first node!`);
      }
      break;
    case Action.error:
      logError(messageObj.data);
      break;
  }
};