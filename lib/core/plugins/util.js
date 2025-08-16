import path from 'path';
import config from '../../service/config/index.js';
import fs from 'fs';
const filePath = path.join(config.root, 'public', 'random');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
/** 获取API数据
 * @returns API数据对象
 */
export async function getApiData() {
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
            /** 文件夹别名 */
            name,
            /** 文件夹名称 */
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
            accessCount: await sql.get(folder) || 0
        };
    }));
}
/** 获取运行时间
 * @returns 运行时间字符串
 */
export async function getTime() {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
}
