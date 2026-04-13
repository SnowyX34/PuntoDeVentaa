import * as dotenv from 'dotenv';
import Server from "../backend/src/infrestructure/server/server";


// Configuramos dotenv
dotenv.config();

const server = new Server();