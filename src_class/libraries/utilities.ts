import chalk from 'chalk';
import https from 'https';
import http from 'http';
import * as dotenv from 'dotenv';
dotenv.config();
import DataHelper from '../data/helper';
import { PeerNode } from '../interfaces/node';


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

const sortLocationsByProximity = (nodes: PeerNode[], lat: number, lon: number): PeerNode[] => {
  nodes = nodes.map(node => ({
    ...node,
    proximity: calculateHaversineDistance(lat, lon, node.geoLocation.lat, node.geoLocation.lon)
  }));
  nodes.sort((nodeA, nodeB) => nodeA.proximity! - nodeB.proximity!);
  return nodes;
}

const getCloseNodes = (nodes: DataHelper, lat: number, lon: number, maxPeers?: number, discardNode?: PeerNode): PeerNode[] => {
  let filteredNodes: PeerNode[] = [...nodes.getData()];
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
};