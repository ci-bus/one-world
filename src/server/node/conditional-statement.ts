import dgram, { Socket } from 'dgram';
import { Action, BaseMessage } from '../../interfaces/action';
import ping from '../../actions/ping';
import chalk from 'chalk';
import { logInfo, logOk } from '../../libraries/utilities';
import Node from '../../interfaces/node';

export default (server: Socket, message: Buffer, rinfo: dgram.RemoteInfo) => {
  // Decode JSON messaje
  const messageObj: BaseMessage = JSON.parse(message.toString('utf8'));
  logInfo(`Message ${chalk.blue(messageObj.action)} received from ${chalk.blue(rinfo.address)}:${chalk.blue(rinfo.port)}`);
  // Actions
  switch (messageObj.action) {
    case Action.ping:
      ping(server, rinfo.port, rinfo.address);
      break;
    case Action.nodes:
      logOk(`Connected to the main server`)
      const nodes: Node[] = messageObj.data;
      if (nodes.length) {
        logInfo(`Connecting to ${chalk.yellow(nodes.length)} nodes...`);
        console.log(messageObj.data);
      } else {
        logOk(`You are the first node!`);
      }
      break;
  }
};