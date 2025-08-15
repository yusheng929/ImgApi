import { WebSocket } from 'ws';
import http from 'http';
export default class WsEvent {
    events: Record<string, {
        fnc: Function;
    }>;
    constructor();
    Handler(ws: WebSocket, req: http.IncomingMessage): Promise<void>;
}
