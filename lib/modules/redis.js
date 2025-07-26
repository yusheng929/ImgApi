import cfg from '../modules/config.js';
import { createClient } from 'redis';
import logger from './logger.js';
const rs = cfg.getcfg.redis;
class Redis {
    redis;
    count = 0;
    constructor(opt) {
        logger.ct('info', 'Redis', '正在连接...');
        this.redis = createClient(opt);
        this.Listeners();
    }
    async connect() {
        try {
            await this.redis.connect();
            return this.redis;
        }
        catch (error) {
            this.redis.destroy();
        }
    }
    Listeners() {
        this.redis.on('error', (err) => {
            logger.ct('error', 'Redis', '发生错误:', err);
        });
        this.redis.on('end', () => {
            logger.ct('warn', 'Redis', '连接已关闭');
        });
        this.redis.on('reconnecting', () => {
            logger.ct('mark', 'Redis', '正在重新连接...');
        });
        this.redis.on('connect', () => {
            logger.ct('info', 'Redis', '已连接');
        });
    }
}
export const redis = await new Redis({
    socket: {
        host: rs.host,
        port: rs.port,
        reconnectStrategy: (retries) => {
            if (retries === rs.errcount - 1) {
                return new Error('重连超过次数');
            }
            return Math.min(retries * 100, 10000);
        }
    },
    password: rs.password,
    username: rs.username,
    database: rs.db,
}).connect().catch(() => {
    process.exit(1);
});
