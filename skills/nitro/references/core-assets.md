---
name: assets
description: Public assets served to clients and server assets bundled for runtime access in Nitro
---

# Assets

Nitro handles two asset kinds: **public assets** served directly to clients, and **server assets** bundled into the server for programmatic access.

## Public assets

Files in `public/` are served automatically at the matching URL.

```
public/
  image.png    -> /image.png
  robots.txt   -> /robots.txt
```

- Served with automatic `ETag` / `Last-Modified` and `304 Not Modified` support.
- In production, `public/` is copied to `.output/public/` and a metadata manifest is embedded for fast lookups + caching headers.

### Custom public directories

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  publicAssets: [
    {
      baseURL: "build",       // served under /build/
      dir: "public/build",    // source on disk
      maxAge: 3600,           // Cache-Control: public, max-age=3600, immutable
    },
  ],
});
```

Other entry options: `fallthrough` (continue to handlers when not found; defaults `true` for root, `false` otherwise) and `ignore`.

### Pre-compression

Generate gzip/brotli/zstd variants at build time, served based on `Accept-Encoding`:

```ts [nitro.config.ts]
export default defineConfig({
  compressPublicAssets: true, // or { gzip: true, brotli: true, zstd: false }
});
```

Only compressible MIME types ≥ 1 KB are compressed (`.map` files excluded).

## Server assets

Files in `assets/` are bundled into the server and read via the storage layer at the `assets:server` mount point (only included in the bundle when accessed through `useStorage`).

```
assets/
  data.json
  templates/welcome.html
```

```ts [routes/index.ts]
import { defineHandler } from "nitro";
import { useStorage } from "nitro/storage";

export default defineHandler(async () => {
  const serverAssets = useStorage("assets:server");
  const keys = await serverAssets.getKeys();
  const data = await serverAssets.getItem("data.json");
  const meta = await serverAssets.getMeta("data.json"); // { type, etag, mtime }
  return { keys, data, meta };
});
```

### Custom server asset directories

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  serverAssets: [
    { baseName: "templates", dir: "./templates" },
  ],
});
```

Access via the `assets:templates` mount:

```ts
const html = await useStorage("assets:templates").getItem("email.html");
```

Entry options: `baseName`, `dir`, `pattern` (default `**/*`), `ignore`.

## Key Points

- `public/` → served to clients with ETag/compression; `assets/` → bundled, read via `useStorage("assets:server")`.
- Server assets are only bundled if referenced through `useStorage`.
- In dev, server assets read from the filesystem; in production they are inlined with precomputed metadata.
- Use `publicAssets[].maxAge` and `compressPublicAssets` to offload caching/compression without a CDN.

<!--
Source references:
- https://nitro.build/docs/assets
- https://nitro.build/docs/storage#server-assets
-->
