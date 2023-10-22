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
import readline from 'readline';
import BaseAction from '../../actions/base';
import { Action, connectNodeData } from '../../interfaces/action';

const consoleReadline = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const connectWithMain = (server: Socket, port: number) => {
  consoleReadline.question('Main server IP: ', mainIP => {
    consoleReadline.question('Main server PORT: ', mainPORT => {
      consoleReadline.question('Node wallet address: ', wallet => {
        logInfo(`Connecting to the main server...`);
        let data: connectNodeData = {
          port, wallet
        };
        let action = new BaseAction(Action.connect, data);
        server.send(action.getJSONMessage(), parseInt(mainPORT), mainIP, error => error && logError(error.message));
        consoleReadline.close();
      });
    });
  });
};

const createNodeServer = (port: number, host: string, publicHost?: string): Socket => {

  // UDP service
  const server: Socket = dgram.createSocket('udp4');

  // On receive message from other node
  server.on('message', (message: Buffer, rinfo: dgram.RemoteInfo) => {
    try {
      conditionalStatement(server, message, rinfo);
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
      connectWithMain(server, port);
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

export default createNodeServer;