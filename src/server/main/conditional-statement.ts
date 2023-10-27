import dgram, { Socket } from 'dgram';
import { Action, BaseMessage, ConnectData, ConnectType } from '../../interfaces/action';
import ping from '../../actions/ping';
import connectNode from '../../actions/connect-node';
import chalk from 'chalk';
import { disconnectNodes, getCloseNodes, logError, logInfo } from '../../libraries/utilities';
import DataHelper from '../../data/helper';
import BaseAction from '../../actions/base';
import Node from '../../interfaces/node';

export default async (server: Socket, message: Buffer, rinfo: dgram.RemoteInfo, nodes: DataHelper) => {
  // Decode JSON messaje
  const messageObj: BaseMessage = JSON.parse(message.toString('utf8'));
  // Actions
  const data: ConnectData = messageObj.data as ConnectData;
  switch (messageObj.action) {
    case Action.ping:
      ping(server, rinfo.port, rinfo.address);
      break;
    case Action.connect:
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
  }
  logInfo(`Message ${chalk.blue(messageObj.action)} received from ${chalk.blue(rinfo.address)}:${chalk.blue(rinfo.port)}`);
};