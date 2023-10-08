import { SHA256 } from "crypto-js"

export default (data: any): string => {
  return SHA256(JSON.stringify({ ...data })).toString();
}