import { loggerevel } from './logger.js';
export interface cfg {
    /** 服务端配置 */
    server: {
        /** 服务监听地址 */
        host: string;
        /** 端口 */
        port: number;
        /** 日志等级 */
        log_level: loggerevel;
    };
    /** Redis 配置 */
    redis: {
        /** 是否启用 Redis */
        enable: boolean;
        /** Redis 地址 */
        host: string;
        /** Redis 端口 */
        port: number;
        /** Redis 用户名 */
        username?: string;
        /** Redis 密码 */
        password?: string;
        /** Redis 数据库 */
        db: number;
        /** 连接失败重连次数 */
        errcount: number;
    };
}
