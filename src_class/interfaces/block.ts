import { Seal } from "./seal"

/**
 * Los bloques pueden contener varias transacciones en data
 * Distintos nodos pueden sellar el bloque para darle seguridad
 */
export interface Block {
  timestamp: number // Momento de la creación
  previousHash: string // Hash del bloque anterior
  hash: string // Hash actual generado con todos los datos del bloque menos los sellos
  data: string // Transacciones y otros datos
  seals: Seal[] // Sellos de nodos para darle seguridad
}
