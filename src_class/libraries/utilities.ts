import chalk from 'chalk';
import https from 'https';
import http from 'http';
import * as dotenv from 'dotenv';
dotenv.config();
import DataHelper from '../data/helper';
import { NodeAddress, NodeInfo, NodePeer } from '../interfaces/node';
import { GeoLocation } from '../interfaces/utilities';
import { MessageBase, MessageType } from '../interfaces/message';
import { randomUUID } from 'crypto';
import { ServerUDP } from '../node/server';


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

const getGeoIp = (ip: string): Promise<GeoLocation> => new Promise((ok, fail) => {
  let url: string = process.env.GEOIP_SERVICE_URL as string;
  url = url.replace('${ip}', ip);
  http.get(url, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      try {
        const dataObj: GeoLocation = JSON.parse(data);
        if (dataObj.lat && dataObj.lon) {
          ok(JSON.parse(data));
        } else {
          fail(`Variable does not match expected structure.`);
        }
      } catch (error) {
        fail(error);
      }
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

const sortLocationsByProximity = (nodes: NodePeer[], lat: number, lon: number): NodePeer[] => {
  nodes = nodes.map(node => ({
    ...node,
    proximity: calculateHaversineDistance(lat, lon, node.geoLocation.lat, node.geoLocation.lon)
  }));
  nodes.sort((nodeA, nodeB) => nodeA.proximity! - nodeB.proximity!);
  return nodes;
}

const getCloseNodes = (nodes: DataHelper, lat: number, lon: number, maxPeers?: number, discardNode?: NodePeer): NodePeer[] => {
  let filteredNodes: NodePeer[] = [...nodes.getData()];
  if (discardNode) {
    filteredNodes = filteredNodes.filter(node => node.port != discardNode?.port || node.host != discardNode?.host);
  }
  let sortedNodes = sortLocationsByProximity(filteredNodes, lat, lon);
  if (maxPeers && sortedNodes.length > maxPeers) {
    sortedNodes.length = maxPeers;
  }
  return sortedNodes;
}

const disconnectNodes = (nodes: Node[]): Node[] => {
  return nodes.map(node => ({
    ...node,
    connected: 0
  }));
}

const getLatency = (server: ServerUDP, peer: NodeAddress): Promise<number> => {
  return new Promise((ok, fail) => {
    let time = Date.now();
    const message: MessageBase = {
      id: randomUUID(),
      timestamp: Date.now(),
      type: MessageType.ping,
    };
    server.messagesHelper.sendAndReceiveMessage(peer as NodeInfo, message)
    .then(() => ok(Date.now() - time))
    .catch(fail);
  });
}

export {
  logOk,
  logInfo,
  logMessage,
  logError,
  getPublicIp,
  getGeoIp,
  calculateHaversineDistance,
  sortLocationsByProximity,
  getCloseNodes,
  disconnectNodes,
  getLatency,
};