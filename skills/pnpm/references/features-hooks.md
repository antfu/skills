---
name: pnpm-hooks
description: Customize resolution, config, packing, and fetching with .pnpmfile.mjs hooks, finders, and custom resolvers/fetchers
---

# pnpm Hooks (.pnpmfile.mjs)

pnpm hooks customize installation. Declare them in `.pnpmfile.mjs` (ESM, preferred) or `.pnpmfile.cjs` (CommonJS), located next to the lockfile (workspace root for a monorepo).

> The modern format uses ESM `export const hooks = { ... }`. The old CommonJS `module.exports = { hooks }` still works in `.pnpmfile.cjs`.

## Setup

```js title=".pnpmfile.mjs"
export const hooks = {
  readPackage,
  afterAllResolved,
  updateConfig,
  beforePacking,
}
```

## Hook reference

| Hook | When | Use |
|------|------|-----|
| `readPackage(pkg, ctx)` | after a dependency manifest is parsed | mutate a dependency's `package.json` (affects resolution) |
| `afterAllResolved(lockfile, ctx)` | after resolution | mutate the lockfile before it's written |
| `updateConfig(config)` | before install | mutate pnpm's settings (great with config dependencies) |
| `beforePacking(pkg, dir, context)` | before `pnpm pack`/`publish` tarball | customize the **published** manifest only |
| `preResolution(opts, logger)` | after reading lockfiles, before resolution | mutate `opts.wantedLockfile`/`currentLockfile` in place |
| `importPackage(dir, opts)` | when writing to node_modules | **removed (v12.0.0)** - ignored with a warning; use `packageImportMethod` |
| `filterLog(log)` | per log entry | **deprecated/ignored (v12.0.0)** — use `loglevel` instead |

## readPackage

Called for every package before resolution. Common uses:

```js title=".pnpmfile.mjs"
function readPackage(pkg, context) {
  // Add a missing peer dependency
  if (pkg.name === 'some-broken-package') {
    pkg.peerDependencies = { ...pkg.peerDependencies, react: '*' }
  }
  // Pin a transitive version
  if (pkg.dependencies?.lodash) pkg.dependencies.lodash = '^4.17.21'
  // Drop a problematic optional dep
  delete pkg.optionalDependencies?.fsevents
  // Replace a deprecated dep
  if (pkg.dependencies?.['old-pkg']) {
    pkg.dependencies['new-pkg'] = pkg.dependencies['old-pkg']
    delete pkg.dependencies['old-pkg']
  }
  return pkg
}

export const hooks = { readPackage }
```

> Mutations are not written to disk; they only affect resolution. pnpm records a checksum of the pnpmfile in the lockfile and re-resolves affected dependencies when it changes. Guard fields with `?.` (e.g. `pkg.version?.startsWith`). Removing `scripts` here does **not** stop a build — use the `allowBuilds` setting instead. To persist a change to a dependency's files, use `pnpm patch`.

## updateConfig

Modify pnpm's own settings programmatically — most powerful when shipped in a config dependency so settings are shared across repos.

```js title=".pnpmfile.mjs"
export const hooks = {
  updateConfig(config) {
    return Object.assign(config, {
      enablePrePostScripts: false,
      optimisticRepeatInstall: true,
      resolutionMode: 'lowest-direct',
      verifyDepsBeforeRun: 'install',
    })
  }
}
```

```js
// Add a catalog entry from a plugin
export const hooks = {
  updateConfig(config) {
    config.catalogs.default ??= {}
    config.catalogs.default['is-odd'] = '1.0.0'
    return config
  }
}
```

> Since v12.4.1, `config` is the **resolved** configuration (every setting pnpm will act on, from `.npmrc`, CLI, and defaults; unset keys are absent, not `null`). It also carries `registriesByScope` (scope → registry URL; rewrite to redirect fetches) and `configByUri` (registry URI → credentials). Since v12.3.0 the pnpmfile is loaded by many more commands (`run`, `exec`, `rebuild`, script shortcuts, `link`, `outdated`, `import`, `pack`, `publish`, `stage publish`), so `updateConfig` settings like `extraEnv`/`extraBinPaths` reach spawned processes and hook-provided catalogs resolve at pack time.

#### Registry routing and command-line precedence

Returning `registriesByScope` replaces the routing map: omitted scopes use its `default` (or the previous main registry); the built-in `@jsr` route stays unless overridden. Spread `...config.registriesByScope` to keep existing routes. A returned `registries` key is the `registries` setting (merges per key), not the routing map. Since v12.8, settings given on the command line (`--registry`, `--store-dir`, `--config.<key>`, `--no-optional`, ...) win: the hook sees them but pnpm restores them after it returns. Rewriting `registriesByScope` does not affect routes given on the command line.

## beforePacking

Customize the manifest that ends up in the published tarball without touching your local `package.json`.

```js title=".pnpmfile.mjs"
export const hooks = {
  beforePacking(pkg, dir, context) {   // dir: project being packed; context.log(msg) for debug log
    delete pkg.devDependencies
    pkg.main = './dist/index.js'
    return pkg
  }
}
```

## preResolution

Only in-place changes to `options.wantedLockfile`/`currentLockfile` count; the return value is ignored, and a hook that throws or leaves an invalid lockfile fails the install. With `--frozen-lockfile` the changed wanted lockfile is checked against manifests. `logger.info(msg)`/`logger.warn(msg)` print messages.

```js title=".pnpmfile.mjs"
export const hooks = {
  preResolution({ wantedLockfile }, logger) {
    delete wantedLockfile.importers?.['.']   // re-resolve root deps
    logger.info('Dropped locked root dependencies')
  },
}
```

## afterAllResolved

```js title=".pnpmfile.mjs"
export const hooks = {
  afterAllResolved(lockfile, context) {
    context.log(`Resolved ${Object.keys(lockfile.packages || {}).length} packages`)
    return lockfile
  }
}
```

## Finders (pnpm list / why)

Custom predicates used via `--find-by`:

```js title=".pnpmfile.mjs"
export const finders = {
  react17: (ctx) => ctx.readManifest().peerDependencies?.react === '^17.0.0'
}
```

```bash
pnpm why --find-by=react17
pnpm list --find-by=react17 --find-by=other   # repeatable; matches if any finder matches
```

## Custom resolvers & fetchers (advanced)

Register top-level `resolvers`/`fetchers` to support new package schemes (e.g. `my-protocol:pkg`). Each is an object with cheap `canResolve`/`canFetch` guards plus `resolve`/`fetch`. Custom resolvers run before built-ins; custom resolution `type` fields must use the `custom:` prefix.

```js title=".pnpmfile.cjs"
const resolver = {
  canResolve: (dep) => dep.alias.startsWith('@company/'),
  resolve: async (dep) => ({
    id: `${dep.alias}@${dep.bareSpecifier}`,
    resolution: { type: 'custom:cdn', cdnUrl: '...' },
  }),
}
const fetcher = {
  canFetch: (id, res) => res.type === 'custom:cdn',
  fetch: (cafs, res, opts, fetchers) =>
    fetchers.remoteTarball(cafs, { tarball: res.cdnUrl, integrity: res.integrity }, opts),
}
module.exports = { resolvers: [resolver], fetchers: [fetcher] }
```

Built-in fetchers: `localTarball`, `remoteTarball`, `gitHostedTarball`, `git`, `directory`, `binary` (runtime archives like Node.js). A result from a built-in fetcher must be returned unchanged (changed `filesMap` is rejected; changed `manifest`/`requiresBuild` ignored) - return a `{ delegate }` envelope to install different files.

> `hooks.fetchers` was removed in v11 — use the top-level `fetchers` export instead.

### Delegating to built-in fetchers

Instead of fetching itself, a custom fetcher can return a `{ delegate }` envelope naming a complete, fetchable resolution for pnpm to fetch with its built-in path (single-step; a custom-typed delegate is rejected):

```js
fetch: (cafs, resolution) => ({
  delegate: { tarball: resolution.customUrl, integrity: resolution.integrity },
})
```

> The envelope works for every resolution in every pnpm version. In pnpm 12, `cafs` is a handle (with `storeDir` and `tempDir()`) to pass to the built-in `fetchers`.

## Related settings

```yaml title="pnpm-workspace.yaml"
ignorePnpmfile: false                  # ignore the pnpmfile entirely
pnpmfile: ['.pnpmfile.mjs']            # local pnpmfile location(s); default falls back to .pnpmfile.cjs if no .mjs
globalPnpmfile: ~/.pnpm/global_pnpmfile.mjs
```

## Hooks vs Overrides

| | Hooks (.pnpmfile) | Overrides (pnpm-workspace.yaml) |
|--|-------------------|---------------------------------|
| Logic | JavaScript | declarative |
| Scope | any manifest field, config, lockfile, packing | versions |
| Use when | conditional/complex fixes | simple version pins |

Prefer `overrides`/`packageExtensions` for simple cases; use hooks for conditional logic, config sharing, or packing tweaks.

## Key Points

- Prefer `.pnpmfile.mjs` with `export const hooks`/`finders`/`resolvers`/`fetchers`.
- Hooks: `updateConfig` (mutate settings), `beforePacking` (published manifest), `preResolution`. `importPackage` was removed in v12.
- With `sharedWorkspaceLockfile: false`, each project runs its own pnpmfile hooks, then the root's.
- Pair `updateConfig` with config dependencies to share settings/catalogs across repos.
- `--ignore-scripts` does **not** disable the pnpmfile; use `ignorePnpmfile`.

<!--
Source references:
- https://pnpm.io/pnpmfile
- https://pnpm.io/finders
- https://pnpm.io/config-dependencies
-->
