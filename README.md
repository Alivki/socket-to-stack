# Socket to Stack

Learn how the web and modern frameworks actually work by building the same app 12 times, from raw sockets to SvelteKit. Each build adds one layer, so you feel the problem it solves before you use it.

**The app:** save a link with an optional note, list your links, delete one. The features never change. Only the stack does.

| #  | Project        | Teaches                             |
|----|----------------|-------------------------------------|
| 01 | Raw TCP + TLS  | HTTP is just text on a socket       |
| 02 | Node HTTP      | Middleware, XSS, CSRF, caching      |
| 03 | Vanilla SPA    | JSON API + manual DOM               |
| 04 | jQuery SPA     | The `<script>` tag era              |
| 05 | Typed stack    | Hono, SQLite, TS, auth, CI          |
| 06 | HTMX (Go)      | HTML over the wire, goroutines      |
| 07 | React          | useState / useEffect                |
| 08 | React + TanStack | Query, Router, Form, Table        |
| 09 | Manual SSR     | renderToString + hydration          |
| 10 | TanStack Start | Postgres, Redis, queues, observability |
| 11 | Next.js        | RSC, Server Actions, caching        |
| 12 | SvelteKit      | A compiler instead of a VDOM        |
| lab | Systems lab   | Load balancing, replicas, sharding, sagas |

Each folder runs on its own. Project `NN` runs on port `30NN`.
