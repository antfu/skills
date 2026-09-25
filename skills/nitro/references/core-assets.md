---
name: assets
description: Public assets served to clients and server assets bundled for runtime access in Nitro
---

# Assets

Nitro handles three asset kinds: **public assets** served directly to clients, **imported files** inlined into the bundle, and **server assets** bundled into the server for programmatic access via the storage layer.

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

Other entry options: `dir` (relative to `rootDir`), `fallthrough` (continue to handlers when not found; defaults `true` for root, `false` otherwise) and `ignore`. `maxAge` only applies when `fallthrough` is `false`.

### Pre-compression

Generate gzip/brotli/zstd variants at build time, served based on `Accept-Encoding`:

```ts [nitro.config.ts]
export default defineConfig({
  compressPublicAssets: true, // or { gzip: true, brotli: true, zstd: false }
});
```

Only compressible MIME types ≥ 1 KB are compressed (`.map` files excluded; zstd needs Node 22+ at build time).

## Importing files

Inline any file into the server bundle with an import attribute (base64-encoded for binary). Prefer server assets for larger files.

```ts
import logo from "./logo.png" with { type: "bytes" }; // Uint8Array
import readme from "./README.md" with { type: "text" }; // string
// or the raw: prefix
import logo2 from "raw:./logo.png";   // Uint8Array
import readme2 from "raw:./README.md"; // string
```

## Server assets

Files in `assets/` (relative to `serverDir` when set, else project root) are bundled into the server and read via the storage layer at the `assets:server` mount point (only included in the bundle when accessed through `useKV`).

```
assets/
  data.json
  templates/welcome.html
```

```ts [routes/index.ts]
import { defineHandler } from "nitro";
import { useKV } from "nitro/kv";

export default defineHandler(async () => {
  const serverAssets = useKV("assets:server");
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
const html = await useKV("assets:templates").getItem("email.html");
```

Entry options: `baseName`, `dir` (relative to `rootDir`), `pattern` (default `**/*`), `ignore`.

## Key Points

- `public/` → served to clients with ETag/compression; `assets/` → bundled, read via `useKV("assets:server")`.
- Server assets are only bundled if referenced through `useKV` (v2 `useStorage`).
- In dev, server assets read from the filesystem; in production they are inlined with precomputed metadata.
- Use `publicAssets[].maxAge` and `compressPublicAssets` to offload caching/compression without a CDN.

<!--
Source references:
- https://nitro.build/docs/assets
- https://nitro.build/docs/storage#server-assets
-->
