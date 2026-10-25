import type { Socket, SocketHandler } from 'bun';
import { parseRequest, handle, serialize, text } from './http.ts';

const host: string = process.env.HOST ?? '127.0.0.1';
const port: number = Number(process.env.TLS_PORT ?? 3444);

const MAX_HEADER_BYTES = 16 * 1024;
const IDLE_TIMEOUT_S = 5;

type SocketData = {
  id: string;
  request: string;
  responded: boolean;
  pending: Buffer | null;
};

function flush(socket: Socket<SocketData>): void {
  const pending = socket.data.pending;
  if (!pending) return;

  const written = socket.write(pending);
  if (written < pending.length) {
    socket.data.pending = pending.subarray(Math.max(written, 0));
    return;
  }
  socket.data.pending = null;
  socket.end();
}

function send(socket: Socket<SocketData>, payload: Buffer): void {
  socket.data.responded = true;
  socket.data.pending = payload;
  flush(socket);
}

const handlers = {
  open(socket) {
    socket.data = { id: socket.remoteAddress, request: '', responded: false, pending: null };
    socket.timeout(IDLE_TIMEOUT_S);
    console.log(`[open] ${socket.data.id}`);
  },

  handshake(socket, success, authorizationError) {
    if (success) console.log(`[tls] handshake ok ${socket.data.id}`);
    else console.error(`[tls] handshake failed ${socket.data.id}: ${authorizationError?.message}`);
  },

  data(socket, chunk) {
    if (socket.data.responded) return;

    socket.data.request += chunk.toString('latin1');

    const headerEnd = socket.data.request.indexOf('\r\n\r\n');
    if (headerEnd === -1) {
      if (socket.data.request.length > MAX_HEADER_BYTES) {
        send(socket, serialize(text(431, 'Headers Too Large')));
      }
      return;
    }

    const req = parseRequest(socket.data.request.slice(0, headerEnd));
    console.log('Request:', req ? `${req.method} ${req.path}` : '(malformed)');

    send(socket, serialize(req ? handle(req) : text(400, 'Bad Request')));
  },

  drain: flush,

  end(socket) {
    console.log(`[end] ${socket.data.id} client finished sending`);
  },

  timeout(socket) {
    console.log(`[timeout] ${socket.data.id} idle, closing`);
    socket.end();
  },

  error(socket, error) {
    console.error(`[error] ${socket.data?.id}: ${error.message}`);
  },

  close(socket, error) {
    console.log(`[close] ${socket.data?.id} hadError=${!!error}`);
  },
} satisfies SocketHandler<SocketData>;

const server = Bun.listen<SocketData>({
  hostname: host,
  port,
  tls: {
    key: Bun.file('certs/key.pem'),
    cert: Bun.file('certs/cert.pem'),
  },
  socket: handlers,
});

console.log(`Bun TLS server listening at https://${server.hostname}:${server.port}`);

process.on('SIGINT', () => {
  console.log('\nshutting down...');
  server.stop(true);
  process.exit(0);
});
