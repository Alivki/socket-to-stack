import http from 'node:http';
import { route } from './router.ts';
import { sendHtml, HttpError } from './respond.ts';
import { errorPage } from './render.ts';
import { compose } from './middleware/compose.ts';
import { logger } from './middleware/logger.ts';

const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 3020);

const handler = compose([logger], route);

const server = http.createServer();

server.on('request', async (req, res) => {
    try {
        await handler(req, res);
    } catch (err) {
        const status = err instanceof HttpError ? err.status : 500;
        const message = err instanceof HttpError ? err.message : 'Internal Server Error';
        if (status === 500) console.error(err);
        if (!res.headersSent) sendHtml(res, status, errorPage(status, message));
        else res.end();
    }
});

server.listen(port, host, () => {
    console.log(`HTTP server listening at http://${host}:${port}`);
});

process.on('SIGINT', () => {
  console.log('\nshutting down...');
  server.close(() => process.exit(0));
});
