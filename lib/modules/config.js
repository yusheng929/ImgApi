import fs from 'fs';
// import chokidar from 'chokidar'
import path from 'path';
import { fileURLToPath } from 'url';
// import logger from './logger.js'
class Config {
    config;
    watcher;
    constructor() {
        this.config = null;
        this.watcher = null;
    }
    /** 获取配置 */
    get getcfg() {
        if (this.config)
            return this.config;
        this.config = JSON.parse(fs.readFileSync(path.join(this.root, 'config', 'config.json'), 'utf-8'));
        // this.watch()
        return this.config;
    }
    /** 获取项目根目录 */
    get root() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        return path.resolve(__dirname, '../../');
    }
}
export default new Config();
