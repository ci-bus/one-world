export interface InfoNode {
  localhost?: string
  host: string
  port: number
  wallet: string
}

export interface PeerNode extends InfoNode {
  geoLocation: {
    lat: number
    lon: number
  }
  latency: number
  connected: number
  proximity?: number
}