import { Socket } from "dgram";
import { Action } from "../interfaces/action";
import BaseAction from "./base";

export default (server: Socket, port: number, address: string) => {
  const response = new BaseAction(Action.pong);
  server.send(response.getJSONMessage(), port, address);
};