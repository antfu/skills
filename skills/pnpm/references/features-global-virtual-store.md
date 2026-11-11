---
name: pnpm-global-virtual-store
description: Global virtual store for shared node_modules, git-worktree multi-agent setups, isolated global packages, project-aware global bins, shims, and other package managers
---

# Global Virtual Store, Git Worktrees, Global Packages & Shims

## Global virtual store

By default each project has its own `node_modules/.pnpm` virtual store containing hard links to the content-addressable store. With the **global virtual store** enabled, pnpm keeps one shared virtual store at `<store-path>/links/` (find it via `pnpm store path`, or at `virtualStoreDir` when set), and each project's `node_modules` contains only **symlinks** into it.

```yaml title="pnpm-workspace.yaml"
virtualStoreType: global    # enableGlobalVirtualStore: true is equivalent
```

```
# Default (per-project .pnpm with hard links)
project-a/node_modules/lodash -> .pnpm/lodash@4.17.21/node_modules/lodash

# Global virtual store (symlink to shared location)
project-a/node_modules/lodash -> <store>/links/@/lodash/4.17.21/<hash>/node_modules/lodash
project-b/node_modules/lodash -> <store>/links/@/lodash/4.17.21/<hash>/node_modules/lodash  # same target
```

- **Package identity = hash of the dependency graph.** Two projects with the same `lodash@4.17.21` and the same transitive tree point at the exact same directory (NixOS-style). Different peers ⇒ separate entries.
- No packages are linked into a per-project `.pnpm`; it holds only the project's current lockfile and hidden hoisted deps.
- **Near-zero per-project cost** and **instant installs** once a version is in the store.
- It is the default for global installs (`pnx` does not use it); for **project** installs it is still **opt-in/experimental**.

### Limitations

- **CI:** auto-disabled (no warm cache to benefit from).
- **Trust:** the store is shared writable state — only for mutually trusting projects/users/jobs; protect the path with filesystem permissions.
- **ESM hoisting:** relies on `NODE_PATH`, which Node ignores for ESM imports. pnpm-spawned processes (`run`, `exec`, lifecycle scripts) also get a `NODE_OPTIONS --import` resolve hook restoring those lookups under ESM. A `node` started outside pnpm doesn't get it, and `extendNodePath: false` disables the whole mechanism — declare missing deps with `packageExtensions` (or `@pnpm/plugin-esm-node-path`) if they must resolve either way.

## Git worktrees for multi-agent development

Git worktrees let you check out many branches simultaneously, each in its own directory, sharing one `.git` object store. Combined with the global virtual store, every worktree gets a fully functional `node_modules` that is almost free on disk — ideal for running multiple AI agents in parallel.

```sh
# Bare repo as the hub, one worktree per branch/agent
git clone --bare https://github.com/your-org/your-monorepo.git your-monorepo
cd your-monorepo
git worktree add ./main main
git worktree add ./feature-auth feat/auth
git worktree add ./fix-api fix/api-error
```

```yaml title="pnpm-workspace.yaml"
packages:
  - 'packages/*'
virtualStoreType: global
```

```sh
cd main && pnpm install            # first install fills the global store
cd ../feature-auth && pnpm install # subsequent worktrees: nearly instant, just symlinks
```

Each worktree has its own `node_modules` tree (so agents can install different versions on different branches without conflict), but all package contents come from the one shared store. Remove a worktree with `git worktree remove ./feature-auth`.

> Assumes all worktrees/agents share the same trust boundary.

## Global packages (v11 isolated installs)

`pnpm add -g` was redesigned in v11 for isolation. Each globally installed package (or group) gets its own install directory with its own `package.json`, `node_modules/`, and lockfile, so global tools can't break each other via peer/hoisting conflicts. Installs are stored at `{pnpmHomeDir}/global/v11/{hash}/` and share the global virtual store.

```sh
pnpm add -g typescript prettier      # space-separated = separate isolated installs each
pnpm add -g eslint,prettier          # comma-separated = ONE shared install group
pnpm remove -g eslint                # removes only eslint's group
pnpm add -g --allow-build=esbuild esbuild   # pre-approve build scripts
pnpm list -g                         # always works at depth 0
pnpm bin -g                          # global bin dir = $PNPM_HOME/bin
```

- `pnpm install -g` (no args) is **not** supported — use `pnpm add -g <pkg>`.
- `pnpm add -g <pkg>` **replaces every existing group containing `<pkg>`**: after `pnpm add -g eslint`, the `eslint,prettier` group is gone (prettier and its bins too). Re-add the whole group (`pnpm add -g eslint,prettier`) or use `pnpm update -g`.
- Cannot be installed globally: pnpm itself (`ERR_PNPM_GLOBAL_PNPM_INSTALL`, use `pnpm self-update`), a package whose bin a `pnpm shim` already provides (`ERR_PNPM_GLOBAL_BIN_CONFLICT`), `crate:`/Python deps. `pnpm add -g rust` installs a Rust toolchain, not the npm `rust` package.
- `pnpm outdated -g` and `pnpm approve-builds -g` work. Orphaned install dirs older than 5 min are cleaned at the next global add/update/`self-update`. With `virtualStoreType: project`, each group keeps its own `node_modules/.pnpm`.
- Binaries live in `$PNPM_HOME/bin` (not `$PNPM_HOME` directly). Run `pnpm setup` after upgrading to put it on PATH.
- Register a local package's bins globally with `pnpm add -g .` (replaces `pnpm link --global`).
- `pnpm list -g --depth=<n>` (n>0) only works for a single install group.

## Project-aware global bins (v12)

A globally installed `node`/`deno`/`bun` (and any shimmed tool) runs the version the **current project** pins — no version-manager, no shell hooks. pnpm walks up to the nearest project that provides the command:

- **Runtimes** (`node`/`deno`/`bun`): only a runtime pin counts (`devEngines.runtime`, then `engines.runtime`; for `node` since v12.7.0 also `.node-version`/`.nvmrc`, see below); the version is downloaded into the global virtual store on demand. A dependency cannot supply the `node` you run.
- **Package managers** (`npm`/`yarn`/`bun`, v12.0.0-rc.6): the project's `packageManager`/`devEngines.packageManager` pin counts and pnpm provisions it.
- **Any other package:** the project's `node_modules/.bin/<name>`.

`.node-version`/`.nvmrc` (v12.7.0): the nearest directory declaring a Node.js runtime wins; within one directory `package.json` > `.node-version` > `.nvmrc`. Accepts a version/range (optional `v`), `node`, `stable`, `lts/*`, `lts/<codename>`; comments ignored; nvm-only values (`system`, `default`, custom aliases) are ignored and count as unpinned.

If the project provides nothing (or the lookup is declined), the global version runs — dispatch never makes a command fail.

**Trust:** under the default `auto` policy a signed stable Node.js and package-manager pins resolved from the npm registry (signature-verified, e.g. `yarn@1`, `npm`) switch silently; everything else (Deno, Bun, prereleases, ordinary packages) asks once per project + per binary, remembered machine-locally. CI (non-interactive) always uses the global version. Set the `globalShims` policy to `prompt` or `always` to change this; `PNPM_SHIM_BYPASS=1` bypasses for one command.

Runtimes, Rust toolchain shims (`cargo`, `rustc`, ... following the project's toolchain file) and globally installed package managers participate by default; enable others via `globalShims` (global config only, keyed by package name), then reinstall the package:

```yaml title="~/.config/pnpm/config.yaml"
globalShims:
  typescript: true
```

### Shims for tools not installed globally (`pnpm shim`)

```bash
pnpm shim add yarn      # links a `yarn` that runs whatever the current project pins
pnpm shim ls
pnpm shim rm yarn
```

A shim has no global install behind it; it exists purely to let the project decide. Never created as a side effect of `pnpm setup`/install (it shadows PATH). Since v12.3.0 every project-aware global command pnpm writes is a native executable on every platform (`.exe` on Windows, not `.cmd`/`.ps1`).

To add `bun` as a runtime (not package manager) use `pnpm add bun@tool:1.3.0`; the explicit runtime spelling is `node@tool:22` (not `@runtime:`).

## Other package managers (v12)

pnpm v12 can install **npm, Yarn (Classic/Berry/6), and Bun** — not just itself. Registry-published ones are verified against npm's signature; Yarn 6 and Bun arrive as checksum-pinned platform archives. A JS package manager runs on a managed LTS runtime, so no separate Node.js is needed.

```bash
pnpm add yarn@4            # records the project's package manager (NOT the npm "yarn" package)
pnpm add -g yarn          # installs the current Yarn line
pnpm add -g node@22       # installs that Node.js release, not a wrapper
pnpm add yarn@npm:yarn@1.22.22   # a package specifier still installs that package
```

- Yarn is recorded in `packageManager` (exact, resolved); every other PM in `devEngines.packageManager` (range). Only one of the two fields is kept.
- A globally installed PM defers to a project's pin (adds a `globalShims` entry). `pnpm add <pm> --filter …` is refused — run it in the project.
- A git-hosted dependency is built with the package manager its own repo asks for, so a Yarn repo installs on a pnpm-only machine.

## Key Points

- `virtualStoreType: global` ⇒ `node_modules` is symlinks into one shared, hash-addressed store.
- Best for many checkouts of the same repo (git worktrees, parallel agents); auto-disabled in CI.
- Watch out for ESM packages importing undeclared deps (NODE_PATH limitation; the resolve hook covers pnpm-spawned processes).
- Global installs are isolated per package; comma-list to share a group; bins live in `$PNPM_HOME/bin`.
- v12: global `node`/`deno`/`bun` and shimmed tools follow the project's pin; pnpm can install other package managers (npm/yarn/bun).

<!--
Source references:
- https://pnpm.io/global-virtual-store
- https://pnpm.io/git-worktrees
- https://pnpm.io/global-packages
- https://pnpm.io/package-managers
- https://pnpm.io/cli/shim
- https://pnpm.io/settings/node-modules#virtualstoretype
- https://pnpm.io/settings/other#globalshims
- https://pnpm.io/settings/node-modules#virtualstoredir
-->
