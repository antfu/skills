---
name: features-env
description: Environment variables, .env files, and modes in Vite
---

# Environment Variables and Modes

## Built-in Constants

Available via `import.meta.env`:

| Constant | Description |
|----------|-------------|
| `import.meta.env.MODE` | App mode (`'development'` or `'production'`) |
| `import.meta.env.BASE_URL` | Base URL from `base` config |
| `import.meta.env.PROD` | `true` in production |
| `import.meta.env.DEV` | `true` in development |
| `import.meta.env.SSR` | `true` in server-side rendering |

```ts
if (import.meta.env.DEV) {
  console.log('Development mode')
  // Tree-shaken in production
}
```

## Custom Environment Variables

Only variables prefixed with `VITE_` are exposed to client code:

```bash
# .env
VITE_API_URL=https://api.example.com
DB_PASSWORD=secret  # NOT exposed to client
```

```ts
console.log(import.meta.env.VITE_API_URL)  // "https://api.example.com"
console.log(import.meta.env.DB_PASSWORD)   // undefined
```

### Custom Prefix

```ts
export default defineConfig({
  envPrefix: ['VITE_', 'APP_']  // Expose VITE_* and APP_*
})
```

## .env Files

Load order (later has higher priority):

```
.env                # Always loaded
.env.local          # Always loaded, gitignored
.env.[mode]         # Only in specified mode
.env.[mode].local   # Only in specified mode, gitignored
```

### Variable Expansion

```bash
# .env
KEY=123
EXPANDED=test$KEY   # test123
ESCAPED=test\$foo   # test$foo (escaped)
```

## Modes

```bash
# Development mode (default for dev)
vite

# Production mode (default for build)
vite build

# Custom mode
vite build --mode staging
```

Create mode-specific env file:

```bash
# .env.staging
VITE_APP_TITLE=My App (staging)
NODE_ENV=production  # Still production build
```

### NODE_ENV vs Mode

| Command | NODE_ENV | Mode |
|---------|----------|------|
| `vite build` | `production` | `production` |
| `vite build --mode development` | `production` | `development` |
| `NODE_ENV=development vite build` | `development` | `production` |

## TypeScript IntelliSense

Create type declarations for custom env variables:

```ts
// vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

For strict typing (disallow unknown keys):

```ts
interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}
```

## HTML Replacement

Use `%VARIABLE%` syntax in HTML:

```html
<title>%VITE_APP_TITLE%</title>
<p>Mode: %MODE%</p>
```

Non-existent variables are left as-is (not replaced with `undefined`).

## Loading Env in Config

Env vars are NOT available in `vite.config.ts` automatically:

```ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')  // '' loads all vars
  
  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    }
  }
})
```

## Security Notes

- Add `*.local` to `.gitignore`
- `VITE_*` variables end up in client bundle - no secrets
- Never set `envPrefix` to `''` (exposes everything)

<!-- 
Source references:
- https://vite.dev/guide/env-and-mode.html
-->
