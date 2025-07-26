import { cfg } from '../types/config.js';
declare class Config {
    config: cfg | null;
    watcher: object | null;
    constructor();
    /** 获取配置 */
    get getcfg(): cfg;
    /** 获取项目根目录 */
    get root(): string;
}
declare const _default: Config;
export default _default;
