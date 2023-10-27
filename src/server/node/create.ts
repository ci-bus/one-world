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
import { Action, ConnectData, ConnectType } from '../../interfaces/action';
import DataHelper from '../../data/helper';

let nodes = new DataHelper('node-nodes', [], true);

const consoleReadline = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const connectWithMain = (server: Socket, port: number) => {
  consoleReadline.question('Main server IP: ', mainHost => {
    consoleReadline.question('Main server PORT: ', mainPort => {
      consoleReadline.question('Node wallet address: ', wallet => {
        logInfo(`Connecting to the main server...`);
        // Save info
        (global as any).mainHost = mainHost;
        (global as any).mainPort = mainPort;
        (global as any).wallet = wallet;
        const data: ConnectData = {
          type: ConnectType.node,
          port,
          wallet,
        };
        const action = new BaseAction(Action.connect, data);
        server.send(action.getJSONMessage(), parseInt(mainPort), mainHost, error => error && logError(error.message));
        consoleReadline.close();
      });
    });
  });
};

const checkServer = async (count: number, publicHost: string, port: number): Promise<boolean> => {
  try {
    const host = publicHost || await getPublicIp();
    await checkConnection(host, port);
    logOk(`Server UDP listening ${chalk.green(host)}:${chalk.green(port)}`);
    return true;
  } catch (error) {
    logError(`${error}`);
    return count < parseInt(process.env.MESSAGE_RETRIES as string)
      ? await checkServer(count + 1, publicHost, port)
      : false;
  }
}

const createNodeServer = async (port: number, host: string, publicHost?: string): Promise<Socket> => {

  // Get public host
  publicHost = publicHost || await getPublicIp();

  // Save global values
  (global as any).port = port;
  (global as any).host = port;
  (global as any).publicHost = publicHost;

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
    if (await checkServer(0, publicHost!, port)) {
      connectWithMain(server, port);
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