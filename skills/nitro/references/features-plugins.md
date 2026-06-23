---
name: plugins
description: Nitro plugins, runtime lifecycle hooks, error capture, and request/response handling
---

# Plugins & Lifecycle Hooks

Nitro plugins run **once** at server startup to extend runtime behavior. They are auto-registered from `plugins/` (by filename order) and receive the `nitroApp` context. Import `definePlugin` from `nitro`.

```ts [plugins/setup.ts]
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  console.log("Nitro starting");
});
```

> v3 renamed `defineNitroPlugin` → `definePlugin`. The plugin function itself must be synchronous (return `void`); the hooks it registers may be async. Register external plugins with the `plugins: ["~/plugins/x.ts"]` config option.

## The `nitroApp` context

| Property | Description |
|---|---|
| `hooks` | [hookable](https://github.com/unjs/hookable) instance to register lifecycle callbacks. |
| `h3` | The underlying H3 app instance. |
| `fetch(req)` | The app's internal fetch handler. |
| `captureError(error, ctx)` | Feed errors into the error hook pipeline. |

## Runtime hooks

Register lifecycle callbacks inside a plugin. `hook()` returns an unregister function.

| Hook | Signature | When |
|---|---|---|
| `request` | `(event) => void \| Promise` | Start of each request, before routing. |
| `response` | `(res: Response, event) => void \| Promise` | After the response is created. |
| `error` | `(error, { event?, tags? }) => void` | When any error is captured. |
| `close` | `() => void` | On server shutdown. |

```ts [plugins/lifecycle.ts]
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    console.log("→", event.path);
  });

  nitroApp.hooks.hook("response", (res, event) => {
    const { pathname } = new URL(event.req.url);
    if (pathname.endsWith(".js")) res.headers.append("Vary", "Origin");
  });

  nitroApp.hooks.hook("close", async () => {
    // clean up DB connections, timers, etc.
  });
});
```

The `request` hook is the very first code per request (errors there are captured, not fatal). The `response` hook runs for every response, including static assets and errors. On shutdown the server waits for pending `event.waitUntil` tasks.

## Error capture

```ts [plugins/errors.ts]
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("error", (error, { event, tags }) => {
    console.error(`[${tags?.join(",")}] ${event?.path}`, error);
  });

  // Manually report
  nitroApp.captureError(new Error("startup issue"), { tags: ["startup"] });
});
```

`tags` identify the source: `"request"`, `"response"`, `"cache"`, `"plugin"`, `"unhandledRejection"`, `"uncaughtException"`. Process-level unhandled rejections and uncaught exceptions are auto-captured into the `error` hook.

## Notes

- `runtimeHooks` are auto-enabled when at least one plugin exists; force with `features.runtimeHooks: true`.
- `NitroRuntimeHooks` is augmentable — presets add platform hooks (e.g. Cloudflare `cloudflare:scheduled`, `cloudflare:email`; Vercel `vercel:queue`).
- Outside plugins, use `useNitroHooks()` (instead of `useNitroApp().hooks`) to guarantee a hooks instance.

## Key Points

- Plugins run once at startup; use them to init resources and register hooks.
- Import `definePlugin` from `nitro` (not `defineNitroPlugin`).
- Use `request`/`response`/`error`/`close` hooks for cross-cutting runtime behavior.
- Customize response headers in the `response` hook via `res.headers`.

<!--
Source references:
- https://nitro.build/docs/plugins
- https://nitro.build/docs/lifecycle
-->
