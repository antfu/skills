---
name: migration-to-pnpm
description: Migrating from npm or Yarn to pnpm with minimal friction
---

# Migration to pnpm

Guide for migrating existing projects from npm or Yarn to pnpm, plus upgrading pnpm v10 → v11 and v11 → v12.

## Upgrading pnpm v11 → v12

pnpm 12 (native executable, no Node.js needed to run) reads the same `pnpm-lock.yaml`, `pnpm-workspace.yaml`, and store as v11 - upgrading is not a migration and there is no codemod. If still on v10, do v10 → v11 first (its codemod applies).

```sh
pnpm self-update 12   # also updates the packageManager/devEngines.packageManager pin
```

If you install pnpm another way, update the pin too, otherwise pnpm 12 runs the pinned pnpm 11. Then run `pnpm install`, fix reported settings, commit `package.json` and the lockfile. Behavior changes to check:

- **Unrecognized `pnpm-workspace.yaml` settings fail** (`ERR_PNPM_UNRECOGNIZED_WORKSPACE_SETTINGS`) when the project pins a pnpm version the running one satisfies (else still a warning). `confirmModulesPurge` is rejected. `pnpm config` never fails on it.
- **Boolean flag + separate value is rejected**: use `--frozen-lockfile=false` / `--no-frozen-lockfile`, not `--frozen-lockfile false`.
- **Git dependency resolution:** GitHub/GitLab/Bitbucket specifiers resolve via the host's HTTPS URL and pnpm never records an SSH URL (no network probing). Old `git@...` lockfile entries change only on re-resolve (`pnpm update <pkg>`). Private SSH: `git config --global url."git@github.com:".insteadOf https://github.com/`.
- **pnpmfile hooks:** `importPackage` is not run (use `packageImportMethod`); `filterLog` is ignored with a warning (use `loglevel`).
- **`engineStrict`** fails when an incompatible package is reached via regular `dependencies` even under an optional subtree; with `--no-runtime`/`runtime: false` it checks the root `engines.node` against the active Node.js.
- **Naming a package manager/runtime installs the tool**, not the npm package: `pnpm add -g yarn`, `pnx node@22`. `yarn@npm:yarn@1.22.22` still installs the package.
- **Global `node`/`deno`/`bun` follow the project's pin** (`devEngines.runtime`, `engines.runtime`, `.node-version`, `.nvmrc`). Opt out with `globalShims: false` (global config) or `PNPM_SHIM_BYPASS=1`.
- **Global commands under `sudo` fail** (`ERR_PNPM_SUDO_NOT_SUPPORTED`): `setup`, `self-update`, `add --global`.
- **TLS:** uses the OS certificate store (fallback: bundled Mozilla CAs); `ca`/`cafile` still override. **`maxsockets`** no longer defaults to 50; only `networkConcurrency` bounds direct connections (proxied: 50 per origin).
- **`shellEmulator`** uses pnpm's built-in shell (some `${NAME:=word}` forms are literal; unparsable scripts fail `ERR_PNPM_EXECUTOR_SHELL_EMULATOR_PARSE`). **`scriptsPrependNodePath`** is ignored.
- **`packageImportMethod: auto` hardlinks first on Linux** (was clone-first). Set `clone` on btrfs/xfs to keep copy-on-write.
- **Cyclic dependency graphs** give deterministic lockfiles; the first re-resolving install may rewrite cyclic peer variants once. Frozen installs are unaffected.
- **`pnpm dlx`/`pnx` do not use the global virtual store.**
- **`pnpm pack-app`** embeds Node.js 25.5.0 unless `--runtime`/`pnpm.app.runtime` is set. `--frozen-store` has no Node.js version requirement.

## Upgrading pnpm v10 → v11

v11 changes how configuration is read. Most of it is mechanical — run the codemod:

```bash
cd /path/to/project
pnx codemod run pnpm-v10-to-v11   # pnpx on pnpm v10
```

The codemod automatically:

- **Moves `package.json#pnpm` settings into `pnpm-workspace.yaml`** (the `pnpm` field is no longer read).
- **Splits `.npmrc`**: only auth/registry settings stay in `.npmrc`; every other key moves to `pnpm-workspace.yaml` as **camelCase** (e.g. `node-linker` → `nodeLinker`). Per-subproject `.npmrc` files become `packageConfigs["<name>"]`.
- **Consolidates build settings** (`onlyBuiltDependencies`, `neverBuiltDependencies`, `ignoredBuiltDependencies`, `onlyBuiltDependenciesFile`) into one `allowBuilds: { name: true|false }` map.
- **Replaces** `managePackageManagerVersions`/`packageManagerStrict`/`packageManagerStrictVersion` with `pmOnFail: download|ignore|warn|error`.
- **Renames** `allowNonAppliedPatches` → `allowUnusedPatches`, `auditConfig.ignoreCves` → `auditConfig.ignoreGhsas`.
- **Converts** `useNodeVersion` → `devEngines.runtime`, and bumps `packageManager`.

Manual follow-ups (not automatable):

- Convert `CVE-…` IDs to `GHSA-…` in `auditConfig.ignoreGhsas`.
- `ignorePatchFailures` removed — failed patches now always throw.
- `npm_config_*` env vars → `pnpm_config_*` (CI, shell profiles, Docker).
- `pnpm link <name>` → use a path (`pnpm link ./foo`); `pnpm link --global` → `pnpm add -g .`.
- `pnpm install -g` (no args) and `pnpm server` removed.
- A `package.json` script named like a built-in (e.g. `clean`, `deploy`) now shadows the built-in `pnpm <name>`; see the built-in/script name conflicts list in the scripts docs.
- Docker images must copy `pnpm-workspace.yaml` (if present) before `pnpm install`.

## Migrating from npm / Yarn

## Quick Migration

### From npm

```bash
# Remove npm lockfile and node_modules
rm -rf node_modules package-lock.json

# Install with pnpm
pnpm install
```

### From Yarn

```bash
# Remove yarn lockfile and node_modules
rm -rf node_modules yarn.lock

# Install with pnpm
pnpm install
```

### Import Existing Lockfile

pnpm can import existing lockfiles:

```bash
# Import from npm or yarn lockfile
pnpm import

# This creates pnpm-lock.yaml from:
# - package-lock.json (npm)
# - yarn.lock (yarn)
# - npm-shrinkwrap.json (npm)
```

## Handling Common Issues

### Phantom Dependencies

pnpm is strict about dependencies. If code imports a package not in `package.json`, it will fail.

**Problem:**
```js
// Works with npm (hoisted), fails with pnpm
import lodash from 'lodash' // Not in dependencies, installed by another package
```

**Solution:** Add missing dependencies explicitly:
```bash
pnpm add lodash
```

### Missing Peer Dependencies

pnpm reports peer dependency issues by default.

**Option 1:** Let pnpm auto-install (default in v8+):
```yaml title="pnpm-workspace.yaml"
autoInstallPeers: true
```

**Option 2:** Install manually:
```bash
pnpm add react react-dom
```

**Option 3:** Suppress warnings if acceptable:
```yaml title="pnpm-workspace.yaml"
peerDependencyRules:
  ignoreMissing:
    - react
```

### Symlink Issues

Some tools don't work with symlinks. Use hoisted mode:

```yaml title="pnpm-workspace.yaml"
nodeLinker: hoisted
```

Or hoist specific packages:

```yaml title="pnpm-workspace.yaml"
publicHoistPattern:
  - '*eslint*'
  - '*babel*'
```

### Native Module Rebuilds

If native modules fail, try:

```bash
# Rebuild all native modules
pnpm rebuild

# Or reinstall
rm -rf node_modules
pnpm install
```

## Monorepo Migration

### From npm Workspaces

1. Create `pnpm-workspace.yaml`:
   ```yaml
   packages:
     - 'packages/*'
   ```

2. Update internal dependencies to use workspace protocol:
   ```json
   {
     "dependencies": {
       "@myorg/utils": "workspace:^"
     }
   }
   ```

3. Install:
   ```bash
   rm -rf node_modules packages/*/node_modules package-lock.json
   pnpm install
   ```

### From Yarn Workspaces

1. Remove Yarn-specific files:
   ```bash
   rm yarn.lock .yarnrc.yml
   rm -rf .yarn
   ```

2. Create `pnpm-workspace.yaml` matching `workspaces` in package.json:
   ```yaml
   packages:
     - 'packages/*'
   ```

3. Update `package.json` - remove Yarn workspace config if not needed:
   ```json
   {
     // Remove "workspaces" field (optional, pnpm uses pnpm-workspace.yaml)
   }
   ```

4. Convert workspace references:
   ```json
   // From Yarn
   "@myorg/utils": "*"
   
   // To pnpm
   "@myorg/utils": "workspace:*"
   ```

### From Lerna

pnpm can replace Lerna for most use cases:

```bash
# Lerna: run script in all packages
lerna run build

# pnpm equivalent
pnpm -r run build

# Lerna: run in specific package
lerna run build --scope=@myorg/app

# pnpm equivalent  
pnpm --filter @myorg/app run build

# Lerna: publish
lerna publish

# pnpm: use changesets instead
pnpm add -Dw @changesets/cli
pnpm changeset
pnpm changeset version
pnpm publish -r
```

## Configuration Migration

Keep only **auth/registry** in `.npmrc`; put everything else in `pnpm-workspace.yaml` (camelCase).

```ini title=".npmrc (auth only, gitignored)"
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
//npm.myorg.com/:_authToken=${MYORG_TOKEN}
```

```yaml title="pnpm-workspace.yaml"
registries:
  default: https://registry.npmjs.org/
  '@myorg': https://npm.myorg.com/
autoInstallPeers: true
strictPeerDependencies: false
```

### Scripts Migration

Most scripts work unchanged. Update pnpm-specific patterns:

```json
{
  "scripts": {
    // npm: recursive scripts
    "build:all": "npm run build --workspaces",
    // pnpm: use -r flag
    "build:all": "pnpm -r run build",
    
    // npm: run in specific workspace  
    "dev:app": "npm run dev -w packages/app",
    // pnpm: use --filter
    "dev:app": "pnpm --filter @myorg/app run dev"
  }
}
```

## CI/CD Migration

Update CI configuration:

```yaml
# Before (npm)
- run: npm ci

# After (pnpm)
- uses: pnpm/action-setup@v4
- run: pnpm install --frozen-lockfile   # or: pnpm ci
```

Add to `package.json` for Corepack:
```json
{
  "packageManager": "pnpm@10.0.0"
}
```

## Gradual Migration

For large projects, migrate gradually:

1. **Start with CI**: Use pnpm in CI, keep npm/yarn locally
2. **Add pnpm-lock.yaml**: Run `pnpm import` to create lockfile
3. **Test thoroughly**: Ensure builds work with pnpm
4. **Update documentation**: Update README, CONTRIBUTING
5. **Remove old files**: Delete old lockfiles after team adoption

## Rollback Plan

If migration causes issues:

```bash
# Remove pnpm files
rm -rf node_modules pnpm-lock.yaml pnpm-workspace.yaml

# Restore npm
npm install

# Or restore Yarn
yarn install
```

Keep old lockfile in git history for easy rollback.

<!--
Source references:
- https://pnpm.io/migration
- https://pnpm.io/migration-v11
- https://pnpm.io/cli/import
- https://pnpm.io/configuring
-->

