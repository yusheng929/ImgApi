import { WebSocketServer } from 'ws';
import http from 'http';
import WsEvent from '../core/plugins/ws.js';
export default class WebSocket extends WebSocketServer {
    Handler: WsEvent;
    watcher: null;
    constructor({ server }: {
        server: http.Server;
    });
    Listen(): void;
}
