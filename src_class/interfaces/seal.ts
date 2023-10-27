import Elliptic from 'elliptic';

/**
 * Los clientes usan los sellos para proteger transacciones
 * Los nodos usan los sellos para proteger bloques
 */
export interface Seal {
  address: string // Dirección de la wallet / clave publica
  signature: Elliptic.ec.Signature // Firma con clave privada
}
