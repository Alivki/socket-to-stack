import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

export type Link = {
  id: string;
  url: string;
  note: string;
  createdAt: string;
};

const DATA_FILE = process.env.DATA_FILE ?? new URL('../data.json', import.meta.url);

export async function readLinks(): Promise<Link[]> {
    try {
        return JSON.parse(await readFile(DATA_FILE, 'utf8')) as Link[];
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
        throw err;
    }
}

async function writeLinks(links: Link[]): Promise<void> {
    await writeFile(DATA_FILE, JSON.stringify(links, null, 2));
}

export async function addLink(url: string, note: string): Promise<Link> {
    const links = await readLinks();
    const link: Link = { id: randomUUID(), url, note, createdAt: new Date().toISOString() };
    links.push(link);
    await writeLinks(links);
    return link;
}

export async function deleteLink(id: string): Promise<boolean> {
    const links = await readLinks();
    const remaining = links.filter((link) => link.id !== id);
    if (remaining.length === links.length) return false;
    await writeLinks(remaining);
    return true;
}