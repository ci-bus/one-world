import dgram from 'dgram';
import chalk from 'chalk';
import https from 'https';
import http from 'http';
import * as dotenv from 'dotenv';
dotenv.config();
import BaseAction from '../actions/base';
import { Action } from '../interfaces/action';
import { checkConnectionResult } from '../interfaces/utilities';

const checkConnection = async (host: string, port: number): Promise<checkConnectionResult> => {
  return new Promise((ok, fail) => {
    const start: Date = new Date();
    const client = dgram.createSocket('udp4');
    const timeoutId = setTimeout(() => {
      fail(`${host}:${port} inaccesible desde el exterior.`);
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

const logOk = (text: string) => {
  console.log(`[${chalk.green('OK')}] ${text}`);
};

const logInfo = (text: string) => {
  console.log(`[${chalk.cyan('INFO')}] ${text}`);
};

const logMessage = (text: string) => {
  console.log(`[${chalk.yellow('MESSAGE')}] ${text}`);
};

const logError = (text: string) => {
  console.log(`[${chalk.red('ERROR')}] ${text}`);
};

const getPublicIp = (): Promise<string> => new Promise((ok, fail) => {
  https.get(process.env.PUBLIC_IP_SERVICE as string, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      ok(data);
    });
  }).on('error', fail);
});

const getGeoIp = (ip: string): Promise<string> => new Promise((ok, fail) => {
  let url: string = process.env.GEOIP_SERVICE_URL as string;
  url = url.replace('${ip}', ip);
  http.get(url, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      ok(data);
    });
  }).on('error', fail);
});

const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const earthRadius = 6371; // Radio de la tierra en kilometros
  // Convierte grados en radios
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  // Calcula distancia haversine
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;
  return distance;
}

export {
  checkConnection,
  logOk,
  logInfo,
  logMessage,
  logError,
  getPublicIp,
  getGeoIp,
  calculateHaversineDistance,
};