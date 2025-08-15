import express, { Express, Request, Response } from 'express';
export default class ExpressInit {
    app: express.Express;
    cfg: import("../../service/config/type.js").cfg;
    limiter: import("express-rate-limit").RateLimitRequestHandler;
    cache: Record<string, any>;
    auth: express.RequestHandler;
    constructor(app: Express);
    init(): Promise<void>;
    RegisterRoute(): Promise<void>;
    RegisterUse(): Promise<void>;
    getFolderInfo(): Promise<{
        name: any;
        path: string;
        imageCount: number;
        accessCount: number;
    }[]>;
    RandomImg(): (req: Request, res: Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
}
