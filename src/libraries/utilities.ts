import dgram from 'dgram';
import chalk from 'chalk';
import https from 'https';
import BaseAction from '../actions/base';
import { Action } from '../interfaces/action';

const checkConnection = async (host: string, port: number) => {
  return new Promise((ok, fail) => {
    const client = dgram.createSocket('udp4');
    const timeoutId = setTimeout(() => {
      fail(`${host}:${port} inaccesible desde el exterior.`);
    }, 1000);

    client.on('message', (message, rinfo) => {
      clearTimeout(timeoutId);
      const response: BaseAction = JSON.parse(message.toString('utf8'));
      const { address, port } = rinfo;
      response.action === Action.pong
        ? ok({ address, port })
        : fail(`Acción recibida: ${response.action}, se esperaba '${Action.pong}'.`);
      client.close();
    });

    client.on('error', fail);

    let action = new BaseAction('ping');
    client.send(action.getJSONMessage(), port, host, error => error && fail(error));
  });
};

const logOk = (text: string) => {
  console.log(`[${chalk.green('OK')}] ${text}`);
};

const logInfo = (text: string) => {
  console.log(`[${chalk.blue('INFO')}] ${text}`);
};

const logMessage = (text: string) => {
  console.log(`[${chalk.yellow('MESSAGE')}] ${text}`);
};

const logError = (text: string) => {
  console.log(`[${chalk.red('ERROR')}] ${text}`);
};

const getPublicIp = (): Promise<string> => new Promise((ok, fail) => {
  https.get('https://api.ipify.org', (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      ok(data);
    });
  }).on('error', fail);
});

export {
  checkConnection,
  logOk,
  logInfo,
  logMessage,
  logError,
  getPublicIp,
};