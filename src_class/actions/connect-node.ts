import { Socket } from "dgram";
import * as dotenv from 'dotenv';
dotenv.config();
import BaseAction from "./base";
import { Action, ConnectData } from "../interfaces/message";
import { calculateHaversineDistance, checkConnection, getGeoIp, logError, logOk } from "../libraries/utilities";
import { GeoLocation, checkConnectionResult } from "../interfaces/utilities";
import Node from "../interfaces/node";
import DataHelper from "../data/helper";
import chalk from "chalk";

export default async (data: ConnectData, address: string, nodes: DataHelper): Promise<BaseAction> => {
  try {
    // Probar conexión
    const checkResult: checkConnectionResult = await checkConnection(address, data.port);
    // No se permite conectar si la latencia es mayor a un segundo con el main server
    if (checkResult.latency > parseInt(process.env.MAIN_SERVER_CONECTION_TIMEOUT || '1000')) {
      return new BaseAction(Action.error, `The node latency is greater than one second (${(checkResult.latency / 1000).toFixed(2)}s), it cannot connect.`);
    } else {
      // Geo localización del nodo
      const geoLocation: GeoLocation = await getGeoIp(address);
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
      // Actualiza o guarda la info del nodo que se esta conectando
      nodes.updateOrPushData(node, ['host', 'port']);
      logOk(`Node ${chalk.yellow(address)}:${chalk.yellow(data.port)} connected!`);
      return new BaseAction(Action.connected, node);
    }
  } catch (error) {
    logError(`${error}`);
    return new BaseAction(Action.error, error);
  }
};