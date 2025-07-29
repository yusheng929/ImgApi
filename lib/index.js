import express from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import logger from './modules/logger.js';
import config from './modules/config.js';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import _ from 'lodash';
/** 公共目录 */
const cfg = config.getcfg;
const filePath = path.join(config.root, 'public');
if (!fs.existsSync(filePath))
    fs.mkdirSync(filePath, { recursive: true });
/** 图片后缀 */
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
async function useData(type, key) {
    if (type === 'read') {
        let count = null;
        if (cfg.redis.enable) {
            const redis = (await import('./modules/redis.js')).default;
            count = await redis.get(`count:${key}`);
        }
        else {
            const JsonFile = path.join(config.root, 'data', 'count.json');
            if (fs.existsSync(JsonFile)) {
                const data = await JSON.parse(fs.readFileSync(JsonFile, 'utf-8'));
                count = data.find(item => item.name === key)?.count || null;
            }
        }
        if (count) {
            return Number(count);
        }
        return 0;
    }
    else {
        if (cfg.redis.enable) {
            const redis = (await import('./modules/redis.js')).default;
            const currentCount = await redis.get(`count:${key}`);
            await redis.set(`count:${key}`, String(Number(currentCount) + 1));
        }
        else {
            const JsonFile = path.join(config.root, 'data', 'count.json');
            let data;
            if (!fs.existsSync(JsonFile)) {
                fs.mkdirSync(path.dirname(JsonFile), { recursive: true });
                data = [{ name: key, count: 1 }];
            }
            else {
                data = await JSON.parse(fs.readFileSync(JsonFile, 'utf-8'));
                const index = data.findIndex(item => item.name === key);
                if (index !== -1) {
                    data[index].count += 1;
                }
                else {
                    data.push({ name: key, count: 1 });
                }
            }
            fs.writeFileSync(JsonFile, JSON.stringify(data, null, 2), 'utf-8');
        }
    }
}
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
    const apiFolders = (fs.readdirSync(filePath, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    return Promise.all(apiFolders.map(async (folder) => {
        let name;
        try {
            const file = path.join(filePath, folder, '0.json');
            if (!fs.existsSync(file))
                fs.writeFileSync(file, JSON.stringify({ name: folder }, null, 2), 'utf-8');
            name = JSON.parse(fs.readFileSync(file, 'utf-8')).name;
        }
        catch (e) {
            name = folder;
        }
        return {
            /** 文件夹名称 */
            name,
            path: folder,
            /** 图片数量 */
            imageCount: (fs.readdirSync(`${filePath}/${folder}`, { withFileTypes: true })
                .filter(file => {
                if (!file.isFile())
                    return false; // 确保是文件，不是目录
                const ext = path.extname(file.name).toLowerCase(); // 获取文件扩展名（小写）
                return imageExtensions.includes(ext); // 检查是否是图片
            })).length,
            /** 访问次数 */
            accessCount: await useData('read', folder) || 0
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
app.use((req, res, next) => {
    logger.info(req.headers.upgrade);
    next();
});
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true, path: '/ws' });
server.on('upgrade', (req, socket, head) => {
    if (req.url === '/ws') {
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
            logger.info(req.headers);
        });
    }
    else {
        socket.destroy();
    }
});
wss.on('connection', async (ws) => {
    const uptimeInterval = setInterval(async () => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'uptime',
                data: await getTime()
            }));
        }
    }, 1000);
    ws.on('close', () => {
        clearInterval(uptimeInterval);
        clearInterval(apiDateInterval);
    });
    ws.send(JSON.stringify({
        type: 'init',
        data: {
            uptime: await getTime(),
            apiData: await getApiData()
        }
    }));
    let apiData = await getApiData();
    const apiDateInterval = setInterval(async () => {
        const a = _.differenceWith(apiData, await getApiData(), _.isEqual);
        if (a.length > 0) {
            apiData = await getApiData();
            ws.send(JSON.stringify({
                type: 'apiData',
                data: apiData
            }));
        }
    }, 5000);
});
app.use(express.static(path.join(config.root, 'resources/html')));
app.use((req, res, next) => {
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
app.get('/test', (req, res) => {
    res.sendFile(path.join(config.root, 'resources/test/test.html'));
});
app.get('/image/:path', limiter, async (req, res) => {
    const Path = `${filePath}/${req.params.path}`;
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
        await useData('write', req.params.path);
    }
    catch (err) {
        logger.error(err);
        res.status(500).send('服务器错误喵~请稍后再试喵~');
    }
});
server.listen(cfg.server.port, cfg.server.host, async () => {
    logger.ct('info', 'Express', `服务器运行中 ${logger.green(`http://${cfg.server.host}:${cfg.server.port}`)}`);
});
