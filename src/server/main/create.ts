import dgram, { Socket } from 'dgram';
import {
  checkConnection,
  logInfo,
  logError,
  getPublicIp,
  logOk,
} from '../../libraries/utilities';
import chalk from 'chalk';
import conditionalStatement from './conditional-statement';
import DataHelper from '../../data/helper';

let nodes = new DataHelper('nodes', [], true);

const createMainServer = (port: number, host: string, publicHost?: string): Socket => {

  // UDP service
  const server: Socket = dgram.createSocket('udp4');

  // On receive message from other node
  server.on('message', (message: Buffer, rinfo: dgram.RemoteInfo) => {
    try {
      conditionalStatement(server, message, rinfo, nodes);
    } catch (error) {
      logError(`${error}`);
    }
  });

  // On listening server
  server.on('listening', async () => {
    logInfo(`Testing server...`);
    // Check server
    try {
      const host = publicHost || await getPublicIp();
      await checkConnection(host, port);
      logOk(`Server UDP listening ${chalk.green(host)}:${chalk.green(port)}`);
    } catch (error) {
      logError(`${error}`);
    }
  });

  // Init server
  server.bind({
    address: host,
    port: port,
    exclusive: true,
  });

  return server;
};

export default createMainServer;
