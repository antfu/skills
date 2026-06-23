---
name: cache
description: Cached event handlers, cached functions, SWR, options and invalidation in Nitro
---

# Caching

Nitro's cache layer (powered by [ocache](https://github.com/unjs/ocache)) builds on the storage layer. Import helpers from `nitro/cache`.

## Cached handlers

`defineCachedHandler` works like `defineHandler` plus a cache-options argument.

```ts [routes/cached.ts]
import { defineCachedHandler } from "nitro/cache";

export default defineCachedHandler((event) => {
  return "I am cached for an hour";
}, { maxAge: 60 * 60 });
```

Behavior:
- Only `GET`/`HEAD` are cached; other methods bypass and call the handler.
- Auto-manages `etag`, `last-modified`, and `cache-control` headers, plus `304 Not Modified` for conditional requests.
- Concurrent requests for the same key are deduplicated (handler runs once).
- Responses with status `>= 400` or undefined body are **not** cached.
- Request headers are dropped on cache hits — use `varies` to keep specific ones.

## Cached functions

Cache any async function (e.g. an upstream API call) and reuse it across handlers.

```ts [routes/api/stars/[...repo].ts]
import { defineHandler, type H3Event } from "nitro";
import { defineCachedFunction } from "nitro/cache";

const cachedGHStars = defineCachedFunction(async (repo: string) => {
  const data = await fetch(`https://api.github.com/repos/${repo}`).then((r) => r.json());
  return data.stargazers_count;
}, {
  maxAge: 60 * 60,
  name: "ghStars",
  getKey: (repo: string) => repo,
});

export default defineHandler(async (event) => {
  const { repo } = event.context.params!;
  const stars = await cachedGHStars(repo).catch(() => 0);
  return { repo, stars };
});
```

> On edge workers the instance is destroyed after each request. Pass `event` as the **first** argument to the cached function (and to `getKey`) so Nitro can use `event.waitUntil` to finish background revalidation.

Cached values are JSON-serialized — don't return Symbols, Maps, or Sets.

## Caching via route rules

Wrap handlers in caching by glob pattern without touching handler code:

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  storage: { redis: { driver: "redis", url: "redis://localhost:6379" } },
  routeRules: {
    "/blog/**": { swr: true },                       // SWR, default maxAge
    "/api/**": { swr: 3600 },                        // SWR, 1h
    "/heavy/**": { cache: { maxAge: 3600, base: "redis" } }, // custom mountpoint
    "/api/realtime/**": { cache: false },            // disable
  },
});
```

Route-rule handlers use the group `nitro/route-rules`.

## Options

Shared (`defineCachedHandler` + `defineCachedFunction`):

| Option | Default | Description |
|---|---|---|
| `maxAge` | `1` | Seconds the cache is valid. |
| `swr` | `true` | Serve stale while revalidating in background. |
| `staleMaxAge` | `0` | Extra seconds a stale value is served. `-1` keeps serving stale during refresh. |
| `base` | `cache` | Storage mountpoint. |
| `name` | inferred | Cache namespace. |
| `group` | `nitro/handlers` / `nitro/functions` | Key group. |
| `getKey(...args)` | hash | Compute cache key. |
| `integrity` | code hash | Invalidate when changed. |
| `shouldInvalidateCache` / `shouldBypassCache` | — | Per-call predicates. |
| `onError(err)` | log | Custom error handling. |

Handler-only: `varies` (header names to include in the key / keep on request), `headersOnly` (only do conditional-request handling). Function-only: `transform(entry, ...args)`, `validate(entry, ...args)`.

## Cache keys & invalidation

Key pattern: `` `${base}:${group}:${name}:${getKey(...args)}.json` ``.

```ts
// Every cached function exposes .invalidate()
await cachedGHStars("unjs/nitro");             // populate
await cachedGHStars.invalidate("unjs/nitro");  // remove

// Or invalidate from anywhere with matching options
import { invalidateCache } from "ocache";
await invalidateCache({
  options: { name: "ghStars", group: "nitro/functions", getKey: (repo: string) => repo },
  args: ["unjs/nitro"],
});
```

The `name`, `group`, `base`, and `getKey` passed to `invalidateCache` must match the definition exactly, or a different key is computed.

## Key Points

- Import from `nitro/cache`; `swr` is enabled by default (`maxAge` defaults to 1s).
- `defineCachedFunction` is for caching reusable logic; `defineCachedHandler` caches whole responses.
- On edge, always thread `event` through cached functions for `waitUntil`-backed refresh.
- Use route rules (`cache`/`swr`) for declarative, app-wide caching strategies.

<!--
Source references:
- https://nitro.build/docs/cache
- https://nitro.build/docs/routing#route-rules
-->
