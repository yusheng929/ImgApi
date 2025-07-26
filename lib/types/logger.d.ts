import chalk from 'chalk';
import type { Logger as Log4jsType } from 'log4js';
type loggerevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'mark' | 'off';
export interface Logger extends Log4jsType {
    /** @description chalk模块 */
    chalk: typeof chalk;
    /** @description 将文本设置为红色 */
    red: typeof chalk.red;
    /** @description 将文本设置为绿色 */
    green: typeof chalk.green;
    /** @description 将文本设置为黄色 */
    yellow: typeof chalk.yellow;
    /** @description 将文本设置为蓝色 */
    blue: typeof chalk.blue;
    /** @description 将文本设置为品红色 */
    magenta: typeof chalk.magenta;
    /** @description 将文本设置为青色 */
    cyan: typeof chalk.cyan;
    /** @description 将文本设置为白色 */
    white: typeof chalk.white;
    /** @description 将文本设置为灰色 */
    gray: typeof chalk.gray;
    /** @description 将文本设置为紫色 */
    violet: ReturnType<typeof chalk.hex>;
    /** @description 将文本设置为粉色 */
    pink: ReturnType<typeof chalk.hex>;
    /** @description 打印追踪日志 */
    trace(...args: any[]): void;
    /** @description 打印调试日志 */
    debug(...args: any[]): void;
    /** @description 打印信息日志 */
    info(...args: any[]): void;
    /** @description 打印警告日志 */
    warn(...args: any[]): void;
    /** @description 打印错误日志 */
    error(...args: any[]): void;
    /** @description 打印致命错误日志 */
    fatal(...args: any[]): void;
    /** @description 打印标记日志 */
    mark(...args: any[]): void;
    /** @description 打印日志 */
    log(...args: any[]): void;
    /** @description 关闭日志 */
    off(): void;
    /**
     * @description 自定义前缀日志
     * @param level 日志等级
     * @param name 自定义前缀
     * @param args 日志内容
     */
    ct: (level: loggerevel, name: string, ...args: any[]) => void;
}
export {};
