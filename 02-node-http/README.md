# 02 · Node HTTP server

A link stash built on Node's `http` module, with hand-rolled routing, a plain HTML form and a JSON file for storage. No framework, no runtime dependencies.

Port: `3020`. See `.env.example`.

Install:

```bash
pnpm install
cp .env.example .env
```

Run:

```bash
pnpm dev     # restarts on file changes
pnpm start
```

Type check:

```bash
pnpm typecheck
```

## Routes

| Method | Path            | What it does                         |
| ------ | --------------- | ------------------------------------ |
| GET    | `/`             | List links, with the add form        |
| POST   | `/links`        | Save a link, then 303 back to `/`    |
| POST   | `/links/delete` | Delete a link, then 303 back to `/`  |
| GET    | `/public/*`     | Static files from `public/`          |

## Layout

```
src/
  server.ts     http.createServer, turns thrown HttpErrors into error pages
  router.ts     switch on `${method} ${pathname}`
  respond.ts    send helpers, body/form parsing, static files, HttpError
  render.ts     HTML templates and escapeHtml
  store.ts      read/write data.json (gitignored)
public/
  style.css
```

## Add-ons

- [x] XSS: user data goes through `escapeHtml`, and URLs must be http(s)
- [ ] Logging middleware (method, path, status, duration)
- [ ] HTTP caching: `Cache-Control` and `ETag` / 304
- [ ] CSRF: cookie sessions and a per-session token
- [ ] Rate limiting: in-memory token bucket per IP, 429
- [ ] Race condition: concurrent writes to `data.json`
- [ ] Security headers: CSP and HSTS
- [ ] Dockerfile
