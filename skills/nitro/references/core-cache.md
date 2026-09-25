---
name: cache
description: Cached event handlers, cached functions, SWR, options and invalidation in Nitro
---

# Caching

Nitro's cache layer (powered by [ocache](https://ocache.unjs.io)) builds on the storage layer. Import helpers from `nitro/cache`.

> **v3 note:** `swr` now defaults to **`false`** (v2 defaulted to `true`), and `maxAge` defaults to **1 second** — always set both explicitly for anything you want cached.

## Cached handlers

`defineCachedHandler` works like `defineHandler` plus a cache-options argument.

```ts [routes/cached.ts]
import { defineCachedHandler } from "nitro/cache";

export default defineCachedHandler((event) => {
  return "I am cached for an hour";
}, { maxAge: 60 * 60 });
```

Behavior:
- Only `GET`/`HEAD` are cached (stored under **separate** entries); other methods and requests with a `Range` header bypass and call the handler.
- Auto-manages `etag` (weak, from body hash), `cache-control` (synthesized from the enforced lifetime), `vary`, and `x-cache` (`HIT`/`STALE`/`REVALIDATED`/`MISS`) headers, plus `304 Not Modified` for conditional requests.
- Concurrent requests for the same key are deduplicated (handler runs once), bounded by `maxResolveTime` (30s default).
- `last-modified` is never synthesized; a handler-set `cache-control` is never overwritten.

### What the handler can see

On cacheable requests the handler only receives request data covered by the cache key; everything else is stripped so it can't render output the key doesn't distinguish:

- **Headers** are stripped unless in `varies` (includes `if-none-match`/`if-modified-since`, handled by Nitro).
- **Query params** are stripped unless in `allowQuery` (default: none; `/page` and `/page?a=1` share one entry).
- **Cookies** are stripped unless in `allowCookies`; `set-cookie` is dropped from cached responses.
- **`authorization`/`proxy-authorization`** are stripped unless `allowAuthorization` is set.
- **`host`** is rewritten to the resolved origin host (part of the key), so multi-host handlers get one entry per host.

Use `shouldBypassCache` for requests that must reach the handler untouched (not stored).

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
  const { repo } = event.context.params;
  const stars = await cachedGHStars(repo).catch(() => 0);
  return { repo, stars };
});
```

> On edge workers the instance is destroyed after each request. Pass `event` as the **first** argument to the cached function (and to `getKey`) so Nitro can use `event.waitUntil` for background revalidation; on platforms with no request-carried `waitUntil`, pass the `waitUntil` option instead.

Cached values are JSON-serialized — don't return Symbols, Maps, or Sets (use `serialize`/`transform` for special shapes). Byte values (`Uint8Array`/`ArrayBuffer`) are handled and always returned as `Uint8Array`.

## Caching via route rules

Wrap handlers in caching by glob pattern without touching handler code:

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  kv: { redis: { driver: "redis", url: "redis://localhost:6379" } },
  routeRules: {
    "/blog/**": { swr: 3600 },                       // SWR, 1h (swr:true = 1s default)
    "/heavy/**": { cache: { maxAge: 3600, base: "redis" } }, // custom mountpoint
    "/api/realtime/**": { cache: false },            // disable
  },
});
```

Route-rule handlers use the group `nitro/route-rules`, and the generated `name` scopes the entry to the route, method and pattern (unique per process — set an explicit `name` to share entries across workers/restarts with persistent storage).

## Options

### Shared (`defineCachedHandler` + `defineCachedFunction`)

| Option | Default | Description |
|---|---|---|
| `maxAge` | `1` | Seconds the cache is valid. `0` disables caching. |
| `swr` | `false` | Serve stale while revalidating in background. |
| `staleMaxAge` | — | Extra seconds a stale value is served (only with `swr`). `0` = never stale; unset = no TTL written. |
| `base` | `/cache` | Storage base (→ `cache:` prefix). An array enables multi-tier reads/writes. |
| `name` | inferred | Cache namespace (falls back to a hash of the function source). |
| `group` | `nitro/handlers` / `nitro/functions` | Key group. |
| `getKey(...args)` | hash | Compute cache key (does not change request narrowing). |
| `integrity` | code+options hash | Invalidate when changed. |
| `getMaxAge(entry)` | — | Derive lifetime per entry from the resolved value. |
| `maxResolveTime` | `30` | Deadline (s) for one shared resolution. |
| `storage` | cache storage | Override the backend for this handler/function. |
| `waitUntil(promise)` | — | Hand background work to the host runtime. |
| `shouldInvalidateCache` / `shouldBypassCache` | — | Per-call predicates. |
| `onError(err)` | log | Custom error handling. |

### Handler-only

`varies` (header names in the key / kept on request), `allowQuery` (`boolean \| string[]`), `allowCookies` (`string[]`, emits `Vary: Cookie`), `allowAuthorization`, `sendCacheControl` (default `true`; `false` = server-only caching), `cacheStatusHeader` (default `X-Cache`), `stream`, `maxBodySize`, `headersOnly`, `shouldCache(entry)`.

### Function-only

`transform(entry, ...args)` (read-side, `entry.status` = `hit`/`stale`/`revalidated`/`miss`), `serialize(entry, ctx)` (write-side), `validate(entry, ctx)`.

## What gets cached

Only responses with status `200`/`203`/`301`/`308`, a body, no `cache-control` opt-out (`no-store`/`private`/`no-cache`/zero shared lifetime), and no `Vary: *` (or `Vary` naming a header outside the key) are stored. Failing responses are still returned, just not stored — and get no synthesized `cache-control`. `must-revalidate` only disables SWR for that response.

## Cache keys & invalidation

Key pattern: `` `${base}:${group}:${name}:${getKey(...args)}.json` `` (`group`/`name` are sanitized; a hash is appended if characters were removed).

Cached **functions** expose on-demand methods:

```ts
await cachedGHStars("unjs/nitro");              // populate
await cachedGHStars.expire("unjs/nitro");       // mark stale (SWR: served while refreshing)
await cachedGHStars.invalidate("unjs/nitro");   // remove entirely
await cachedGHStars.resolveKeys("unjs/nitro");  // storage key(s) for these args
```

> `defineCachedHandler` returns a plain handler and does **not** expose these methods — move expensive work into a `defineCachedFunction` (called from a plain `defineHandler`) and invalidate the function when you need on-demand invalidation.

## Cache storage

Entries live under the `cache:` prefix. By default they sit in the in-memory root storage (**not persisted**). Configure a persistent backend by mounting a `cache` point via the `kv` option (see [core-storage](core-storage.md)):

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  kv: { cache: { driver: "redis" /* options */ } },
  $development: { kv: { cache: { driver: "fs", base: "./.data/cache" } } },
});
```

## Key Points

- Import from `nitro/cache`; `swr` and `maxAge` both default small — set them explicitly.
- `defineCachedFunction` caches reusable logic (and supports `.invalidate()`/`.expire()`); `defineCachedHandler` caches whole responses.
- On edge, always thread `event` through cached functions for `waitUntil`-backed refresh.
- Persist cache by mounting a `cache` point via the `kv` config option (not the removed `storage`).

<!--
Source references:
- https://nitro.build/docs/cache
- https://nitro.build/docs/routing#route-rules
- https://ocache.unjs.io
-->
