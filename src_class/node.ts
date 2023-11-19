import * as dotenv from 'dotenv';
dotenv.config();
import { CryptoNode } from './node/';
import { getGeoIp, getPublicIp } from './libraries/utilities';
import { NodeInfo } from './interfaces/node';

(async () => {
  const port = parseInt(process.env.NODE_PORT || '10101');
  const localhost = process.env.NODE_LOCALHOST || '0.0.0.0';
  const host = process.env.PUBLIC_HOST || await getPublicIp();
  const wallet = process.env.NODE_WALLET || '';
  const geoLocation = await getGeoIp(host);
  const info: NodeInfo = {
    localhost,
    port,
    host,
    wallet,
    geoLocation,
  }
  const node = await CryptoNode.create(info);
  node.console.init();
})();
