# 02 · Node HTTP server

A small link stash built with Node's `http` module. No framework and no dependencies.

## Run

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open http://127.0.0.1:3020.

## Routes

| Method | Path            | What it does                   |
| ------ | --------------- | ------------------------------ |
| GET    | `/`             | List links and the add form    |
| POST   | `/links`        | Save a link, redirect to `/`   |
| POST   | `/links/delete` | Delete a link, redirect to `/` |
| GET    | `/public/*`     | Static files                   |

## Files

```
src/
  server.ts       starts the server, shows error pages
  router.ts       picks a handler from method + path
  respond.ts      helpers: send, redirect, read form, static files
  render.ts       HTML templates and escapeHtml
  store.ts        reads and writes data.json
  middleware/
    compose.ts    runs middleware in order, then the router
    logger.ts     logs method, path, status, time
    security.ts   CSP, HSTS and other security headers
    rateLimit.ts  10 requests burst, then 1/sec per IP (429)
public/
  style.css
```

## What it covers

- **XSS:** user input is escaped, and links must be http(s)
- **Caching:** CSS gets an `ETag`, and the server returns 304 when nothing changed
- **Logging, security headers, rate limiting:** hand-written middleware
- **Known issue:** two writes at the same time can overwrite each other in `data.json`

Skipped: CSRF and Docker.
