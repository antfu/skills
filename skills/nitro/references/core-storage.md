---
name: storage
description: Runtime-agnostic KV storage via unstorage, useKV, mount points, and drivers in Nitro
---

# KV Storage

Nitro ships a runtime-agnostic key-value layer powered by [unstorage](https://unstorage.unjs.io). Access it with `useKV()` from `nitro/kv`.

> **v3 rename:** `useStorage` → `useKV` (imported from `nitro/kv`, not `nitro/storage`), and the `storage` config option → `kv`. The old names still work as deprecated aliases. `devStorage` is replaced by `kv` inside `$development` (and `$prerender`).

## Usage

```ts
import { useKV } from "nitro/kv";

// Default storage (in-memory, not persisted across restarts)
await useKV().setItem("test:foo", { hello: "world" });
const value = await useKV().getItem("test:foo");

// Scope to a base/mountpoint
const test = useKV("test");
await test.setItem("foo", { hello: "world" });

// Type the return value
await useKV<{ hello: string }>("test").getItem("foo");
await useKV("test").getItem<{ hello: string }>("foo");
```

### Common methods

| Method | Description |
|---|---|
| `getItem(key)` / `setItem(key, val)` | Read / write (returns `null` if missing). |
| `getItemRaw` / `setItemRaw` | Binary / unserialized values. |
| `getItems` / `setItems` | Batch operations. |
| `hasItem(key)` | Existence check. |
| `removeItem(key)` | Delete a key. |
| `getKeys(base?)` / `clear(base?)` | List / clear by prefix. |
| `getMeta(key)` / `setMeta(key, meta)` / `removeMeta(key)` | Metadata (mtime, atime, etag, type, ttl). |
| `mount(base, driver)` / `unmount(base)` | Dynamically attach a driver. |
| `watch(cb)` / `unwatch()` | React to `"update"` / `"remove"` events. |

Aliases: `get`, `set`, `has`, `del`, `remove`, `keys`.

## Configuring drivers

Mount drivers by name via the `kv` option; the key is the mount point, the value is the driver config.

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  kv: {
    redis: { driver: "redis", url: "redis://localhost:6379" },
  },
  // Override mounts in dev (e.g. when the prod driver isn't available locally)
  $development: {
    kv: {
      redis: { driver: "fs", base: "./.data/redis" },
    },
  },
});
```

Then `useKV("redis")`. See the [unstorage drivers list](https://unstorage.unjs.io) (fs, memory, redis, cloudflare-kv, s3, ...).

- `$development.kv` mounts are merged on top of `kv`. A mount with a **different** `driver` replaces the whole mount; the **same** `driver` deep-merges options.
- Use `$prerender.kv` to override mounts during prerendering only.
- Mount options are serialized into the build output, so they must be JSON-serializable — use runtime mounts (below) for non-serializable options.
- Driver third-party libs (e.g. `ioredis` for `redis`) are auto-detected and passed via the driver's `lib` option so bundlers can resolve them; `lib` is therefore not configurable in `kv` mounts (set `null` to opt out).

## Built-in mount points

- **Default** (no base): in-memory, not persisted. Mount an `fs`/`redis` driver to persist.
- **`assets:server`** (`/assets` base): read-only access to bundled server assets — see [core-assets](core-assets.md).
- **`cache:`**: used by the caching layer; lives in root storage unless you mount a dedicated `cache` point — see [core-cache](core-cache.md).

## Runtime / dynamic mounts

When credentials are only known at runtime, mount a driver from a [plugin](features-plugins.md):

```ts [plugins/storage.ts]
import { definePlugin } from "nitro";
import { useKV } from "nitro/kv";
import redisDriver from "unstorage/drivers/redis";

export default definePlugin(() => {
  useKV().mount("redis", redisDriver({
    base: "redis",
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    lib: () => import("ioredis"), // pass the lib explicitly so it is bundled
  }));
});
```

> Runtime mounts bypass Nitro's driver-dependency detection: install the third-party lib yourself and pass it via the driver's `lib` option, or the mount fails at runtime.

## Key Points

- Import `useKV` from `nitro/kv` (v2 `useStorage` / `nitro/storage` are deprecated aliases). No auto-imports in v3.
- Default storage is in-memory; configure a persistent driver via `kv` for production.
- Use `$development.kv` (not the removed `devStorage`) to swap drivers in development.
- Prefer this abstraction over platform-specific KV APIs (e.g. Cloudflare KV) for portability.

<!--
Source references:
- https://nitro.build/docs/storage
- https://unstorage.unjs.io
-->
