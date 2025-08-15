import cfg from '../config/index.js';
import log4js from 'log4js';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
// 获取当前模块路径 (ESM替代方案)
// 确保 logs 目录存在
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}
const level = cfg.getcfg.server.log_level || 'info';
const daysToKeep = cfg.getcfg.server.log_days_to_keep || 7;
// 配置 log4js
log4js.configure({
    appenders: {
        // 控制台输出 - 带颜色
        console: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%[%p%]] %m'
            }
        },
        // 普通日志文件
        file: {
            type: 'dateFile',
            numBackups: daysToKeep || 7,
            filename: path.join(logsDir, 'logger'),
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %m'
            }
        },
        // 错误日志文件
        errors: {
            type: 'dateFile',
            filename: path.join(logsDir, 'logger.error'),
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %m'
            }
        }
    },
    categories: {
        default: {
            appenders: ['console', 'file'],
            level
        },
        error: {
            appenders: ['console', 'errors'],
            level: 'error'
        }
    }
});
// 创建 logger 实例
const logger = log4js.getLogger();
logger.chalk = chalk;
logger.red = chalk.red;
logger.green = chalk.green;
logger.yellow = chalk.yellow;
logger.blue = chalk.blue;
logger.magenta = chalk.magenta;
logger.cyan = chalk.cyan;
logger.white = chalk.white;
logger.gray = chalk.gray;
logger.violet = chalk.hex('#8A2BE2'); // 紫色
logger.pink = chalk.hex('#FFD1DC'); // 粉色
logger.ct = (level, name, ...args) => {
    switch (level) {
        case 'trace':
            return logger.trace(logger.pink(`[${name}]`), ...args);
        case 'debug':
            return logger.debug(logger.pink(`[${name}]`), ...args);
        case 'mark':
            return logger.mark(logger.pink(`[${name}]`), ...args);
        case 'info':
            return logger.info(logger.pink(`[${name}]`), ...args);
        case 'warn':
            return logger.warn(logger.pink(`[${name}]`), ...args);
        case 'error':
            return logger.error(logger.pink(`[${name}]`), ...args);
        case 'fatal':
            return logger.fatal(logger.pink(`[${name}]`), ...args);
        default:
            return logger.log(logger.pink(`[${name}]`), ...args);
    }
};
export default logger;
