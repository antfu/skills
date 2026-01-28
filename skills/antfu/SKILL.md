---
name: antfu
description: Anthony Fu's {Opinionated} preferences and best practices for web development
metadata:
  author: Anthony Fu
  version: "2026.1.28"
---

# Anthony Fu's Preferences

This skill covers Anthony Fu's preferred tooling, configurations, and best practices for web development. This skill is opinionated.

## Quick Summary

| Category | Preference |
|----------|------------|
| Package Manager | pnpm |
| Language | TypeScript (strict mode) |
| Module System | ESM (`"type": "module"`) |
| Linting & Formatting | @antfu/eslint-config (no Prettier) |
| Testing | Vitest |
| Git Hooks | simple-git-hooks + lint-staged |
| Documentation | VitePress (in `docs/`) |

---

## Core Stack

### Package Manager (pnpm)

Use pnpm as the package manager.

For monorepo setups, use pnpm workspaces:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```


Use pnpm named catalogs in `pnpm-workspace.yaml` to manage dependency versions:

| Catalog | Purpose |
|---------|---------|
| `prod` | Production dependencies |
| `inlined` | Dependencies inlined by bundler |
| `dev` | Development tools (linter, bundler, testing, dev-server) |
| `frontend` | Frontend libraries bundled into frontend |

Catalog names are not limited to the above and can be adjusted based on needs. Avoid using default catalog.

#### @antfu/ni

Use `@antfu/ni` for unified package manager commands. It auto-detects the package manager (pnpm/npm/yarn/bun) based on lockfile.

| Command | Description |
|---------|-------------|
| `ni` | Install dependencies |
| `ni <pkg>` | Add dependency |
| `ni -D <pkg>` | Add dev dependency |
| `nr <script>` | Run script |
| `nu` | Upgrade dependencies |
| `nun <pkg>` | Uninstall dependency |
| `nci` | Clean install (like `pnpm i --frozen-lockfile`) |
| `nlx <pkg>` | Execute package (like `npx`) |

Install globally with `pnpm i -g @antfu/ni` if the commands are not found.

### TypeScript (Strict Mode)

Always use TypeScript with strict mode enabled.

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

### ESM (ECMAScript Modules)

Always work in ESM mode. Set `"type": "module"` in `package.json`.

---

## Code Quality

### ESLint (@antfu/eslint-config)

Use `@antfu/eslint-config` for both formatting and linting. This eliminates the need for Prettier.

Create `eslint.config.js` with `// @ts-check` comment:

```js
// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu()
```

Add script to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

When getting linting errors, try to fix them with `nr lint --fix`. Don't add `lint:fix` script.

### Git Hooks (simple-git-hooks + lint-staged)

Use `simple-git-hooks` with `lint-staged` for pre-commit linting:

```json
{
  "simple-git-hooks": {
    "pre-commit": "pnpm i --frozen-lockfile --ignore-scripts --offline && npx lint-staged"
  },
  "lint-staged": {
    "*": "eslint --fix"
  },
  "scripts": {
    "prepare": "npx simple-git-hooks"
  }
}
```

### Unit Testing (Vitest)

Use Vitest for unit testing.

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

**Conventions:**

- Place test files next to source files: `foo.ts` → `foo.test.ts` (same directory)
- High-level tests go in `tests/` directory in each package
- Use `describe` and `it` API (not `test`)
- Use `expect` API for assertions
- Use `assert` only for TypeScript null assertions
- Use `toMatchSnapshot` for complex output assertions
- Use `toMatchFileSnapshot` with explicit file path and extension for language-specific output (exclude those files from linting)

---

## Project Setup

### Publishing (Library Projects)

For library projects, publish through GitHub Releases triggered by `bumpp`:

```json
{
  "scripts": {
    "release": "bumpp -r"
  }
}
```

### Documentation (VitePress)

Use VitePress for documentation. Place docs under `docs/` directory.

```
docs/
├── .vitepress/
│   └── config.ts
├── index.md
└── guide/
    └── getting-started.md
```

Add script to `package.json`:

```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs"
  }
}
```

---

## References

### Project Setup

| Topic | Description | Reference |
|-------|-------------|-----------|
| @antfu/eslint-config | ESLint flat config for formatting and linting | [antfu-eslint-config](references/antfu-eslint-config.md) |
| GitHub Actions | Preferred workflows using sxzz/workflows | [github-actions](references/github-actions.md) |
| .gitignore | Preferred .gitignore for JS/TS projects | [gitignore](references/gitignore.md) |
| VS Code Extensions | Recommended extensions for development | [vscode-extensions](references/vscode-extensions.md) |

### Development

| Topic | Description | Reference |
|-------|-------------|-----------|
| App Development | Preferences for Vue/Vite/Nuxt/UnoCSS web applications | [app-development](references/app-development.md) |
| Library Development | Preferences for bundling and publishing TypeScript libraries | [library-development](references/library-development.md) |
| Monorepo | pnpm workspaces, centralized alias, Turborepo | [monorepo](references/monorepo.md) |
