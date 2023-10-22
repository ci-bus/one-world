import dgram, { Socket } from 'dgram';
import { Action, BaseMessage, connectNodeData } from '../../interfaces/action';
import ping from '../../actions/ping';
import connectNode from '../../actions/connect-node';
import chalk from 'chalk';
import { logInfo } from '../../libraries/utilities';
import DataHelper from '../../data/helper';

export default (server: Socket, message: Buffer, rinfo: dgram.RemoteInfo, nodes: DataHelper) => {
  // Decode JSON messaje
  const messageObj: BaseMessage = JSON.parse(message.toString('utf8'));
  // Actions
  switch (messageObj.action) {
    case Action.ping:
      ping(server, rinfo.port, rinfo.address);
      break;
    case Action.connect:
      connectNode(server, messageObj.data as connectNodeData, rinfo.address, nodes);
      break;
  }
  logInfo(`Message ${chalk.blue(messageObj.action)} received from ${chalk.blue(rinfo.address)}:${chalk.blue(rinfo.port)}`);
};