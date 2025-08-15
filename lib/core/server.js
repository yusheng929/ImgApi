import http from 'http';
import config from '../service/config/index.js';
import logger from '../service/logger/index.js';
import WebSocket from '../service/WebSocket.js';
import ExpressInit from '../core/plugins/ExpressRoute.js';
import Sqlite from '../service/db/index.js';
const cfg = config.getcfg;
export default class Server {
    server;
    app;
    wss;
    constructor(app) {
        global.logger = logger;
        global.sql = new Sqlite();
        this.app = app;
        this.server = http.createServer(app);
        this.wss = new WebSocket(this);
    }
    async init() {
        await new ExpressInit(this.app).init();
        this.server.listen(cfg.server.port, cfg.server.host, async () => {
            logger.ct('info', 'Express', `服务器运行中 ${logger.green(`http://${cfg.server.host}:${cfg.server.port}`)}`);
        });
    }
}
