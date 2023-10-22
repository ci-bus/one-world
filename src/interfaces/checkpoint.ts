import { Seal } from "./seal"
import { TransactionReceive } from "./transaction"

/**
 * Los checkpoints son un resumen de todas las wallets con la cantidad de monedas de cada una
 * Los nodos podrán trabajar a partir de un checkpoint sin tener que descargar toda la blockchain
 */
export interface Checkpoint {
  timestamp: number // Momento de la creación
  previousHash: string // Hash del bloque anterior
  hash: string // Hash actual generado con todos los datos del bloque menos los sellos
  outputs: TransactionReceive[] // Salidas de monedas
  seals: Seal[] // Sellos de nodos para darle seguridad
}