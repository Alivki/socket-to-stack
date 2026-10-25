export type HttpRequest = {
  method: string;
  path: string;
  version: string;
  headers: Record<string, string>;
};

export type HttpResponse = {
  status: number;
  headers?: Record<string, string>;
  body: string;
};

const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  400: 'Bad Request',
  404: 'Not Found',
  405: 'Method Not Allowed',
  431: 'Request Header Fields Too Large',
};

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Socket to Stack 01</title>
</head>
<body>
  <h1>Saved links</h1>
  <p>Raw TCP + TLS</p>
</body>
</html>`;

export function parseRequest(head: string): HttpRequest | null {
  const [requestLine, ...headerLines] = head.split('\r\n');
  const [method, path, version] = requestLine.split(' ');
  if (!method || !path || !version?.startsWith('HTTP/')) return null;

  const headers: Record<string, string> = {};
  for (const line of headerLines) {
    const i = line.indexOf(':');
    if (i > 0) headers[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }

  return { method, path, version, headers };
}

const html = (body: string): HttpResponse => ({
  status: 200,
  headers: { 'Content-Type': 'text/html; charset=utf-8' },
  body,
});

export const text = (status: number, body: string, headers: Record<string, string> = {}): HttpResponse => ({
  status,
  headers: { 'Content-Type': 'text/plain; charset=utf-8', ...headers },
  body,
});

type Handler = (req: HttpRequest) => HttpResponse;

const routes: Record<string, Handler> = {
  '/': () => html(HTML),
  '/links': () => html(HTML),
};

export function handle(req: HttpRequest): HttpResponse {
  if (req.method !== 'GET') return text(405, 'Method Not Allowed', { Allow: 'GET' });
  const handler = routes[req.path];
  return handler ? handler(req) : text(404, 'Not Found');
}

export function serialize(res: HttpResponse): Buffer {
  const body = Buffer.from(res.body, 'utf8');
  const headers = {
    ...res.headers,
    'Content-Length': String(body.length),
    Connection: 'close',
  };

  let head = `HTTP/1.1 ${res.status} ${STATUS_TEXT[res.status] ?? ''}\r\n`;
  for (const [k, v] of Object.entries(headers)) head += `${k}: ${v}\r\n`;
  head += '\r\n';

  return Buffer.concat([Buffer.from(head, 'latin1'), body]);
}
