import type { Middleware } from './compose.ts';
import { HttpError } from '../respond.ts';

const CAPACITY = 30;
const REFILL_PER_SEC = 3;

type Bucket = { tokens: number; last: number };

const buckets = new Map<string, Bucket>();

export const rateLimit: Middleware = async (req, res, next) => {
    const ip = req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();

    const bucket = buckets.get(ip) ?? { tokens: CAPACITY, last: now };
    bucket.tokens = Math.min(CAPACITY, bucket.tokens + ((now - bucket.last) / 1000) * REFILL_PER_SEC);
    bucket.last = now;
    buckets.set(ip, bucket);

    if (bucket.tokens < 1) {
        res.setHeader('Retry-After', Math.ceil((1 - bucket.tokens) / REFILL_PER_SEC));
        throw new HttpError(429, 'Too Many Requests');
    }

    bucket.tokens -= 1;
    await next();
};

setInterval(() => {
    const cutoff = Date.now() - 60_000;

    for (const [ip, bucket] of buckets) {
        if (bucket.last < cutoff) buckets.delete(ip);
    }
}, 60_000).unref();