import type tls from 'node:tls';

const HTML: string = `<!doctype html>
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

export function handleHttpSocket(socket: tls.TLSSocket): void {
  const id: string = `${socket.remoteAddress}:${socket.remotePort}`;
  let request: string = '';
  let responded: boolean = false;

  console.log(`[tls] handshake ok ${id} protocol=${socket.getProtocol()} cipher=${socket.getCipher().name}`);

  socket.setTimeout(5000);

  socket.on('data', (chunk: Buffer) => {
    if (responded) return;

    console.log(`[data] ${id} ${chunk.length} bytes`);
    request += chunk.toString('latin1');

    if (!request.includes('\r\n\r\n')) return;

    const requestLine: string = request.split('\r\n', 1)[0];
    console.log('Request:', requestLine);

    const [method, path] = requestLine.split(' ');

    let status: string = '200 OK';
    let body: string = HTML;

    if (method !== 'GET') {
      status = '405 Method Not Allowed';
      body = 'Method Not Allowed';
    } else if (path !== '/' && path !== '/links') {
      status = '404 Not Found';
      body = 'Not Found';
    }

    const contentType: string =
      body === HTML ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8';

    const response: string =
      `HTTP/1.1 ${status}\r\n` +
      `Content-Type: ${contentType}\r\n` +
      `Content-Length: ${Buffer.byteLength(body)}\r\n` +
      `Connection: close\r\n` +
      `\r\n` +
      body;

    responded = true;
    socket.end(response);
  });

  socket.on('end', () => {
    console.log(`[end] ${id} client finished sending`);
  });

  socket.on('timeout', () => {
    console.log(`[timeout] ${id} idle, closing`);
    socket.destroy();
  });

  socket.on('drain', () => {
    console.log(`[drain] ${id} write buffer empty`);
  });

  socket.on('error', (err: NodeJS.ErrnoException) => {
    console.error(`[error] ${id} ${err.code ?? ''} ${err.message}`);
  });

  socket.on('close', (hadError: boolean) => {
    console.log(`[close] ${id} hadError=${hadError}`);
  });
}
