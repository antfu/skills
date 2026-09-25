---
name: rendering
description: Renderer for catch-all HTML/SSR, server entry global handler, and framework integration in Nitro
---

# Renderer & Server Entry

Two special handlers control requests that aren't matched by `routes/`: the **server entry** (runs first, for cross-cutting concerns) and the **renderer** (catch-all `/**`, lowest priority).

Matching order: `request` hook → route rules → middleware → specific routes → **server entry** → **renderer**.

## Server entry

Auto-detected from `server.ts` (or `.js/.mjs/.mts/.tsx/.jsx`) in `serverDir` (if set) or the project root. It is registered as a catch-all (`/**`) that runs only for requests **no route matched**, right before the renderer — it is a fallback, not global middleware (use [middleware](core-routing.md#middleware) for cross-cutting concerns). Its top-level code runs once at startup (before plugins). Return a `Response` to terminate, return nothing to continue.

```ts [server.ts]
export default {
  async fetch(req: Request) {
    const url = new URL(req.url);
    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }
    // return nothing -> continue to routes/renderer
  },
};
```

Or use `defineHandler` for the H3 event + context:

```ts [server.ts]
import { defineHandler } from "nitro";

export default defineHandler((event) => {
  event.context.requestId = crypto.randomUUID();
  // no return -> continue
});
```

Configure explicitly with `serverEntry` (a string, or `{ handler, format }`, or `false` to disable):

```ts [nitro.config.ts]
export default defineConfig({
  serverEntry: { handler: "./server.ts", format: "web" }, // "web" (default) or "node"
});
```

### Typed server options

When the default export is a plain object, use `defineServerEntry` for typed [srvx](https://srvx.h3.dev/) server options (`port`, `hostname`, `tls`, `maxRequestBodySize`, ...), applied by the Node/Bun/Deno presets:

```ts [server.ts]
import { defineServerEntry } from "nitro";

export default defineServerEntry({
  fetch: (req) => new Response("Hello"),
  port: 8080,
  maxRequestBodySize: 1024 * 1024,
});
```

`NITRO_PORT`/`PORT`, `NITRO_HOST`/`HOST`, `NITRO_SSL_CERT`/`NITRO_SSL_KEY` override the matching options. Options are read only from plain-object exports (not framework instances or `server.node.ts`).

### Framework integration

Any framework exposing a web `fetch(request): Response` works as a server entry:

```ts [server.ts]
import { Hono } from "hono";
const app = new Hono();
app.get("/", (c) => c.text("Hello from Hono!"));
export default app;
```

For Node-style `(req, res)` frameworks (Express, Fastify), name the file `server.node.ts` (or set `format: "node"`) — Nitro converts it via [srvx](https://srvx.h3.dev/):

```ts [server.node.ts]
import Express from "express";
const app = Express();
app.use("/", (_req, res) => res.send("Hello from Express!"));
export default app;
```

## Renderer

A catch-all that serves HTML/SSR for unmatched routes. Configured via `renderer`, or auto-detected from `index.html`.

```ts [nitro.config.ts]
export default defineConfig({
  renderer: {
    template: "./index.html", // HTML template
    handler: "./renderer.ts", // OR a custom handler (template ignored if set)
    static: false,            // serve template as-is, skip processing
  },
});
```

Set `renderer: false` to disable entirely.

### Auto-detected `index.html` (SPA)

If an `index.html` exists, Nitro serves it for all unmatched routes — the default SPA behavior with Vite. With a Vite `ssr` environment, add `<!--ssr-outlet-->` and Nitro injects SSR output.

### Custom renderer handler

```ts [renderer.ts]
export default function renderer({ req }: { req: Request }) {
  const url = new URL(req.url);
  return new Response(
    `<!DOCTYPE html><html><body><h1>${url.pathname}</h1></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}
```

### Rendu templates (experimental)

HTML templates support the [rendu](https://github.com/h3js/rendu) preprocessor:

```html [index.html]
<h1>Hello {{ $URL.pathname }}</h1>
<? if ($METHOD === "POST") { ?><p>Submitted!</p><? } ?>
<script server>
  const data = await fetch("https://api.example.com/data").then((r) => r.json());
</script>
<pre>{{ JSON.stringify(data) }}</pre>
```

- `{{ expr }}` HTML-escaped, `{{{ expr }}}` / `<?= expr ?>` raw, `<? ... ?>` control flow.
- Globals: `$REQUEST`, `$METHOD`, `$URL`, `$HEADERS`, `$RESPONSE`, `$COOKIES`.
- Functions: `setCookie`, `redirect`, `echo` (streaming), `htmlspecialchars`.

## Key Points

- Server entry = global pre-routing handler (auth, logging); renderer = catch-all HTML/SSR.
- Server entry returns `Response` to stop, or nothing to continue; keep it lightweight (runs every request).
- Web-fetch frameworks plug into `server.ts`; Node `(req,res)` ones use `server.node.ts`.
- A defined `[...].ts` catch-all route conflicts with the renderer (Nitro warns).

<!--
Source references:
- https://nitro.build/docs/server-entry
- https://nitro.build/docs/renderer
- https://nitro.build/docs/lifecycle
-->
