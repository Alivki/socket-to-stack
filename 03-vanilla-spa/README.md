# 03 · Vanilla SPA

The same link stash, split in two: the server only returns JSON, and the browser builds the page with plain JS. No framework and no dependencies.

## Run

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open http://127.0.0.1:3030.

For the CORS demo, also run `pnpm web` and open http://127.0.0.1:3031.

## Routes

| Method | Path                | What it does           |
| ------ | ------------------- | ---------------------- |
| GET    | `/`                 | The page shell         |
| GET    | `/api/v1/links`     | List links             |
| POST   | `/api/v1/links`     | Add a link (JSON body) |
| DELETE | `/api/v1/links/:id` | Delete a link          |
| GET    | `/public/*`         | Static files           |

## Files

```
src/
  server.ts       starts the API server, errors as JSON
  web.ts          serves only the frontend on 3031 (CORS demo)
  router.ts       picks a handler from method + path
  respond.ts      helpers: send JSON, read body, static files
  store.ts        reads and writes data.json, one write at a time
  middleware/
    compose.ts    runs middleware in order, then the router
    logger.ts     logs method, path, status, time
    security.ts   CSP, HSTS and other security headers
    cors.ts       allowed origins and preflight
    rateLimit.ts  30 requests burst, then 3/sec per IP (429)
    chaos.ts      fake delays and failures for testing
public/
  index.html      the page shell
  app.js          state and actions
  api.js          fetch with timeout and retries
  view.js         builds the DOM from state
  style.css
```

## What it covers

- **Client state:** loading, empty and error states, rendered by hand
- **CORS:** clear `ALLOWED_ORIGINS` and the browser blocks the 3031 page
- **Timeouts:** requests are cancelled after 5s. Try `CHAOS_DELAY_MS=6000`
- **Retries:** backoff and jitter on GET and DELETE. Try `CHAOS_FAIL_RATE=0.5`
- **Versioning:** the API lives under `/api/v1`
- **Lost updates fixed:** writes to `data.json` run one at a time
