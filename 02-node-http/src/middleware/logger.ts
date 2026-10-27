import type { Middleware } from './compose.ts';

export const logger: Middleware = async (req, res, next) => {
    const start = Data.now();

    res.on('finish', () => {
        console.log(`${req.method} ${req.url} ${res.statusCode} ${Data.now() - start}ms`);
    });

    await next();
}