import { Socket } from "dgram";
import * as dotenv from 'dotenv';
dotenv.config();
import BaseAction from "./base";
import { Action, ConnectData, ConnectType } from "../interfaces/action";
import { calculateHaversineDistance, checkConnection, getGeoIp, logError, logInfo, logOk } from "../libraries/utilities";
import { checkConnectionResult } from "../interfaces/utilities";
import Node from "../interfaces/node";
import DataHelper from "../data/helper";
import chalk from "chalk";
import connectNode from './connect-node';
import { connectNodeCall } from "../calls/connect-node";

export default async (nodes: DataHelper, receivedNodes: Node[]) => {
  //let response;
  try {
    // Update node list
    for (let node of receivedNodes) {
      // Remove connected parameter
      const { connected, ...rest } = node;
      nodes.updateOrPushData(rest, ['host', 'port']);
    }
    let updatedNodes: Node[] = nodes.getData() as Node[];
    // Sort nodes by proximity
    updatedNodes.sort((nodeA, nodeB) => nodeA.proximity! - nodeB.proximity!);
    nodes.setAllData(updatedNodes);
    // Refresh conections
    const maxPeers = parseInt(process.env.MAX_PEERS_CONECTIONS as string);
    const timeRefresh = parseInt(process.env.PEERS_CONECTION_TIME_REFRESH as string);
    // While the connected nodes are lower that maximum peers
    let countConnectedNodes;
    do {
      countConnectedNodes = updatedNodes.filter(node => node.connected + timeRefresh > Date.now()).length;
      // Find node to connect
      const node: Node | undefined = updatedNodes.find(node => !(node.connected + timeRefresh > Date.now()));
      if (node) {
        logInfo(`Connecting to node ${node.host}:${node.port}...`);
        /*
        const data: ConnectData = {
          type: ConnectType.node,
          port: node.port,
          wallet: node.wallet
        }
        connectNode(data, node.host, nodes);
        */
        try {
          const data: ConnectData = {
            type: ConnectType.node,
            port: node.port,
            wallet: node.wallet
          }
          await connectNodeCall(data, node.host);
        } catch (error) {
          logError(error as string);
        }
      }
    } while (countConnectedNodes < updatedNodes.length && countConnectedNodes < maxPeers);
    // Probar conexión
    /*
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
        geoLocation,
        connected: Date.now()
      };
      // Crea una respuesta con la lista de otros nodos ordenada por distancia
      let sortedNodes = sortLocationsByProximity(nodes.getData() as Node[], geoLocation.lat, geoLocation.lon);
      // Limita a la mitad del máximo de conexiones peers
      const maxPeers = parseInt(process.env.MAX_PEERS_CONECTIONS as string) / 2 | 0;
      if (sortedNodes.length > maxPeers) {
        sortedNodes.length = maxPeers;
      }
      response = new BaseAction(Action.nodes, sortedNodes);
      // Actualiza o guarda la info del nodo que se esta conectando
      nodes.updateOrPushData(node, ['host', 'port']);
      logOk(`Node ${chalk.yellow(address)}:${chalk.yellow(data.port)} connected!`)
    }
    */
  } catch (error) {
    //response = new BaseAction(Action.error, error);
    logError(`${error}`);
  }
};