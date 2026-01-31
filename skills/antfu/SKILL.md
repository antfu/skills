---
name: antfu
description: Anthony Fu's opinionated tooling and conventions for JavaScript/TypeScript projects. Use when setting up new projects, configuring ESLint/Prettier alternatives, monorepos, library publishing, or when the user mentions Anthony Fu's preferences.
metadata:
  author: Anthony Fu
  version: "2026.1.28"
---

# Anthony Fu's Preferences

| Category | Preference |
|----------|------------|
| Package Manager | pnpm (with `@antfu/ni` for unified commands) |
| Language | TypeScript (strict mode, ESM only) |
| Linting & Formatting | `@antfu/eslint-config` (no Prettier) |
| Testing | Vitest |
| Git Hooks | simple-git-hooks + lint-staged |
| Bundler (Libraries) | tsdown |
| Documentation | VitePress |

---

## Core Conventions

### @antfu/ni Commands

| Command | Description |
|---------|-------------|
| `ni` | Install dependencies |
| `ni <pkg>` / `ni -D <pkg>` | Add dependency / dev dependency |
| `nr <script>` | Run script |
| `nu` | Upgrade dependencies |
| `nun <pkg>` | Uninstall dependency |
| `nci` | Clean install (`pnpm i --frozen-lockfile`) |
| `nlx <pkg>` | Execute package (`npx`) |

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

### ESLint Setup

```js
// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu()
```

Fix linting errors with `nr lint --fix`. Do NOT add a separate `lint:fix` script.

For detailed configuration options: [antfu-eslint-config](references/antfu-eslint-config.md)

### Git Hooks

```json
{
  "simple-git-hooks": {
    "pre-commit": "pnpm i --frozen-lockfile --ignore-scripts --offline && npx lint-staged"
  },
  "lint-staged": { "*": "eslint --fix" },
  "scripts": { "prepare": "npx simple-git-hooks" }
}
```

### Vitest Conventions

- Test files: `foo.ts` → `foo.test.ts` (same directory)
- Use `describe`/`it` API (not `test`)
- Use `toMatchSnapshot` for complex outputs
- Use `toMatchFileSnapshot` with explicit path for language-specific snapshots

---

## pnpm Catalogs

Use named catalogs in `pnpm-workspace.yaml` for version management:

| Catalog | Purpose |
|---------|---------|
| `prod` | Production dependencies |
| `inlined` | Bundler-inlined dependencies |
| `dev` | Dev tools (linter, bundler, testing) |
| `frontend` | Frontend libraries |

Avoid the default catalog. Catalog names can be adjusted per project needs.

---

## References

| Topic | Description | Reference |
|-------|-------------|-----------|
| ESLint Config | Framework support, formatters, rule overrides, VS Code settings | [antfu-eslint-config](references/antfu-eslint-config.md) |
| Project Setup | .gitignore, GitHub Actions, VS Code extensions | [setting-up](references/setting-up.md) |
| App Development | Vue/Nuxt/UnoCSS conventions and patterns | [app-development](references/app-development.md) |
| Library Development | tsdown bundling, pure ESM publishing | [library-development](references/library-development.md) |
| Monorepo | pnpm workspaces, centralized alias, Turborepo | [monorepo](references/monorepo.md) |
