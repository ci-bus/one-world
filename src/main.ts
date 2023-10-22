import * as dotenv from 'dotenv';
dotenv.config();
import { createMainServer } from "./server";

const port = parseInt(process.env.MAIN_PORT || '10101');
const host = process.env.MAIN_HOST || '0.0.0.0';
const publicHost = process.env.PUBLIC_HOST;

// Levanta el servicio
const server = createMainServer(port, host, publicHost);

