/**
 * Estructura base de los mensajes
 */
export interface BaseMessage {
  action: string
  data?: any
}

/**
 * Acciones que realizan los nodos
 */
export enum Action {
  ping = 'ping',
  pong = 'pong'
}