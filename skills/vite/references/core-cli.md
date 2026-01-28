---
name: core-cli
description: Vite CLI commands for development, building, and previewing
---

# Vite CLI

## Dev Server

Start the development server:

```bash
vite [root]
vite dev [root]   # alias
vite serve [root] # alias
```

### Dev Server Options

| Option | Description |
|--------|-------------|
| `--host [host]` | Specify hostname (use `0.0.0.0` for LAN access) |
| `--port <port>` | Specify port (default: 5173) |
| `--open [path]` | Open browser on startup |
| `--cors` | Enable CORS |
| `--strictPort` | Exit if port is in use |
| `--force` | Force optimizer to re-bundle dependencies |
| `-c, --config <file>` | Use specified config file |
| `--base <path>` | Public base path |
| `-m, --mode <mode>` | Set env mode |
| `-l, --logLevel <level>` | info \| warn \| error \| silent |
| `--clearScreen` | Allow/disable clear screen when logging |

## Build

Build for production:

```bash
vite build [root]
```

### Build Options

| Option | Description |
|--------|-------------|
| `--target <target>` | Transpile target (default: `"modules"`) |
| `--outDir <dir>` | Output directory (default: `dist`) |
| `--assetsDir <dir>` | Assets directory under outDir (default: `"assets"`) |
| `--assetsInlineLimit <number>` | Inline threshold in bytes (default: 4096) |
| `--ssr [entry]` | Build for SSR |
| `--sourcemap [output]` | Generate source maps (`boolean \| "inline" \| "hidden"`) |
| `--minify [minifier]` | Minifier (`boolean \| "oxc" \| "terser" \| "esbuild"`) |
| `--manifest [name]` | Generate build manifest JSON |
| `--ssrManifest [name]` | Generate SSR manifest JSON |
| `--emptyOutDir` | Force empty outDir |
| `-w, --watch` | Watch mode for rebuilding |

## Preview

Locally preview the production build:

```bash
vite preview [root]
```

### Preview Options

| Option | Description |
|--------|-------------|
| `--host [host]` | Specify hostname |
| `--port <port>` | Specify port |
| `--strictPort` | Exit if port is in use |
| `--open [path]` | Open browser on startup |
| `--outDir <dir>` | Output directory (default: `dist`) |

## Package Scripts

Typical `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Running Vite

```bash
# With npm
npx vite

# With pnpm
pnpm vite

# With yarn
yarn vite

# With bun
bunx vite
```

## Scaffolding New Project

```bash
# Interactive prompts
npm create vite@latest

# With project name and template
npm create vite@latest my-app -- --template vue-ts

# Available templates: vanilla, vanilla-ts, vue, vue-ts, react, react-ts,
# react-swc, react-swc-ts, preact, preact-ts, lit, lit-ts, svelte, svelte-ts,
# solid, solid-ts, qwik, qwik-ts
```

## Debugging

```bash
# Debug plugin transforms
vite --debug plugin-transform

# Debug with profiling
vite --profile
# Then press 'p + enter' to record .cpuprofile

# Filter debug logs
vite --debug -f plugin-transform
```

<!-- 
Source references:
- https://vite.dev/guide/cli.html
-->
