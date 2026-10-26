import type { Link } from './store.ts';

function escapeHtml(s: string): string {
    return s
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function layout(title: string, body: string): string {
    return `<!doctype html>
        <html lang="en">
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(title)}</title>
        <link rel="stylesheet" href="/public/style.css">
        </head>
        <body>
        <main>
        ${body}
        </main>
        </body>
        </html>`;
}

export function homePage(links: Link[]): string {
  const items = links
    .map(
      (l) => `
    <li>
      <a href="${escapeHtml(l.url)}">${escapeHtml(l.url)}</a>
      <p>${escapeHtml(l.note)}</p>
      <form method="post" action="/links/delete">
        <input type="hidden" name="id" value="${escapeHtml(l.id)}">
        <button type="submit">Delete</button>
      </form>
    </li>`
    )
    .join('');

  return layout(
    'socket to stack',
    `
    <h1>Stash</h1>
    <form method="post" action="/links" class="add">
      <input name="url" type="url" placeholder="https://..." required>
      <input name="note" type="text" placeholder="Note">
      <button type="submit">Save</button>
    </form>
    <ul class="links">${items || '<li class="empty">Nothing stashed yet.</li>'}</ul>`
  );
}

export function errorPage(status: number, message: string): string {
  return layout(`${status}`, `<h1>${status}</h1><p>${escapeHtml(message)}</p><p><a href="/">Back</a></p>`);
}