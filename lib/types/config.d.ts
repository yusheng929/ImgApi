export interface cfg {
    /** 端口 */
    port: string;
    /** Redis 配置 */
    redis: {
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
