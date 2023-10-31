import { NodeAddress, NodeInfo } from "./node"

/**
 * Estructura base de los mensajes
 */
export interface MessageBase {
  id: string // UUID v4
  timestamp: number
  type: MessageType
  data?: any
}

/**
 * Acciones que realizan los nodos
 */
export enum MessageType {
  error = 'error',
  ping = 'ping',
  pong = 'pong',
  connect = 'connect',
  connected = 'connected',
  nodes = 'nodes',
}

/**
 * Mensaje en cola esperando respuesta
 */
export interface TailMessage extends MessageBase {
  node: NodeAddress
  ok: Function
  fail: Function
  retries: number // Intentos de enviar el mensaje
  latency?: number
}