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
        this.init();
    }
    init() {
        const defPath = path.join(this.root, 'config', 'def_config', 'config.json');
        const cfgPath = path.join(this.root, 'config', 'config.json');
        if (!fs.existsSync(cfgPath)) {
            fs.copyFileSync(defPath, cfgPath);
        }
        else {
            const data1 = Object.keys(JSON.parse(fs.readFileSync(defPath, 'utf-8')));
            const data2 = Object.keys(JSON.parse(fs.readFileSync(cfgPath, 'utf-8')));
            const newKey = data1.filter(item => !data2.includes(item));
            if (newKey.length > 0) {
                const cfg = this.getcfg;
                const defcfg = this.defcfg;
                newKey.forEach(key => {
                    cfg[key] = defcfg[key];
                });
                fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf-8');
            }
        }
    }
    /** 获取默认配置 */
    get defcfg() {
        const defPath = path.join(this.root, 'config', 'def_config', 'config.json');
        return JSON.parse(fs.readFileSync(defPath, 'utf-8'));
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
