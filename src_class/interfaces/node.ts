import { GeoLocation } from "./utilities"

export interface NodeAddress {
  host: string
  port: number
}

export interface NodeInfo extends NodeAddress {
  localhost: string
  wallet: string
}

export interface NodePeer extends NodeInfo {
  geoLocation: GeoLocation
  latency: number
  connected: number
  proximity?: number
}