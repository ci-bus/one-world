import { createNodeServer } from "./server";
import * as dotenv from 'dotenv';
dotenv.config();

const port = parseInt(process.env.NODE_PORT || '10101');
const host = process.env.NODE_HOST || '0.0.0.0';
const publicHost = process.env.PUBLIC_HOST;

createNodeServer(port, host, publicHost);

