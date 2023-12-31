/**
 * Estructura base de los mensajes
 */
export interface MessageBase {
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
  connected = 'connected',
  nodes = 'nodes',
}

/**
 * Tipo de conexiones nodo><nodo, // TODO user><nodo?
 */
export enum ConnectType {
  node = 'node',
  user = 'user', // En desuso
}

/**
 * Datos de conexión, la IP se obtiene del mensaje UDP
 * La wallet se usa de identificador único
 */
export interface ConnectData {
  type: ConnectType
  port: number
  wallet: string
}