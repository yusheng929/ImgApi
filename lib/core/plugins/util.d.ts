/** 获取API数据
 * @returns API数据对象
 */
export declare function getApiData(): Promise<{
    /** 文件夹别名 */
    name: any;
    /** 文件夹名称 */
    path: string;
    /** 图片数量 */
    imageCount: number;
    /** 访问次数 */
    accessCount: number;
}[]>;
/** 获取运行时间
 * @returns 运行时间字符串
 */
export declare function getTime(): Promise<string>;
