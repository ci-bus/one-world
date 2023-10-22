import { Seal } from './seal';

export interface TransactionSend {
  i: string // id - Identificador único UUID v4
  t: number // timestamp - Momento de la creación
  l: string // last transaction id - Id última transacción
  o: string // origen wallet - Monedero de origen
  d: string // destination wallet - Monedero de destino
  a: number // amount - Cantidad de monedas a enviar
  c: number // commission - Comisión que está dispuesto a pagar por la transacción
  b: number // balance - Monedas en la wallet después de la transacción
  s: Seal   // seal - Sello con firma de la wallet que envía
}

export interface TransactionReceive {
  i: string // id - Identificador único UUID v4
  t: number // timestamp - Momento de la creación
  l: string // last transaction id - Id última transacción
  o: string // origen wallet - Monedero de origen
  d: string // destination wallet - Monedero de destino
  a: number // amount - Cantidad de monedas a recibir
  b: number // balance - Monedas en la wallet después de la transacción
  s: Seal   // seal - Sello con firma del nodo que realiza la transacción
}

export interface TransactionPack {
  r: TransactionSend // request - Petición de transacción
  t: TransactionReceive // transaction - Transacción
  c: TransactionReceive // commission transaction - Transacción de comisión
}
