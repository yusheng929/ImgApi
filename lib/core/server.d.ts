import http from 'http';
import { Express } from 'express';
import { WebSocketServer } from 'ws';
export default class Server {
    server: http.Server;
    app: Express;
    wss: WebSocketServer;
    constructor(app: Express);
    init(): Promise<void>;
}
