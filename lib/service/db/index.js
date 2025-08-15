import config from '../../service/config/index.js';
import path from 'path';
import { DataTypes, Sequelize } from 'sequelize';
import fs from 'fs';
const Path = path.join(config.root, 'data');
const dbPath = path.join(Path, 'data.db');
export default class Sqlite {
    sequelize;
    client;
    constructor() {
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: dbPath,
            logging: false
        });
        this.client = this.sequelize.define('Count', {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
                unique: true,
                validate: { notEmpty: true }
            },
            count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                validate: {
                    isInt: true,
                    min: 0
                }
            }
        }, { timestamps: false });
        this.init();
    }
    async init() {
        try {
            if (!fs.existsSync(dbPath)) {
                fs.mkdirSync(Path, { recursive: true });
                await this.client.sync({ force: true });
            }
        }
        catch (e) {
            logger.ct('error', 'DB', `数据库初始化失败: ${e}`);
        }
    }
    /** 获取图片访问次数
     * @param name 图片文件夹名称
     * @return 返回图片访问次数
     */
    async get(name) {
        try {
            const record = await this.client.findOne({ where: { name } });
            if (record) {
                return record.get('count');
            }
            return 0;
        }
        catch (e) {
            logger.ct('error', 'DB', `获取图片访问次数失败: ${e}`);
            return 0;
        }
    }
    /** 增加值
     * @param name 图片文件夹名称
     * @param count 增加的次数
     */
    async add(name, count) {
        try {
            const [data, created] = await this.client.findOrCreate({
                where: { name },
                defaults: { count }
            });
            if (!created)
                await data.update({ count: data.get('count') + count });
            return true;
        }
        catch (e) {
            logger.ct('error', 'DB', '新增数据错误', e);
            return false;
        }
    }
}
