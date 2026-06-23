---
name: storage
description: Runtime-agnostic KV storage via unstorage, mount points, and drivers in Nitro
---

# KV Storage

Nitro ships a runtime-agnostic key-value layer powered by [unstorage](https://unstorage.unjs.io). Access it with `useStorage()` from `nitro/storage`.

## Usage

```ts
import { useStorage } from "nitro/storage";

// Default storage (in-memory, not persisted across restarts)
await useStorage().setItem("test:foo", { hello: "world" });
const value = await useStorage().getItem("test:foo");

// Scope to a base/mountpoint
const test = useStorage("test");
await test.setItem("foo", { hello: "world" });

// Type the return value
await useStorage<{ hello: string }>("test").getItem("foo");
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
| `getMeta(key)` / `setMeta(key, meta)` | Metadata (mtime, etag, type, ttl). |
| `mount(base, driver)` / `unmount(base)` | Dynamically attach a driver. |
| `watch(cb)` / `unwatch()` | React to `"update"` / `"remove"` events. |

Aliases: `get`, `set`, `has`, `del`, `remove`, `keys`.

## Configuring drivers

Mount drivers by name; the key is the mount point, the value is the driver config.

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  storage: {
    redis: { driver: "redis", url: "redis://localhost:6379" },
    db: { driver: "redis", host: "prod.example.com" },
  },
  // Override mounts in dev (e.g. when the prod driver isn't available locally)
  devStorage: {
    db: { driver: "fs", base: "./.data/db" },
  },
});
```

Then `useStorage("redis")` / `useStorage("db")`. See the [unstorage drivers list](https://unstorage.unjs.io) (fs, memory, redis, cloudflare-kv, s3, ...).

## Built-in mount points

- **Default** (no base): in-memory, not persisted. Mount an `fs`/`redis` driver to persist.
- **`assets:server`** (a.k.a. `assets/server`): read-only access to bundled server assets — see [core-assets](core-assets.md).
- **`cache`**: used by the caching layer — see [core-cache](core-cache.md).

## Runtime / dynamic mounts

When credentials are only known at runtime, mount a driver from a [plugin](features-plugins.md):

```ts [plugins/storage.ts]
import { definePlugin } from "nitro";
import { useStorage } from "nitro/storage";
import redisDriver from "unstorage/drivers/redis";

export default definePlugin(() => {
  const storage = useStorage();
  storage.mount("redis", redisDriver({
    base: "redis",
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  }));
});
```

## Key Points

- Import `useStorage` from `nitro/storage` (v2 path `nitropack/runtime/storage` is gone).
- Default storage is in-memory; configure a persistent driver via `storage` for production.
- Use `devStorage` to swap drivers in development without changing production config.
- Prefer this abstraction over platform-specific KV APIs (e.g. Cloudflare KV) for portability.

<!--
Source references:
- https://nitro.build/docs/storage
- https://unstorage.unjs.io
-->
