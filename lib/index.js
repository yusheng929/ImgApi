import express from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import logger from './modules/logger.js';
import cfg from './modules/config.js';
import { redis } from './modules/redis.js';
/** 图片后缀 */
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
/** 获取访问次数
 * @param folder API文件夹名称
 * @returns 访问次数
 */
const getCount = async (folder) => {
    const count = Number(await redis.get(`count:${folder}`));
    if (count) {
        return count;
    }
    return 0;
};
/** 获取运行时间
 * @returns 运行时间字符串
 */
const getTime = async () => {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
};
/** 获取API数据
 * @returns API数据对象
 */
const getApiData = async () => {
    const apiFolders = (fs.readdirSync(`${cfg.root}/public`, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    return Promise.all(apiFolders.map(async (folder) => {
        let name;
        try {
            name = (await import(`file://${cfg.root}/public/${folder}/0.js`)).default.name;
        }
        catch (e) {
            name = folder;
        }
        return {
            /** 文件夹名称 */
            name,
            path: folder,
            /** 图片数量 */
            imageCount: (fs.readdirSync(`${cfg.root}/public/${folder}`, { withFileTypes: true })
                .filter(file => {
                if (!file.isFile())
                    return false; // 确保是文件，不是目录
                const ext = path.extname(file.name).toLowerCase(); // 获取文件扩展名（小写）
                return imageExtensions.includes(ext); // 检查是否是图片
            })).length,
            /** 访问次数 */
            accessCount: await getCount(folder) || 0
        };
    }));
};
const limiter = rateLimit({
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
const app = express();
app.use(express.static(path.join(cfg.root, 'resources/html')));
app.use((req, res, next) => {
    if (req.path !== '/api/time' && req.path !== '/api/status') {
        const startTime = process.hrtime();
        const ip = req.headers['eo-connecting-ip'] || req.ip;
        logger.info(`${logger.green(`[${ip}]`)}[${req.method} ${req.url}] 开始处理`);
        res.on('finish', () => {
            const diff = process.hrtime(startTime);
            const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2); // 转换为毫秒
            logger.info(`${logger.green(`[${ip}]`)}[${req.method} ${req.url}] 处理完成 ${logger.green(`${durationMs}ms`)} 状态码 ${res.statusCode}`);
        });
    }
    next();
});
// 添加状态路由
app.get('/api/status', async (req, res) => {
    try {
        const uptime = await getTime();
        const apiData = await getApiData();
        res.json({ uptime, apiData });
    }
    catch (error) {
        logger.error(error);
        res.status(500).json({ error: '获取状态失败' });
    }
});
app.get('/api/time', async (req, res) => {
    res.json(await getTime());
});
app.get('/image/:path', limiter, async (req, res) => {
    const Path = `${cfg.root}/public/${req.params.path}`;
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
        const imagePath = path.join(Path, randomImage);
        const ext = path.extname(randomImage).toLowerCase();
        let contentType = 'image/jpeg';
        if (ext === '.png')
            contentType = 'image/png';
        else if (ext === '.gif')
            contentType = 'image/gif';
        else if (ext === '.webp')
            contentType = 'image/webp';
        res.set('Content-Type', contentType);
        fs.createReadStream(imagePath).pipe(res);
        const data = await redis.get(`count:${req.params.path}`);
        if (!data)
            return await redis.set(`count:${req.params.path}`, '1');
        await redis.set(`count:${req.params.path}`, String(Number(data) + 1));
    }
    catch (err) {
        logger.error(err);
        res.status(500).send('服务器错误喵~请稍后再试喵~');
    }
});
app.listen(cfg.getcfg.port, async () => {
    logger.ct('info', 'Express', `服务器运行中 ${logger.green(`http://127.0.0.1:${cfg.getcfg.port}`)}`);
});
