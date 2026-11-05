---
name: pnpm-store
description: Content-addressable storage system that makes pnpm fast and disk-efficient
---

# pnpm Store

pnpm uses a content-addressable store to save disk space and speed up installations. All packages are stored once globally and hard-linked to project `node_modules`.

## How It Works

1. **Global Store**: Packages are downloaded once to a central store
2. **Hard Links**: Projects link to store instead of copying files
3. **Content-Addressable**: Files are stored by content hash, deduplicating identical files

### Storage Layout

```
<store-dir>/                # Global content-addressable store (pnpm store path)
└── files/
    └── <hash>/             # Files stored by content hash

project/
└── node_modules/
    ├── .pnpm/              # Virtual store (hard links to global store)
    │   ├── lodash@4.17.21/
    │   │   └── node_modules/
    │   │       └── lodash/
    │   └── express@4.18.2/
    │       └── node_modules/
    │           ├── express/
    │           └── <deps>/  # Flat structure for dependencies
    ├── lodash -> .pnpm/lodash@4.17.21/node_modules/lodash
    └── express -> .pnpm/express@4.18.2/node_modules/express
```

## Store Commands

```bash
# Show store location
pnpm store path

# Remove unreferenced packages
pnpm store prune

# Check lockfile packages for modifications (ERR_PNPM_MODIFIED_DEPENDENCY)
pnpm store status

# Add package (or tarballs) to store without installing
pnpm store add <pkg>
pnpm store add ./tarballs/*.tgz && pnpm install --offline --frozen-lockfile   # offline/sandboxed builds
```

- `store add` of tarballs: install uses one when the lockfile entry names the same package/version and pins that tarball (`integrity` may be sha512/sha1 of the tgz or the uncompressed tar hash from `lockfile.integrityTarget: tar`). For named-registry packages, run it in the declaring project.
- `store prune` also deletes expired `pnx` cache entries first, removes the package metadata cache (`metadata*` dirs; next install re-downloads), keeps undecodable index entries (reported in summary), and (v12.7+) removes private pnpm/runtime copies left by killed processes. With a global virtual store it mark-and-sweeps `links/` using registered projects (symlinks in `$(pnpm store path)/projects`; written by every `pnpm install` except `--frozen-store`/`enableModulesDir: false` without GVS, `--lockfile-only`, `--dry-run`); if no registered project links into `links/`, it is left unchanged.

## Configuration

Store/linker settings live in `pnpm-workspace.yaml` (camelCase), not `.npmrc`.

### Store Location

```yaml title="pnpm-workspace.yaml"
storeDir: ~/.local/share/pnpm/store
```

If no directory above the project accepts hard links (agent sandbox, writable bind mount), the store falls back to `node_modules/.pnpm-store` (workspace root in a workspace). Cross-process locks live in a per-user dir (`$XDG_RUNTIME_DIR` if usable, else `/tmp`; `~/AppData/Local` on Windows); a sandbox blocking `/tmp` can set `XDG_RUNTIME_DIR` (processes sharing a store should see the same value).

The default store path is OS-specific (e.g. `~/.local/share/pnpm/store` on Linux, `~/Library/pnpm/store` on macOS). Find it with `pnpm store path`.

### Virtual Store

The virtual store (`.pnpm` in `node_modules`) contains hard links to the global store:

```yaml title="pnpm-workspace.yaml"
virtualStoreDir: node_modules/.pnpm
virtualStoreDirMaxLength: 60   # lower this for long-path issues on Windows
nodeLinker: hoisted            # alternative flat layout
```

### Store index format (v12.13+)

```yaml title="~/.config/pnpm/config.yaml"
storeIndexFormat: sqlite   # default: one index.db, local disk only
# storeIndexFormat: files  # one file per package in <store>/index; lock-free, for network stores shared by CI jobs
```

The format belongs to the store: once an `index` dir exists, every pnpm uses it; existing `index.db` entries are not carried over (re-download). Switch back by deleting `index`. pnpm v11 cannot read `files` stores.

## Disk Space Benefits

pnpm saves significant disk space:

- **Deduplication**: Same package version stored once across all projects
- **Content deduplication**: Identical files across different packages stored once
- **Hard links**: No copying, just linking

### Check disk usage

```bash
# Compare actual vs apparent size
du -sh node_modules        # Apparent size
du -sh --apparent-size node_modules  # With hard links counted
```

## Global Virtual Store

With `virtualStoreType: global`, projects skip the per-project `node_modules/.pnpm` directory entirely; their `node_modules` contains only symlinks into one shared virtual store at `<store-path>/links/`, keyed by dependency-graph hash. It is the default for global installs (`pnpm add -g`) only; `pnpm dlx`/`pnx` does NOT use it (each dlx cache entry keeps its own virtual store); for project installs it is still opt-in/experimental. Each project's `node_modules/.pnpm` still holds its current lockfile and hidden hoisted deps. Location: `<store-path>/links`, or set `globalVirtualStoreDir` (wins) or `virtualStoreDir`. Only applies with `nodeLinker: isolated`. Spawned processes get `NODE_PATH` plus a `NODE_OPTIONS --import` hook so hoisted lookups work in ESM too. It is no longer auto-disabled in CI. See `features-global-virtual-store` for details and the git-worktrees multi-agent workflow.

```yaml title="pnpm-workspace.yaml"
virtualStoreType: global    # canonical spelling
# enableGlobalVirtualStore: true   # equivalent, still works (virtualStoreType wins if both set)
```

## Node Linker Modes

Configure how `node_modules` is structured (`nodeLinker` in `pnpm-workspace.yaml`):

```yaml title="pnpm-workspace.yaml"
nodeLinker: isolated   # default: symlinked virtual store (strict, no phantom deps)
# nodeLinker: hoisted  # flat node_modules (npm-like) for tools that dislike symlinks
# nodeLinker: pnp      # Plug'n'Play, no node_modules (set `symlink: false` too)
# nodeLinker: { type: loaded, excluded: [vitest] }   # experimental store loader, see below
```

### Isolated Mode (Default)

- Strict dependency resolution
- No phantom dependencies
- Packages can only access declared dependencies

### Hoisted Mode

- Flat `node_modules` like npm
- For compatibility with tools that don't support symlinks
- Loses strictness benefits

### Loaded linker (experimental store loader)

`nodeLinker: { type: loaded }` lets Node load JS/JSON directly from the content-addressable store with no packages in `node_modules` (also enables the global virtual store). Setting `nodeLinker` replaces the whole value across config sources; env/CLI accept JSON (`PNPM_CONFIG_NODE_LINKER`, `--config.node-linker`).

```yaml title="pnpm-workspace.yaml"
nodeLinker:
  type: loaded
  excluded:       # exact names; all versions + their full dep trees are materialized as normal GVS packages
    - vitest
```

- Run `pnpm install`, then `pnpm run/test/exec` as usual: pnpm writes `node_modules/.pnpm/.store-manifest.json` and `.store-loader.mjs` and preloads the loader (child Node processes inherit via `NODE_OPTIONS`). Outside pnpm: `node --import ./node_modules/.pnpm/.store-loader.mjs app.mjs`.
- Requires Node 24.18+ (24.x) or 26.2+, else `ERR_PNPM_LOADER_UNSUPPORTED_NODE`.
- Patched packages, runtimes (`node@runtime:`), and anything with build scripts must be materialized (scripts packages need explicit `excluded` selection unless scripts are disabled; build approval still applies).
- Not combinable with `symlink: false` or `nodePackageMap.mode` other than `off`. Remove old `node_modules` when switching modes. Files are machine-local: reinstall after moving the project.
- Limits: no real filesystem (`__dirname`, `import.meta.url` are virtual; `fs` reads of adjacent assets fail), no native addons, WASM, TypeScript, or package-internal symlinks. Packages needing these must be put in `excluded`.

## Package map (v12.13+)

```yaml title="pnpm-workspace.yaml"
nodePackageMap:
  mode: off          # off (default) | write-only (write node_modules/.package-map.json) | load (also add --experimental-package-map to NODE_OPTIONS)
  # type: loose
```

Replaces deprecated `nodeExperimentalPackageMap` (`true` = `mode: load`) and `nodePackageMapType`.

## Side Effects Cache

Cache build outputs for native modules (enabled by default):

```yaml title="pnpm-workspace.yaml"
sideEffectsCache: true
sideEffectsCacheReadonly: false   # only read the cache, don't create it
```

## Read-only / Frozen Store

`frozenStore: true` lets `pnpm install` run against a read-only store (Nix store, read-only bind mount, OCI layer). Pair with `--offline --frozen-lockfile`; the store must already contain everything, including approved build outputs.

```bash
pnpm install --frozen-store --offline --frozen-lockfile
```

No other process may modify the store during a frozen-store install (immutable reads bypass SQLite locks and can report a malformed database). Missing builds fail with `ERR_PNPM_FROZEN_STORE_NEEDS_BUILD`, a missing content dir with `ERR_PNPM_FROZEN_STORE_INCOMPLETE`. Leave it off for ordinary parallel installs sharing a local store.

## Shared Store Across Machines

For CI/CD, you can share the store:

```yaml
# GitHub Actions example
- uses: pnpm/action-setup@v4
  with:
    run_install: false

- name: Get pnpm store directory
  shell: bash
  run: echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

- uses: actions/cache@v4
  with:
    path: ${{ env.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
```

## Troubleshooting

### Store corruption
```bash
# Verify and fix store
pnpm store status
pnpm store prune
```

### Hard link issues (network drives, Docker)
```yaml title="pnpm-workspace.yaml"
# auto (default): on Linux (v12) tries hardlink -> clone -> copy; macOS is clone-first (APFS)
packageImportMethod: copy       # copy | clone | clone-or-copy | hardlink
```

Cloning shares data with the store until written (safe to edit). A package a lifecycle script or patch will write is imported with `clone-or-copy` under `auto`/`hardlink`/`clone`. On macOS pnpm writes with 4 threads; on machines with Endpoint Security software try `PNPM_MACOS_LINK_THREADS=0`.

> v12 change: on Linux `packageImportMethod: auto` hardlinks before reflinking (roughly halves materialize time on btrfs). Use `clone` (or `clone-or-copy`) if you edit files inside `node_modules`, since a hardlinked file *is* the store's file.

### Permission issues
```bash
# Fix store permissions (find the path with `pnpm store path`)
chmod -R u+w "$(pnpm store path)"
```

<!--
Source references:
- https://pnpm.io/symlinked-node-modules-structure
- https://pnpm.io/cli/store
- https://pnpm.io/settings/store
- https://pnpm.io/settings/node-modules
- https://pnpm.io/global-virtual-store
- https://pnpm.io/store-loader
- https://pnpm.io/settings/store#storeindexformat
-->
