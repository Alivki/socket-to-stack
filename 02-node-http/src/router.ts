import type { IncomingMessage, ServerResponse } from 'node:http';
import { readLinks, addLink, deleteLink } from './store.ts';
import { homePage, errorPage } from './render.ts';
import { sendHtml, redirect, readForm, serveStatic, HttpError } from './respond.ts';

export async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');

    if (req.method === 'GET' && pathname.startsWith('/public/')) {
        return serveStatic(pathname, req, res);
    }

    switch(`${req.method} ${pathname}`) {
        case 'GET /': {
            return sendHtml(res, 200, homePage(await readLinks()));
        }

        case 'POST /links': {
            const form = await readForm(req);
            const url = form.get('url')?.trim() ?? '';
            const note = form.get('note')?.trim() ?? '';
            if (!url) throw new HttpError(400, 'url is required');
            if (!/^https?:\/\//i.test(url)) throw new HttpError(400, 'url must start with http:// or https://');
            await addLink(url, note);
            return redirect(res, '/');
        }

        case 'POST /links/delete': {
            const form = await readForm(req);
            const id = form.get('id') ?? '';
            if (!(await deleteLink(id))) throw new HttpError(404, 'Link not found');
            return redirect(res, '/');
        }

        default:
            throw new HttpError(404, 'Not Found');
    }
}