import dgram from 'dgram';
import chalk from 'chalk';
import https from 'https';
import http from 'http';
import * as dotenv from 'dotenv';
dotenv.config();
import BaseAction from '../actions/base';
import { Action, ConnectData } from '../interfaces/action';
import { checkConnectionResult } from '../interfaces/utilities';
import DataHelper from '../data/helper';
import Node from '../interfaces/node';

export const connectNodeCall = async (data: ConnectData, address: string): Promise<boolean> => {
  return new Promise((ok, fail) => {
    const start: Date = new Date();
    const client = dgram.createSocket('udp4');
    const timeoutId = setTimeout(() => {
      fail(`${address}:${data.port} inaccesible desde el exterior.`);
    }, parseInt(process.env.CHECK_CONECTION_TIMEOUT || '3000'));

    client.on('message', (message, rinfo) => {
      clearTimeout(timeoutId);
      const response: BaseAction = JSON.parse(message.toString('utf8'));
      const { address, port } = rinfo;
      const end: Date = new Date();
      const latency = end.getMilliseconds() - start.getMilliseconds();
      response.action === Action.pong
        ? ok({ address, port, latency })
        : fail(`Acción recibida: ${response.action}, se esperaba '${Action.pong}'.`);
      client.close();
    });

    client.on('error', fail);

    let action = new BaseAction(Action.ping);
    client.send(action.getJSONMessage(), port, host, error => error && fail(error));
  });
};