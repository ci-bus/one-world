/**
 * Estructura base de los mensajes
 */
export interface BaseMessage {
  action: Action
  data?: any
}

/**
 * Acciones que realizan los nodos
 */
export enum Action {
  error = 'error',
  ping = 'ping',
  pong = 'pong',
  connect = 'connect',
  nodes = 'nodes'
}

export interface connectNodeData {
  port: number
  wallet: string
}