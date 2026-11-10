import { Hono } from 'hono';
import index from '../client/index.html';

const app = new Hono().basePath('/api/v1');
app.get('/links', (c) => c.json([]));

Bun.serve({
    port: Number(process.env.PORT ?? 3004),
    development: process.env.NODE_ENV !== 'production',
    routes: { '/': index },
    fetch: app.fetch,
});