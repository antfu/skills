---
name: pnpm-configuration
description: Configuring pnpm via pnpm-workspace.yaml (settings), the global config.yaml, and .npmrc (auth only)
---

# pnpm Configuration

pnpm settings are split into **two** categories. Knowing where each goes is the single most important config concept in current pnpm:

| Category | Stored in | Format |
|----------|-----------|--------|
| **All pnpm/install settings** (`nodeLinker`, `hoistPattern`, `autoInstallPeers`, `overrides`, `catalog`, …) | `pnpm-workspace.yaml` (project) and `config.yaml` (global) | YAML, **camelCase** keys |
| **Auth, registry credentials, TLS, proxy, `local-address`** (`_authToken`, `cert`, `key`, …) | `.npmrc` (project, gitignored) and global `auth.ini` | INI |

> **Important changes:** pnpm no longer reads settings from the `pnpm` field of `package.json` (a setting found there is ignored with a warning), and `.npmrc` is now used **only** for authentication/registry credentials. Everything else belongs in `pnpm-workspace.yaml`. Keys in YAML are **camelCase** (e.g. `nodeLinker`), not the kebab-case used by old `.npmrc` files.

> The upstream settings reference is now split into pages by area — `settings/build`, `settings/cli`, `settings/dependency-resolution`, `settings/network`, `settings/node-modules`, `settings/store`, `settings/peer-dependencies`, `settings/versioning`, `settings/other` — but they are all the same camelCase keys in `pnpm-workspace.yaml`.

## pnpm-workspace.yaml (primary config)

Place at the workspace/project root. Even a single-package project uses this file for pnpm settings.

```yaml title="pnpm-workspace.yaml"
# Workspace packages (omit for a single-package repo)
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'

# Common install settings (camelCase)
nodeLinker: isolated          # isolated (default) | hoisted | pnp
autoInstallPeers: true
strictPeerDependencies: false
savePrefix: '^'
saveExact: false
hoistPattern:
  - '*eslint*'
  - '*babel*'
publicHoistPattern: []
shamefullyHoist: false
dedupeDirectDeps: false
resolutionMode: highest       # highest | time-based | lowest-direct

# Centralized version management
catalog:
  react: ^18.2.0

# Force dependency versions (root only)
overrides:
  lodash: ^4.17.21
  'foo@^1.0.0>bar': ^2.0.0

# Extend/patch broken package manifests
packageExtensions:
  react-redux:
    peerDependencies:
      react-dom: '*'

# Peer dependency rules
peerDependencyRules:
  ignoreMissing:
    - '@babel/*'
  allowedVersions:
    react: '17 || 18'
```

## Global configuration (config.yaml)

User-level non-auth settings live in a global YAML `config.yaml`:

- `$XDG_CONFIG_HOME/pnpm/config.yaml` (if set)
- Linux: `~/.config/pnpm/config.yaml`
- macOS: `~/Library/Preferences/pnpm/config.yaml`
- Windows: `%LOCALAPPDATA%\pnpm\config\config.yaml`

Auth INI settings go in `auth.ini` in the same directory (written by `pnpm login`/`pnpm config set` of auth keys).

Project-only settings (structure of `node_modules`/workspace: `nodeLinker`, `hoistPattern`, `publicHoistPattern`, `shamefullyHoist`, `linkWorkspacePackages`, ...) must be in `pnpm-workspace.yaml`; in the global `config.yaml` they are ignored with a warning, and `pnpm config set --global` fails with `ERR_PNPM_CONFIG_SET_UNSUPPORTED_YAML_CONFIG_KEY`. Machine-level settings (`storeDir`, `cacheDir`, `packageImportMethod`, `minimumReleaseAge`, network) may be global. Share project-only settings across repos via a config dependency. Conversely, machine-state settings (`bin`, `configDir`, `dir`, `globalBinDir`, `globalDir`, `macosBackup`, `npmrcAuthFile`, `pnpmHomeDir`, `scope`, `stateDir`, `userconfig`, `workspaceDir`, `ci`, `symlinkedLockfileTargetDirs`, `tools`, ...) are ignored in a project's `pnpm-workspace.yaml` (`pnpm config set --location=project` fails with `ERR_PNPM_CONFIG_SET_NOT_A_PROJECT_SETTING`). `cacheDir`/`storeDir` are fine.

## Splitting settings across files (config includes, v12.15+)

The root `pnpm-workspace.yaml` can delegate settings to other YAML files and to config dependencies via `include`, so protected files (CODEOWNERS, read-only mounts, agent sandboxes) hold security settings while routine ones (catalogs) live in freely editable files.

```yaml title="pnpm-workspace.yaml"
configDependencies:
  '@acme/pnpm-policy': 3.1.0
pnpmfile: []                        # no pnpmfile: stop auto-picking up a new .pnpmfile.mjs
include:
  ./config/security.yaml: '*'       # any setting no other source owns
  ./config/catalog.yaml: [catalog]  # list = permits AND reserves these settings
  ./patches/patches.yaml: [patchedDependencies]
  '@acme/pnpm-policy': [minimumReleaseAge, trustPolicy]   # config dep: list required
```

- Sources: local `./` or `../` `.yaml/.yml` files (must exist; no globs/absolute/URLs) or a name declared in `configDependencies`. Only the root file may define `include`; `include` cannot be delegated. Bad sources: `ERR_PNPM_INVALID_WORKSPACE_INCLUDE`.
- One owner per setting: a duplicate claim fails with `ERR_PNPM_DUPLICATE_SETTING`; defining a non-delegated setting in a file fails with `ERR_PNPM_SETTING_NOT_DELEGATED`. A delegated setting its owner omits is simply unset by the project.
- Catalogs: `catalog`/`catalogs.default`, `catalogs.<name>`, or `catalogs` (all). Entries of one catalog are never split.
- Relative paths inside an included file (`patchedDependencies`, `patchesDir`, `packages`, `file:`/`link:` entries, ...) are relative to that file.
- Writes (`pnpm add` with catalog, `approve-builds`, `patch-commit`, `audit --fix`, `config set --location project`) go to the owning file; unowned settings go to `pnpm-workspace.yaml`; config-dep-owned settings fail (`ERR_PNPM_SETTING_OWNED_BY_CONFIG_DEPENDENCY`).
- A config dependency supplies settings declaratively through `"pnpm": { "config": "./config.yaml" }` in its `package.json` (file must stay inside the package, else `ERR_PNPM_INVALID_CONFIG_DEPENDENCY_ENTRY`). Not delegable to config deps: `configDependencies`, `pnpmfile`, `globalPnpmfile`, `bootConfig`, `packages`, `scriptShell`, path settings (`patchedDependencies`, `storeDir`, `lockfileDir`).
- `bootConfig` sets the policy used when installing config dependencies / the pnpm version (before their settings load): accepts `minimumReleaseAge`, `minimumReleaseAgeExclude`, `minimumReleaseAgeStrict`, `minimumReleaseAgeIgnoreMissingTime`, `trustPolicy`, `trustPolicyExclude`, `trustPolicyIgnoreAfter`. Unset falls back to the regular value.
- An `updateConfig` hook runs after merge and can still change anything.

## Per-project settings in a workspace (packageConfigs)

There are no per-subproject `.npmrc` files anymore. Set per-package config via `packageConfigs` in the root `pnpm-workspace.yaml`:

```yaml title="pnpm-workspace.yaml"
packageConfigs:
  # Map form: keyed by package name
  project-1:
    saveExact: true
  project-2:
    savePrefix: '~'
  # Array form: pattern-matched rules
  # - match: ['project-1', 'project-2']
  #   modulesDir: node_modules
  #   saveExact: true
```

## .npmrc — authentication only

Keep auth tokens out of the repo (gitignore the project `.npmrc`). Auth INI files, highest priority first (override the project-trusted file with `npmrcAuthFile`):

1. `<workspace root>/.npmrc` (project, gitignored)
2. `<pnpm config>/auth.ini` (written by `pnpm login` since v12.16, and by `pnpm config set` of auth keys)
3. `~/.npmrc` (fallback for npm compatibility)

```ini title=".npmrc"
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
@myorg:registry=https://npm.myorg.com/
//npm.myorg.com/:_authToken=${MYORG_TOKEN}
```

### Structured `_auth` (v11.10+, for CI)

An alternative to many `//host/:_authToken=…` lines, keyed by registry URL. Honored **only** from the global `config.yaml` and the `pnpm_config__auth` (or `PNPM_CONFIG__AUTH`) env var - **ignored** in a project `.npmrc`/`pnpm-workspace.yaml`. `authToken` is the only field and may use `${NAME}`. Each entry also routes packages: `"@"` sets the default registry, `"@org"` routes that scope; priority is CLI flags, then `pnpm_config__auth` (overrides `registry`/`registries`), then global `config.yaml` (only where no `registry`/`registries` chooses). `pnpm login` wrote here in v12.1-12.15; since v12.16 it saves to `auth.ini`.

```yaml title="config.yaml (global only)"
_auth:
  https://registry.npmjs.org:
    "@":         { authToken: npm-token }   # @ = registry-wide/default
    "@org":      { authToken: org-token }   # scope-bound on the same host
```

```sh
export pnpm_config__auth='{"https://registry.npmjs.org":{"@":{"authToken":"npm-token"}}}'
```

Configure registries themselves (non-secret) in `pnpm-workspace.yaml`:

```yaml title="pnpm-workspace.yaml"
registries:
  default: https://registry.npmjs.org/
  '@my-org': https://private.example.com/
# Newer shape: keyed by URL, with scopes and a bare-specifier prefix (`pnpm add work:@corp/lib`)
# registries:
#   https://npm.work.example.com/:
#     scopes: ['@corp']
#     prefix: work
```

(`namedRegistries` is deprecated in favor of `prefix` in `registries`.)

Per-scope tokens: `//npm.pkg.github.com/:_authToken` plus scoped keys; `tokenHelper=/abs/path` (user-level auth files only, absolute path, no args) prints a fresh token for expiring credentials.

> Security: env-variable expansion is disabled for registry/proxy URLs, `//` keys, and credentials (`_authToken`, `_auth`, `_password`, `username`, `tokenHelper`, `cert`, `key`) in the **project** `.npmrc` (such settings are ignored with a warning). Put `${NPM_TOKEN}` lines in `auth.ini`/`~/.npmrc`, use `_auth`, or pass env var `pnpm_config_//registry.npmjs.org/:_authToken=...` via `env` (shells cannot `export` that name). Last resort for trusted CI: `PNPM_CONFIG_NPMRC_AUTH_FILE=.npmrc`. Likewise env vars are not expanded in `registry`/`registries`/`userAgent` values in `pnpm-workspace.yaml`.

## The `pnpm config` command

```bash
# Writes to global config.yaml / rc by default
pnpm config set nodeVersion 22.0.0
pnpm config set --location=project nodeVersion 22.0.0   # writes pnpm-workspace.yaml

# JSON values create arrays/objects
pnpm config set --location=project --json allowBuilds '{"react": true}'

# get prints strings/numbers/booleans as plain text, objects/arrays as JSON (`--json` forces JSON); list prints JSON
pnpm config get nodeLinker
pnpm config get 'allowBuilds.react'
pnpm config list
```

## Environment variables

Use `pnpm_config_*` (or `PNPM_CONFIG_*`). pnpm **no longer reads `npm_config_*`**, except `NPM_CONFIG_WORKSPACE_DIR`, `npm_config_userconfig`, and URL-scoped credentials (`npm_config_//host/:_authToken`). In config files, `${NAME}`, `${NAME-fallback}`, `${NAME:-fallback}` expand; `${NAME?}` expands to empty silently (v12.7+).

```bash
pnpm_config_save_exact=true pnpm add foo
```

## Notable settings that changed names

| Old (removed) | Replacement | Notes |
|---------------|-------------|-------|
| `onlyBuiltDependencies`, `neverBuiltDependencies`, `ignoredBuiltDependencies`, `onlyBuiltDependenciesFile` | `allowBuilds: { name: true\|false }` | Single map controlling build-script approval. See supply-chain-security. |
| `managePackageManagerVersions`, `packageManagerStrict`, `packageManagerStrictVersion`, `COREPACK_ENABLE_STRICT` | `pmOnFail: download\|ignore\|warn\|error` | Behavior when running pnpm version ≠ declared one. |
| `useNodeVersion` | `devEngines.runtime` (in `package.json`) | Runtime pinning. |
| `auditConfig.ignoreCves` | `auditConfig.ignoreGhsas` | Use GHSA IDs. |
| `allowNonAppliedPatches` | `allowUnusedPatches` | `ignorePatchFailures` removed (patches now always throw). |
| `package.json#pnpm` field | `pnpm-workspace.yaml` | No longer read at all. |

## Package Manager / Runtime pinning (package.json)

```json
{
  "packageManager": "pnpm@10.0.0",
  "devEngines": {
    "packageManager": { "name": "pnpm", "version": ">=11.0.0 <12.0.0", "onFail": "download" },
    "runtime": { "name": "node", "version": "22.x", "onFail": "download" }
  }
}
```

`devEngines.packageManager` supports ranges (resolved version stored in lockfile); `packageManager` requires an exact version. Declaring `packageManager` with another manager (`npm`, `yarn`, `bun`) is allowed. With no lockfile pin yet, pnpm records the running version if it satisfies the range and is older than `minimumReleaseAge`, else the newest old-enough version. Override `onFail` without editing the manifest via `pmOnFail` / `runtimeOnFail` settings.

## Key Points

- All pnpm settings go in `pnpm-workspace.yaml` (camelCase) or global `config.yaml`; `.npmrc` is auth/registry only.
- `package.json#pnpm` and `npm_config_*` env vars are no longer read.
- Use `packageConfigs` for per-package settings inside a workspace.
- Build-script approval is now one `allowBuilds` map; package-manager strictness is one `pmOnFail` setting.
- `pnpm config get`/`list` output JSON, and `--location=project` writes to `pnpm-workspace.yaml`.

<!--
Source references:
- https://pnpm.io/settings
- https://pnpm.io/configuring
- https://pnpm.io/npmrc
- https://pnpm.io/pnpm-workspace_yaml
- https://pnpm.io/package_json
- https://pnpm.io/cli/config
- https://pnpm.io/config-includes
-->
