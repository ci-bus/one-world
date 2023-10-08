import Elliptic from 'elliptic';
import { Seal } from './seal';

/**
 * Las transacciones pueden tener 2 o mas outputs
 */
export interface Transaction {
  id: string // Identificador unico para una busqueda rapida
  timestamp: number // Momento de la firma de la transaccion
  amount: number // Monedas en la wallet
  outputs: TransactionOutput[] // Salidas de monedas
  seal: Seal // Sello de la wallet
}

/**
 * Todas las salidas si la wallet tiene 100 monedas y quiere enviar 2 habrá dos outputs
 * 2 monedas a la wallet destino y 98 monedas de vuelta a la misma wallet
 */
export interface TransactionOutput {
  amount: number // Cantidad
  address: string // Wallet de destino
};