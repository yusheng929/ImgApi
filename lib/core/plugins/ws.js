import { WebSocket } from 'ws';
import { getTime, getApiData } from './util.js';
export default class WsEvent {
    events;
    constructor() {
        this.events = {};
    }
    async Handler(ws, req) {
        if (req.url === '/ws/getData') {
            const uptimeInterval = setInterval(async () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'uptime',
                        data: await getTime()
                    }));
                }
            }, 1000);
            ws.send(JSON.stringify({
                type: 'init',
                data: {
                    uptime: await getTime(),
                    apiData: await getApiData()
                }
            }));
            ws.on('close', () => {
                clearInterval(uptimeInterval);
            });
        }
    }
}
