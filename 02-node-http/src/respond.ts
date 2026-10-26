import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export class HttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export function sendHtml(res: ServerResponse, status: number, html: string): void {
    res.writeHead(status, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': Buffer.byteLength(html),
    });
    res.end(html);
}

export function sendText(res: ServerResponse, status: number, text: string): void {
    res.writeHead(status, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Length': Buffer.byteLength(text),
    });
    res.end(text);
}

export function redirect(res: ServerResponse, location: string): void {
    res.writeHead(303, { Location: location });
    res.end();
}

const MAX_BODY_BYTES = 1_000_000;

export function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        let size = 0;

        const onData = (chunk: Buffer): void => {
            size += chunk.length;
            if (size > MAX_BODY_BYTES) {
                req.off('data', onData);
                req.resume();
                reject(new HttpError(413, 'Payload Too Large'));
                return;
            }
            chunks.push(chunk);
        };

        req.on('data', onData);
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        req.on('error', reject);
    });
}

export async function readForm(req: IncomingMessage): Promise<URLSearchParams> {
    const type = req.headers['content-type'] ?? '';
    if (!type.startsWith('application/x-www-form-urlencoded')) {
        throw new HttpError(415, 'Unsupported Media Type');
    }
    return new URLSearchParams(await readBody(req));
}

const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));

const MIME: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

export async function serveStatic(urlPath: string, req: IncomingMessage, res: ServerResponse): Promise<void> {
    const filePath = resolve(PUBLIC_DIR, '.' + urlPath.slice('/public'.length));
    
    if (!filePath.startsWith(PUBLIC_DIR)) throw new HttpError(403, 'Forbidden');

    let body: Buffer;
    try {
        body = await readFile(filePath);
    } catch {
        throw new HttpError(404, 'Not Found');
    }

    const etag = `"${createHash('sha1').update(body).digest('base64url')}"`;
    const cacheHeaders = {
        'Cache-Control': 'public, max-age=0, must-revalidate',
        ETag: etag,
    };

    if (req.headers['if-none-match'] === etag) {
        res.writeHead(304, cacheHeaders);
        res.end();
        return;
    }

    res.writeHead(200, {
        ...cacheHeaders,
        'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
        'Content-Length': body.length,
    });
    res.end(body);
}