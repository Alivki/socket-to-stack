import type { Middleware } from './compose.ts';
import { HttpError } from '../respond.ts';

const DELAY_MS = Number(process.env.CHAOS_DELAY_MS ?? 0);
const FAIL_RATE = Number(process.env.CHAOS_FAIL_RATE ?? 0);

export const chaos: Middleware = async (req, _res, next) => {
    if (!req.url?.startsWith('/api/')) return next();

    if (DELAY_MS > 0) await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    if (Math.random() < FAIL_RATE) throw new HttpError(503, 'Service Unavailable (chaos)');

    await next();
};