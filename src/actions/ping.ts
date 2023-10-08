import { Socket } from "dgram";
import { BaseMessage } from "../interfaces/action";

export default (server: Socket, port: number, address: string) => {
  const response: BaseMessage = {
    action: 'pong'
  };
  server.send(JSON.stringify(response), port, address);
};