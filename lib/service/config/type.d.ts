import { loggerevel } from '../../service/logger/type.js';
export interface cfg {
    /** 服务端配置 */
    server: {
        /** 服务监听地址 */
        host: string;
        /** 端口 */
        port: number;
        /** 日志等级 */
        log_level: loggerevel;
        /** 日志保留天数 */
        log_days_to_keep: number;
    };
    /** 账号密码设置 */
    admin: {
        /** 用户名 */
        username: string;
        /** 密码 */
        password: string;
    };
}
