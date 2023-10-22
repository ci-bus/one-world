export default interface Node {
  host: string
  port: number
  wallet: string
  geoLocation: {
    lat: number
    lon: number
  }
  latency: number
  proximity?: number
  connected?: boolean
}