import { WebSocketServer, WebSocket as wsType } from 'ws';
import WsEvent from '../core/plugins/ws.js';
import chokidar from 'chokidar';
import config from './config/index.js';
import path from 'path';
import { getApiData } from '../core/plugins/util.js';
export default class WebSocket extends WebSocketServer {
    Handler;
    watcher;
    constructor({ server }) {
        super({ server });
        this.Listen();
        this.watcher = null;
        this.Handler = new WsEvent();
    }
    Listen() {
        this.on('error', (err) => {
            const { address, port, syscall } = err;
            if (syscall === 'listen' && address && port) {
                logger.error(`服务启动失败: 地址/端口无访问权限或已被占用（${address}:${port})`);
                process.exit();
            }
            else {
                logger.error(err);
            }
        });
        this.on('connection', async (socket, request) => {
            this.Handler.Handler(socket, request);
        });
        const watcher = chokidar.watch(path.join(config.root, 'data', 'data.db'));
        watcher.on('change', () => {
            this.clients.forEach(async (client) => {
                if (client.readyState === wsType.OPEN) {
                    client.send(JSON.stringify({
                        type: 'apiData',
                        data: await getApiData()
                    }));
                }
            });
        });
    }
}
