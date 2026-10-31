import type { Middleware } from './compose.ts';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:3030';

const CSP = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self'",
    `connect-src 'self' ${API_URL}`,
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "object-src 'none'",
].join('; ');

export const securityHeaders: Middleware = async (_req, res, next) => {
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    await next();
};