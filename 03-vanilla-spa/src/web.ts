import http from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { sendHtml, sendText, serveStatic, HttpError, PUBLIC_DIR } from './respond.ts';
import { compose } from './middleware/compose.ts';
import { logger } from './middleware/logger.ts';
import { securityHeaders } from './middleware/security.ts';

const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.WEB_PORT ?? 3031);
const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:3030';

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');

    if (req.method === 'GET' && pathname === '/') {
        const html = await readFile(`${PUBLIC_DIR}index.html`, 'utf8');
        return sendHtml(res, 200, html.replace('<html lang="en">', `<html lang="en" data-api="${apiUrl}">`));
    }

    if (req.method === 'GET' && pathname.startsWith('/public/')) {
        return serveStatic(pathname, req, res);
    }

    throw new HttpError(404, 'Not Found');
}

const handler = compose([logger, securityHeaders], route)

const server = http.createServer();

server.on('request', async (req, res) => {
    try {
        await handler(req, res);
    } catch (err) {
        const status = err instanceof HttpError ? err.status : 500;
        if (status === 500) console.error(err);
        if (!res.headersSent) sendText(res, status, err instanceof HttpError ? err.message : 'Internal Server Error');
        else res.end();
    }
});

server.listen(port, host, () => {
    console.log(`Web listening at http://${host}:${port} (API: ${apiUrl})`);
});

process.on('SIGINT', () => {
    server.close(() => process.exit(0));
});
