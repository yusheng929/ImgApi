import { Sequelize } from 'sequelize';
export default class Sqlite {
    sequelize: Sequelize;
    client: import("sequelize").ModelCtor<import("sequelize").Model<any, any>>;
    constructor();
    init(): Promise<void>;
    /** 获取图片访问次数
     * @param name 图片文件夹名称
     * @return 返回图片访问次数
     */
    get(name: string): Promise<number>;
    /** 增加值
     * @param name 图片文件夹名称
     * @param count 增加的次数
     */
    add(name: string, count: number): Promise<boolean>;
}
