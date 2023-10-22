import { Socket } from "dgram";
import * as dotenv from 'dotenv';
dotenv.config();
import BaseAction from "./base";
import { Action, connectNodeData } from "../interfaces/action";
import { calculateHaversineDistance, checkConnection, getGeoIp, logError, logOk } from "../libraries/utilities";
import { checkConnectionResult } from "../interfaces/utilities";
import Node from "../interfaces/node";
import DataHelper from "../data/helper";
import chalk from "chalk";

const sortLocationsByProximity = (nodes: Node[], lat: number, lon: number): Node[] => {
  let resultNodes: Node[] = [...nodes];
  resultNodes = resultNodes.map(node => ({
    ...node,
    proximity: calculateHaversineDistance(lat, lon, node.geoLocation.lat, node.geoLocation.lon)
  }));
  resultNodes.sort((nodeA, nodeB) => nodeA.proximity! - nodeB.proximity!);
  return resultNodes;
}

export default async (server: Socket, data: connectNodeData, address: string, nodes: DataHelper) => {
  let response;
  try {
    // test conection
    const checkResult: checkConnectionResult = await checkConnection(address, data.port);
    // No se permite conectar si la latencia es mayor a un segundo con el main server
    if (checkResult.latency > parseInt(process.env.MAIN_SERVER_CONECTION_TIMEOUT || '1000')) {
      response = new BaseAction(Action.error, `The node latency is greater than one second (${(checkResult.latency / 1000).toFixed(2)}s), it cannot connect.`);
    } else {
      // Geo localización del nodo
      const geoLocation = JSON.parse(await getGeoIp(address));
      if (!geoLocation?.lat || !geoLocation.lon) {
        throw (`Error getting lat lon geo location ip.`);
      }
      // Crea información del nodo
      const node: Node = {
        host: address,
        port: data.port,
        wallet: data.wallet,
        latency: checkResult.latency,
        geoLocation
      };
      // Crea una respuesta con la lista de otros nodos ordenada por distancia
      let shortedNodes = sortLocationsByProximity(nodes.getData() as Node[], geoLocation.lat, geoLocation.lon);
      // Limita a la mitad del máximo de conexiones peers
      const maxPeers = parseInt(process.env.MAX_PEERS_CONECTIONS as string) / 2 | 0;
      if (shortedNodes.length > maxPeers) {
        shortedNodes.length = maxPeers;
      }
      response = new BaseAction(Action.nodes, shortedNodes);
      // Actualiza o guarda la info del nodo que se esta conectando
      nodes.updateOrPushData(node, 'host');
      logOk(`Node ${chalk.yellow(address)}:${chalk.yellow(data.port)} connected!`)
    }
  } catch (error) {
    response = new BaseAction(Action.error, error);
    logError(`${error}`);
  }
  server.send(response.getJSONMessage(), data.port, address);
};