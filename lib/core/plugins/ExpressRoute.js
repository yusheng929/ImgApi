import config from '../../service/config/index.js';
import express from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { getApiData } from './util.js';
import basicAuth from 'express-basic-auth';
export default class ExpressInit {
    app;
    cfg = config.getcfg;
    limiter;
    cache = {};
    auth;
    constructor(app) {
        this.app = app;
        this.limiter = rateLimit({
            windowMs: 60 * 1000,
            max: 60,
            message: '请求过于频繁，请稍后再试喵~',
            keyGenerator: (req) => {
                const customIp = req.headers['eo-connecting-ip'] || '';
                const IP = Array.isArray(customIp) ? customIp[0] : customIp;
                if (IP)
                    return IP;
                return ipKeyGenerator(req.ip);
            },
        });
        this.auth = basicAuth({ users: { [this.cfg.admin.username]: this.cfg.admin.password }, challenge: true, realm: 'Admin' });
    }
    async init() {
        await this.RegisterUse();
        await this.RegisterRoute();
    }
    async RegisterRoute() {
        this.app.get('/image/:path', this.limiter, this.RandomImg());
        this.app.get('/admin', async (req, res) => {
            res.sendFile(path.join(config.root, 'resources/test', 'index.html'));
        });
        this.app.get('/admin/file', this.auth, async (req, res) => {
            res.sendFile(path.join(config.root, 'resources/admin', 'file.html'));
        });
        this.app.get('/admin/file/getinfo', async (req, res) => {
            res.json([
                { name: 'vacation-photos', alias: '度假照片', match: 25 },
                { name: 'work-documents', alias: '工作文档', match: 12 },
                { name: 'family-pics', alias: '家庭照片', match: 48 },
                { name: 'screenshots', alias: '截图', match: 7 }
            ]);
        });
    }
    async RegisterUse() {
        this.app.use(express.static(path.join(config.root, 'resources/home')));
        this.app.use((req, res, next) => {
            const startTime = process.hrtime();
            const ip = req.headers['eo-connecting-ip'] || req.ip;
            logger.info(`${logger.green(`[${ip}]`)}[${req.method} ${req.url}] 开始处理`);
            res.on('finish', () => {
                const diff = process.hrtime(startTime);
                const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2); // 转换为毫秒
                logger.info(`${logger.green(`[${ip}]`)}[${req.method} ${req.url}] 处理完成 ${logger.green(`${durationMs}ms`)} 状态码 ${res.statusCode}`);
            });
            next();
        });
        this.app.use('/s', express.static(path.join(config.root, 'public/static')));
        this.app.use('/image', express.static(path.join(config.root, 'public/random')));
    }
    async getFolderInfo() {
        return await getApiData();
    }
    RandomImg() {
        return async (req, res) => {
            if (path.extname(req.url))
                return;
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const Path = path.join(config.root, 'public', 'random', req.params.path);
            if (!fs.existsSync(Path)) {
                return res.status(404).send('路径不存在喵~请检查是否存在API喵~');
            }
            try {
                const files = fs.readdirSync(Path);
                const imageFiles = files.filter(file => imageExtensions.includes(path.extname(file).toLowerCase()));
                if (imageFiles.length === 0) {
                    return res.status(404).send('没有找到图片文件');
                }
                const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
                res.redirect(`/image/${req.params.path}/${randomImage}`);
                if (!this.cache[req.params.path]) {
                    this.cache[req.params.path] = { count: 0, timer: null };
                }
                this.cache[req.params.path].count++;
                if (this.cache[req.params.path].timer) {
                    clearTimeout(this.cache[req.params.path].timer);
                }
                this.cache[req.params.path].timer = setTimeout(async () => {
                    await sql.add(req.params.path, this.cache[req.params.path].count);
                    this.cache[req.params.path] = null;
                }, 3000);
            }
            catch (err) {
                logger.error(err);
                res.status(500).send('服务器错误喵~请稍后再试喵~');
            }
        };
    }
}
