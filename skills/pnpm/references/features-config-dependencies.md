---
name: pnpm-config-dependencies
description: Share and centralize pnpm hooks, settings, patches, catalogs, and overrides across repos via config dependencies
---

# pnpm Config Dependencies

Config dependencies are npm packages that pnpm installs **before** all regular dependencies, so they can supply hooks, settings, patches, catalogs, and overrides that are reused across many repositories. They let you keep one shared "pnpm config" package and consume it everywhere.

## Declaring config dependencies

They live in `pnpm-workspace.yaml`; their integrity is recorded in a dedicated boot document inside `pnpm-lock.yaml`. They install to `node_modules/.pnpm-config/<name>`.

```yaml title="pnpm-workspace.yaml"
configDependencies:
  my-configs: "^1.0.0"
```

Add one with the `--config` flag:

```bash
pnpm add --config my-configs
pnpm add --config @myorg/pnpm-plugin-my-catalogs
```

Since v12.12 the saved range follows `pnpm add` rules (`savePrefix`, `--save-exact`); a dist-tag is saved as a range on the resolved version. Remove one by deleting it from `configDependencies` and running `pnpm install` (without `--frozen-lockfile`).

## Updating

Since v12.12, `pnpm update` updates config dependencies like regular ones: `pnpm update` (newest within range, rewrites range in `pnpm-workspace.yaml`), `--latest`, or by name/pattern (`pnpm update my-configs`). Dist-tag declarations keep tracking the tag (only the lockfile moves). Skipped with `--interactive`, `--patches`, `--no-save`, `--filter`, dep-group flags (`--prod`), and when pinned with `version+integrity`.

## Registry and security

Must come from an npm registry and are verified against it before install (offline install of new/changed ones needs cached metadata). `minimumReleaseAge` applies unless pinned with `version+integrity`; they install before `updateConfig` runs, so `minimumReleaseAgeExclude` added by a hook does not cover them. Since v12.15, `bootConfig` sets a separate policy for installing them. A config dependency can also supply settings declaratively without a pnpmfile (see config-includes in `core-config`).

## Constraints

- **No regular `dependencies`.** They may declare `optionalDependencies`, but only one level deep.
- **No lifecycle scripts** (`preinstall`, `postinstall`, …).
- `optionalDependencies` (used for platform-specific binaries, esbuild-style) must use **exact** versions — ranges/tags fail with `ERR_PNPM_CONFIG_DEP_OPTIONAL_NOT_EXACT`, keeping installs reproducible.

## Auto-loaded plugins

A config dependency named `pnpm-plugin-*`, `@*/pnpm-plugin-*`, or `@pnpm/plugin-*` has its `pnpmfile.mjs` (or `.cjs`) loaded automatically from the package root.

## Use cases

### Import hook logic from a shared package

Because config deps install before the pnpmfile loads, you can import from them:

```js title=".pnpmfile.mjs"
import { readPackage } from './node_modules/.pnpm-config/my-hooks/index.mjs'

export const hooks = { readPackage }
```

### Share settings & catalogs via updateConfig

A plugin can inject settings/catalog entries through the `updateConfig` hook:

```js title="@myorg/pnpm-plugin-my-catalogs/pnpmfile.mjs"
export const hooks = {
  updateConfig(config) {
    config.catalogs.default ??= {}
    config.catalogs.default['is-odd'] = '1.0.0'
    return config
  }
}
```

After installing it as a config dependency, consumers can use the catalog:

```bash
pnpm add is-odd@catalog:   # installs is-odd@1.0.0, writes "is-odd": "catalog:"
```

### Share patch files

Reference patches stored inside a config dependency:

```yaml title="pnpm-workspace.yaml"
configDependencies:
  my-patches: "1.0.0"
patchedDependencies:
  react: "node_modules/.pnpm-config/my-patches/react.patch"
```

## Key Points

- Centralize hooks, settings, catalogs, overrides, and patches in one package, consumed across repos.
- Declared via `configDependencies` in `pnpm-workspace.yaml`; installed before regular deps.
- No regular dependencies and no lifecycle scripts; `optionalDependencies` need exact versions.
- `pnpm-plugin-*` / `@pnpm/plugin-*` packages auto-load their pnpmfile.
- Pair with the `updateConfig` hook to push settings/catalogs into consuming projects.

<!--
Source references:
- https://pnpm.io/config-dependencies
- https://pnpm.io/pnpmfile#hooksupdateconfigconfig-config--promiseconfig
-->
