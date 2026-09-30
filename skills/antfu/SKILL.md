---
name: antfu
description: Anthony Fu's opinionated tooling and conventions for JavaScript/TypeScript projects. Use when setting up new projects, configuring ESLint/Prettier alternatives, monorepos, library publishing, or when the user mentions Anthony Fu's preferences.
metadata:
  author: Anthony Fu
  version: "2026.09.30"
---

> Reference template: [antfu/starter-ts](https://github.com/antfu/starter-ts). When scaffolding a new TypeScript project, mirror its `package.json` scripts, `eslint.config.js`, `knip.json`, `tsdown.config.ts` and workflows rather than inventing a new layout.

## Coding Practices

### Code Organization

- **Single responsibility**: Each source file should have a clear, focused scope/purpose
- **Split large files**: Break files when they become large or handle too many concerns
- **Type separation**: Always separate types and interfaces into `types.ts` or `types/*.ts`
- **Constants extraction**: Move constants to a dedicated `constants.ts` file

### Runtime Environment

- **Prefer isomorphic code**: Write runtime-agnostic code that works in Node, browser, and workers whenever possible
- **Clear runtime indicators**: When code is environment-specific, add a comment at the top of the file:

```ts
// @env node
// @env browser
```

### TypeScript

- **Explicit return types**: Declare return types explicitly when possible
- **Avoid complex inline types**: Extract complex types into dedicated `type` or `interface` declarations

### Explicitness

Favor explicit, traceable code over implicit "magic". A reader (human or agent) should be able to follow where every name comes from without running tooling.

- **Explicit imports**: Prefer explicit `import` statements. Avoid auto-imports — when a framework provides them (e.g. Nuxt/Nitro), turn them off for new projects (see [app-development](references/app-development.md)).
- **No path aliases by default**: Use relative imports (`./foo`, `../bar`). Only use path aliases (`@/`, `~/`, `#imports`, etc.) when they are *already* configured in the project; don't introduce new ones for greenfield code.

### Comments

- **Avoid unnecessary comments**: Code should be self-explanatory
- **Explain "why" not "how"**: Comments should describe the reasoning or intent, not what the code does

### Testing (Vitest)

- Test files: `foo.ts` → `foo.test.ts` (same directory)
- Use `describe`/`it` API (not `test`)
- Use `toMatchSnapshot` for complex outputs
- Use `toMatchFileSnapshot` with explicit path for language-specific snapshots

---

## Tooling Choices

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

### Checking npm Package Versions

Use [`fast-npm-meta`](https://github.com/antfu/fast-npm-meta) to look up the latest version of a package — it queries a small metadata endpoint instead of downloading the full registry payload (which can be megabytes per package).

```bash
nlx fast-npm-meta version vite              # 7.3.1
nlx fast-npm-meta version "nuxt@^3.5"       # 3.5.22 — range-aware
nlx fast-npm-meta version vite nuxt vue     # multiple at once
nlx fast-npm-meta version vite --json       # JSON for scripting
nlx fast-npm-meta full vite                 # full version list + dist-tags
```

Prefer this over `npm view <pkg> version` when you only need the latest version, and over reading `package.json` from the registry directly.

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
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib', // or 'app' (default)
  pnpm: true, // enforce pnpm catalogs in package.json
  antislop: true, // flag redundant/duplicated AI-style code, ban explicit `any`
})
```

Always enable `antislop: true`. It requires `eslint-plugin-slop` and `eslint-plugin-sonarjs` as dev dependencies.

For detailed configuration options: [antfu-eslint-config](references/antfu-eslint-config.md)

### Knip

Use [Knip](https://knip.dev) to catch unused files, exports and dependencies — the linter only sees one file at a time.

```json
// knip.json
{
  "$schema": "https://unpkg.com/knip@6/schema.json",
  "project": ["src/**/*.ts"],
  "ignoreDependencies": []
}
```

Fix what Knip reports by deleting; only add to `ignoreDependencies` for tools invoked outside `package.json` scripts (e.g. `taze`).

### Scripts and the `ci` Gate

Every project exposes a `ci` script that runs all checks in one command:

```json
{
  "scripts": {
    "build": "tsdown",
    "lint": "eslint --cache",
    "typecheck": "tsc",
    "knip": "knip",
    "test": "pnpm run build && vitest",
    "ci": "pnpm run lint && pnpm run typecheck && pnpm run knip && pnpm run test --run"
  }
}
```

**Before every commit, run `nr lint --fix` to format, then `nr ci` and make sure it passes.** Do not commit with a failing `ci`; fix the root cause instead of silencing rules or adding ignores.

### Git Hooks

`simple-git-hooks` + `nano-staged`. The pre-commit hook runs the full `ci` gate; `prepare` also installs agent skills via `skills-npm`:

```json
{
  "scripts": {
    "prepare": "git config core.hooksPath .githooks && simple-git-hooks && skills-npm"
  },
  "simple-git-hooks": {
    "pre-commit": "pnpm i --frozen-lockfile --ignore-scripts --offline && pnpm run ci && pnpx nano-staged"
  },
  "nano-staged": {
    "*": "eslint --fix --no-warn-ignored"
  }
}
```

Add `.githooks` to `.gitignore` and `simple-git-hooks: true` under `allowBuilds` in `pnpm-workspace.yaml`.

### skills-npm

[`skills-npm`](https://github.com/antfu/skills-npm) symlinks agent skills shipped inside installed npm packages (and fetches those declared in a `skills` field) into the agent's skills directory on every install. Install as a dev dependency and wire it into `prepare` as above; add `skills/npm-*` to `.gitignore`. Commit the generated `skills-npm-lock.json`.

### Publishing

Prefer npm Trusted Publishing (OIDC) over `NPM_TOKEN` secrets: releases run on CI from a `v*` tag via `release.yml` with `id-token: write`, and `nr release` (`bumpp`) only bumps, tags and pushes. Details: [setting-up](references/setting-up.md#publishing-with-npm-trusted-publishing-oidc).

### pnpm Catalogs

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
| ESLint Config | Framework support, antislop, formatters, rule overrides, VS Code settings | [antfu-eslint-config](references/antfu-eslint-config.md) |
| Project Setup | .gitignore, GitHub Actions, OIDC trusted publishing, VS Code extensions | [setting-up](references/setting-up.md) |
| App Development | Vue/Nuxt/UnoCSS conventions, auto-import control, Storybook component testing | [app-development](references/app-development.md) |
| Library Development | tsdown bundling, pure ESM publishing, publint, API snapshots | [library-development](references/library-development.md) |
| Monorepo | pnpm workspaces, centralized alias, Turborepo | [monorepo](references/monorepo.md) |
