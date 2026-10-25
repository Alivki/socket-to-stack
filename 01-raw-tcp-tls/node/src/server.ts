import tls from 'node:tls';
import type { Socket } from 'node:net';
import { readFileSync } from 'node:fs';
import { handleHttpSocket } from './http-handler.ts';

const host: string = process.env.HOST ?? '127.0.0.1';
const port: number = Number(process.env.TLS_PORT ?? 3443);

const server: tls.Server = tls.createServer(
  {
    key: readFileSync('certs/key.pem'),
    cert: readFileSync('certs/cert.pem'),
  },
  handleHttpSocket 
);

server.on('connection', (raw: Socket) => {
  console.log(`[tcp] connection from ${raw.remoteAddress}:${raw.remotePort} (handshake not done yet)`);
});

server.on('tlsClientError', (err: Error, socket: tls.TLSSocket) => {
  console.error(`[tlsClientError] ${socket.remoteAddress}: ${err.message}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  console.error('[server error]', err.code, err.message);
});

server.on('close', () => {
  console.log('[server] closed');
});

server.listen(port, host, () => {
  console.log(`TLS server listening at https://${host}:${port}`);
});

process.on('SIGINT', () => {
  console.log('\nshutting down...');
  server.close();
});
