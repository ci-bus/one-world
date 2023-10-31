
/**
 * Tipo de conexiones nodo><nodo, // TODO user><nodo?
 */
export enum ConnectType {
  node = 'node',
  user = 'user', // En desuso
}

/**
 * Datos de conexión, la IP y puerto se obtiene del mensaje UDP
 * La wallet se usa de identificador único
 */
export interface ConnectData {
  type: ConnectType
  wallet: string
}