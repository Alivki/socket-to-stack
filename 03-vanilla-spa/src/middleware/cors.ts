import type { Middleware } from './compose.ts';

const ALLOWED_ORIGINS = new Set(
    (process.env.ALLOWED_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
);

export const cors: Middleware = async (req, res, next) => {
    const origin = req.headers.origin;
    const allowed = origin !== undefined && ALLOWED_ORIGINS.has(origin);

    res.setHeader('Vary', 'Origin');

    if (allowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    if (req.method === 'OPTIONS') {
        if (allowed) {
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Access-Control-Max-Age', '600');
        }
        res.writeHead(204);
        res.end();
        return;
    }

    await next();
}