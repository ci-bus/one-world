import dgram, { Socket } from 'dgram';
import * as dotenv from 'dotenv';
dotenv.config();
import {
  checkConnection,
  logInfo,
  logError,
  getPublicIp,
  logOk,
} from '../libraries/utilities';
import { Action, BaseMessage } from '../interfaces/action';
import ping from '../actions/ping';
import chalk from 'chalk';

// Main server port and ips
const port = parseInt(process.env.MAIN_PORT || '10101');
const host = process.env.MAIN_HOST || '127.0.0.1';
const publicHost = process.env.MAIN_PUBLIC_HOST;

const createMainServer = (): Socket => {

  const server = dgram.createSocket('udp4');

  // On receive message from other node
  server.on('message', (message, rinfo) => {
    try {
      // Decode JSON messaje
      const messageObj: BaseMessage = JSON.parse(message.toString('utf8'));
      // Actions
      switch (messageObj.action) {
        case Action.ping:
          ping(server, rinfo.port, rinfo.address);
          break;
      }
      logInfo(`Message ${chalk.blue(messageObj.action)} received from ${chalk.blue(rinfo.address)}:${chalk.blue(rinfo.port)}`);
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
