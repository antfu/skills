---
name: setting-up
description: Project setup files including .gitignore, GitHub Actions workflows, npm OIDC trusted publishing, and VS Code extensions. Use when initializing new projects or adding CI/editor/release config.
---

# Project Setup

Start from [antfu/starter-ts](https://github.com/antfu/starter-ts); the files below mirror it.

## .gitignore

Create when `.gitignore` is not present:

```
*.log
*.tgz
.cache
.DS_Store
.eslintcache
.githooks
.idea
.env
.nuxt
.temp
.output
.turbo
cache
coverage
dist
lib-cov
logs
node_modules
skills/npm-*
temp
```

## GitHub Actions

Add these workflows when setting up a new project. Skip if workflows already exist. All use [sxzz/workflows](https://github.com/sxzz/workflows) reusable workflows.

### Autofix Workflow

**`.github/workflows/autofix.yml`** - Auto-fix linting on PRs:

```yaml
name: autofix.ci

on: [pull_request]

jobs:
  autofix:
    uses: sxzz/workflows/.github/workflows/autofix.yml@main
    permissions:
      contents: read
```

### CI Workflow

**`.github/workflows/ci.yml`** - Run the checks on push/PR:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions: {}

jobs:
  unit-test:
    uses: sxzz/workflows/.github/workflows/unit-test.yml@main
```

### Release Workflow

**`.github/workflows/release.yml`** - Publish on tag (library projects only):

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    uses: sxzz/workflows/.github/workflows/release.yml@main
    with:
      publish: true
    permissions:
      contents: write
      id-token: write
```

## Publishing with npm Trusted Publishing (OIDC)

Prefer [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) over long-lived `NPM_TOKEN` secrets. The workflow above authenticates with a short-lived GitHub OIDC token (`id-token: write`), so there is nothing to leak or rotate, and every release is built on CI from a tagged commit.

One-time setup per package:

1. Run `pnpm publish` locally once so the package exists on npm.
2. Open `https://www.npmjs.com/package/<name>/access` and link the GitHub repository + `release.yml` workflow as a trusted publisher.

After that, `nr release` (`bumpp`) bumps the version, commits, tags and pushes; the tag triggers `release.yml`, which publishes. Never add an `NPM_TOKEN` secret to new projects, and don't run `npm publish` from a local machine for subsequent releases.

## VS Code Extensions

Configure in `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "antfu.pnpm-catalog-lens",
    "antfu.iconify",
    "antfu.unocss",
    "antfu.slidev",
    "vue.volar"
  ]
}
```

| Extension | Description |
|-----------|-------------|
| `dbaeumer.vscode-eslint` | ESLint integration for linting and formatting |
| `antfu.pnpm-catalog-lens` | Shows pnpm catalog version hints inline |
| `antfu.iconify` | Iconify icon preview and autocomplete |
| `antfu.unocss` | UnoCSS IntelliSense and syntax highlighting |
| `antfu.slidev` | Slidev preview and syntax highlighting |
| `vue.volar` | Vue Language Features |
