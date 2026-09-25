---
name: vitepress-deployment
description: Deploying VitePress sites to various platforms including GitHub Pages, Netlify, Vercel, and more
---

# Deployment

Deploy VitePress static sites to various hosting platforms.

## Build and Preview

```bash
# Build production files
npm run docs:build

# Preview locally
npm run docs:preview
```

Output is in `.vitepress/dist` by default.

## Setting Base Path

For sub-path deployment (e.g., `https://user.github.io/repo/`):

```ts
// .vitepress/config.ts
export default {
  base: '/repo/'
}
```

### Relocatable Builds (v2)

When the final URL isn't known at build time (IPFS gateways, archives, docs
bundled into an app, `file://`), set `base: './'`. Every page then references
assets/pages relative to its own location and the same build works from any
sub-path without rebuilding. Keep `cleanUrls` off, avoid root-absolute `head`
paths, and use Markdown link syntax for site-absolute links.

## GitHub Pages

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy VitePress

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm
      - name: Cache VitePress
        uses: actions/cache@v4
        with:
          path: docs/.vitepress/cache
          key: ${{ runner.os }}-vitepress-${{ hashFiles('docs/**', 'package-lock.json') }}
          restore-keys: ${{ runner.os }}-vitepress-
      - run: npm ci
      - run: npm run docs:build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

Enable GitHub Pages in repository settings → Pages → Source: "GitHub Actions".

For pnpm, add before setup-node:

```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 9
```

## Netlify / Vercel / Cloudflare Pages

Configure in dashboard:

| Setting | Value |
|---------|-------|
| Build Command | `npm run docs:build` |
| Output Directory | `docs/.vitepress/dist` |
| Node Version | `22` (or above) |

**Warning:** Don't enable "Auto Minify" for HTML - it removes Vue hydration comments.

### Vercel Configuration

For clean URLs, add `vercel.json`:

```json
{
  "cleanUrls": true
}
```

## GitLab Pages

Create `.gitlab-ci.yml`:

```yaml
image: node:24

pages:
  cache:
    paths:
      - node_modules/
  script:
    - npm install
    - npm run docs:build
  artifacts:
    paths:
      - public
  only:
    - main
```

Set `outDir: '../public'` in config if needed.

## Firebase

```json
// firebase.json
{
  "hosting": {
    "public": "docs/.vitepress/dist",
    "ignore": []
  }
}
```

```bash
npm run docs:build
firebase deploy
```

## nginx

Serve static files, cache hashed assets, and handle `cleanUrls: true`:

```nginx
map $uri $cache_control {
    ~^/assets/  "public, max-age=31536000, immutable";
    default     "no-cache";
}

server {
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;
    absolute_redirect off;

    add_header Cache-Control $cache_control always;

    location / {
        try_files $uri $uri.html $uri/index.html =404;
    }

    # redirect /foo/ -> /foo when foo.html exists (clean URLs)
    location ~ ^(?<page>.+)/$ {
        if (-f $document_root$page.html) {
            return 301 $page$is_args$args;
        }
        try_files $page/index.html =404;
    }

    error_page 404 /404.html;
}
```

**Important:** Don't default to `index.html` like SPAs - use `$uri.html` for clean URLs.

## HTTP Cache Headers

For hashed assets (immutable):

```
Cache-Control: max-age=31536000, immutable
```

### Netlify `_headers`

Place in `docs/public/_headers`:

```
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

### Vercel `vercel.json`

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Other Platforms

| Platform | Guide |
|----------|-------|
| Azure | Set `app_location: /`, `output_location: docs/.vitepress/dist` |
| Surge | `npx surge docs/.vitepress/dist` |
| harvis | `npx harvis docs/.vitepress/dist` |
| Heroku | Use `heroku-buildpack-static` |
| Render | Build: `npm run docs:build`, Publish: `docs/.vitepress/dist` |
| Stormkit / CloudRay / Hostinger / Lizard | Follow each provider's VitePress guide |

## Key Points

- Set `base` for sub-path deployments; `base: './'` for relocatable builds (v2)
- Node.js 22+ required (v2)
- GitHub Pages requires workflow file and enabling Pages in settings
- Cache `docs/.vitepress/cache` in CI to speed up builds
- Most platforms: Build `npm run docs:build`, output `docs/.vitepress/dist`
- Don't enable HTML minification (breaks hydration)
- Cache `/assets/*` with immutable headers
- For clean URLs on nginx, use `try_files $uri $uri.html $uri/index.html =404`

<!--
Source references:
- https://vitepress.dev/guide/deploy
-->
