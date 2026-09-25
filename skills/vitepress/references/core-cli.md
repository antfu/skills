---
name: vitepress-cli
description: Command-line interface for development, building, and previewing VitePress sites
---

# CLI Commands

VitePress provides four main commands: `dev`, `build`, `preview`, and `init`.

## Development Server

Start the dev server with hot module replacement:

```bash
# In current directory (dev command is optional)
vitepress

# Or explicitly
vitepress dev

# With project in subdirectory
vitepress dev docs
```

**Options:**

| Option | Description |
|--------|-------------|
| `--open [path]` | Open browser on startup |
| `--port <port>` | Specify port number |
| `--base <path>` | Override base URL |
| `--cors` | Enable CORS |
| `--strictPort` | Exit if port is in use |
| `--force` | Ignore cache and re-bundle |

```bash
vitepress dev docs --port 3000 --open
```

## Production Build

Build static files for production:

```bash
vitepress build docs
```

**Options:**

| Option | Description |
|--------|-------------|
| `--base <path>` | Override base URL |
| `--assetsBase <url>` | URL prefix generated assets are served from, e.g. a CDN (v2) |
| `--target <target>` | Transpile target (default: `modules`) |
| `--outDir <dir>` | Output directory (relative to cwd) |
| `--assetsInlineLimit <n>` | Asset inline threshold in bytes |
| `--mpa` | Build in MPA mode (no client hydration) |

```bash
vitepress build docs --outDir dist
```

## Preview Production Build

Locally preview the production build:

```bash
vitepress preview docs
```

**Options:**

| Option | Description |
|--------|-------------|
| `--port <port>` | Specify port number |
| `--base <path>` | Override base URL |
| `--assetsBase <url>` | URL prefix generated assets are served from (v2) |

```bash
vitepress preview docs --port 4173
```

## Initialize Project

Start the setup wizard:

```bash
vitepress init
```

This creates the basic file structure:
- `.vitepress/config.js` - Configuration
- `index.md` - Home page
- Optional example pages

## Package.json Scripts

Typical scripts configuration:

```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

## Key Points

- Dev server runs at `http://localhost:5173` by default
- Preview server runs at `http://localhost:4173`
- Production output goes to `.vitepress/dist` by default
- The `docs` argument specifies the project root directory
- Use `--base` to override base path without modifying config

<!--
Source references:
- https://vitepress.dev/reference/cli
-->
