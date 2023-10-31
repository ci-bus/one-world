import { GeoLocation } from "./utilities"

export interface NodeAddress {
  host: string
  port: number
}

export interface NodeInfo extends NodeAddress {
  localhost: string
  wallet: string
  geoLocation: GeoLocation
}

export interface NodePeer extends NodeInfo {
  latency: number
  connected: number
  proximity?: number
}