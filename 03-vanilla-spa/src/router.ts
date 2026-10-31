import type { IncomingMessage, ServerResponse } from 'node:http';
import { readLinks, addLink, deleteLink } from './store.ts';
import { sendJson, readJson, sendNoContent, serveFile, serveStatic, HttpError, PUBLIC_DIR } from './respond.ts';

const API_PREFIX = '/api/v1';
const MAX_URL_LENGTH = 2048;
const MAX_NOTE_LENGTH = 500;

export async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');

     if (pathname.startsWith(`${API_PREFIX}/`)) {
        return api(req, res, pathname.slice(API_PREFIX.length));
    }

     if (req.method === 'GET' && pathname === '/') {
        return serveFile(`${PUBLIC_DIR}index.html`, req, res);
    }

    if (req.method === 'GET' && pathname.startsWith('/public/')) {
        return serveStatic(pathname, req, res);
    }
}

async function api(req: IncomingMessage, res: ServerResponse, path: string): Promise<void> {
    const id = path.match(/^\/links\/([^/]+)$/)?.[1];
    const pattern = id ? '/links/:id' : path;

    switch (`${req.method} ${pattern}`) {
        case 'GET /links': {
            return sendJson(res, 200, await readLinks());
        }

        case 'POST /links': {
            const body = await readJson(req);
            const url = typeof body.url === 'string' ? body.url.trim() : '';
            const note = typeof body.note === 'string' ? body.note.trim() : '';
            if (!url) throw new HttpError(400, 'url is required');
            if (!/^https?:\/\//i.test(url) || !URL.canParse(url)) throw new HttpError(400, 'url must be a valid http(s) URL');
            if (url.length > MAX_URL_LENGTH) throw new HttpError(400, `url must be at most ${MAX_URL_LENGTH} characters`);
            if (note.length > MAX_NOTE_LENGTH) throw new HttpError(400, `note must be at most ${MAX_NOTE_LENGTH} characters`);
            return sendJson(res, 201, await addLink(url, note));
        }

        case 'DELETE /links/:id': {
            if (!(await deleteLink(id!))) throw new HttpError(404, 'Link not found');
            return sendNoContent(res);
        }

        default:
            throw new HttpError(404, 'Not Found');
    }
} 