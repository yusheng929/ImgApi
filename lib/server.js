import express from 'express';
import Server from './core/server.js';
await new Server(express()).init();
global.Server = express();
