import http from 'node:http';

const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 3020);

const server = http.createServer();

server.on('request', (request, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('hello');
});

server.listen(port, host, () => {
    console.log(`HTTP server listening at http://${host}:${port}`);
});

process.on('SIGINT', () => {
  console.log('\nshutting down...');
  server.close(() => process.exit(0));
});