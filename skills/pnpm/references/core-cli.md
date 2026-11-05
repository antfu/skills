---
name: pnpm-cli-commands
description: Essential pnpm commands for package management, running scripts, workspaces, publishing, and runtimes
---

# pnpm CLI Commands

pnpm provides a comprehensive CLI. Commands resemble npm/yarn but with unique features.

> **pnpm v12 is a Rust rewrite** of v11, stable, keeping v11's commands, flags, settings, and lockfile format. A few behaviors differ (see best-practices-migration).
## Installation Commands

```bash
pnpm install            # install all deps (alias: pnpm i)
pnpm add <pkg>          # production dependency
pnpm add -D <pkg>       # devDependency       (also -d)
pnpm add -O <pkg>       # optionalDependency  (also -o)
pnpm add -E <pkg>       # exact version       (also -e)
pnpm add <pkg>@<version>
pnpm add <alias>@npm:<pkg>[@<version>]   # install under another local name
pnpm remove <pkg>       # aliases: rm, uninstall, un
pnpm update             # alias: up
pnpm update --latest    # ignore semver ranges (-L)
pnpm update -i          # interactive
pnpm update --depth 0   # direct deps only
```

### Clean / reproducible installs

```bash
pnpm install --frozen-lockfile   # fail if lockfile would change (auto in CI)
pnpm ci                          # clean install = pnpm clean + install --frozen-lockfile
pnpm clean                       # remove node_modules in all workspace projects (alias: purge)
pnpm clean --lockfile            # also delete pnpm-lock.yaml
pnpm install --no-frozen-lockfile  # allow lockfile updates (e.g. in CI)
pnpm install --lockfile-only     # update lockfile without node_modules (also on add)
pnpm install --allow-build=esbuild --allow-build='!core-js'  # (v12.7+) allow/deny build scripts, recorded in allowBuilds
```

> Since v11, an integrity mismatch against the lockfile is a hard error (`ERR_PNPM_TARBALL_INTEGRITY`). Use `pnpm install --update-checksums` only after verifying the new bytes. Since v12.7, `--force` no longer installs optional deps whose os/cpu/libc mismatch the host (`forceIgnoresPlatform: true` restores it). In CI, pnpm also fails on lockfiles written by a newer pnpm major.

## Script Commands

```bash
pnpm run <script>        # or just: pnpm <script>
pnpm run build -- --watch
pnpm run --if-present build
pnpm set-script test "vitest run"   # add/update a scripts entry (alias: ss)
pnpm exec <cmd>          # run a local binary, e.g. pnpm exec eslint .
pnpm exec -r <cmd>       # in every workspace project (pnpm options may precede the command name)
pnpm run "/^watch:/"     # regex selector: run all matching scripts
pnpm run -s <script>     # -s = --sequential for run (and `pnpm -s <script>`), unlike elsewhere
```

- **Hidden scripts:** names starting with `.` (e.g. `.helper`) can't be run directly, only called from other scripts.
- **Built-in vs script conflict:** `clean`, `setup`, `deploy`, `rebuild`, `tasks` prefer a same-named `package.json` script. Force the built-in with `pnpm pm <name>` (e.g. `pnpm pm clean`).

### dlx / pnx — run without installing

```bash
pnx create-vite my-app          # pnx == pnpm dlx == pnpx
pnpm dlx degit user/repo dest
pnx shx@catalog:                # catalog: protocol supported
pnx --package=@scope/tool tool --help
```

> `dlx`/`pnx` honor supply-chain settings (`minimumReleaseAge`, `trustPolicy`) and use the global virtual store by default. In an interactive terminal they prompt to approve a dependency's skipped build scripts (or use `--allow-build`).

### Run another package manager / runtime with pnx (v12)

Naming a package manager (`pnpm`, `npm`, `yarn`, `bun`) or runtime (`node`, `deno`, `bun`) provisions the real thing, not the npm package of that name:

```bash
pnx yarn@4 install
pnx npm@11 ci
pnx node@22 --version
pnx --cpu arm64,x64 --os linux some-cli   # pick platform-tagged optional deps (also --libc)
pnx yarn@npm:yarn@1.22.22       # a specifier that locates a package installs it unchanged
```

## Workspace Commands

```bash
pnpm -r run <script>              # run in all packages (alias: --recursive)
pnpm --filter <pattern> run <script>
pnpm --filter "./packages/**" run build
pnpm --filter "@myorg/*" run lint
pnpm -r --parallel run dev
```

### Filter patterns

```bash
pnpm --filter <pkg-name> <cmd>      # by name (-F shorthand)
pnpm --filter "./packages/core" test
pnpm --filter "...@scope/app" build   # package + its dependencies
pnpm --filter "@scope/core..." test   # package + its dependents
pnpm --filter "...[origin/main]" build  # changed since merge base with ref (v12.7+)
pnpm --filter "!./packages/**" --filter @scope/core build  # filters apply in order (v12.7+)
```

## Patches

```bash
pnpm patch <pkg>@<version>     # opens an editable copy, prints a path
pnpm patch-commit <path>       # writes patches/*.patch and records it
pnpm patch-remove <pkg>@<version>
```

## Linking local packages

```bash
pnpm link <dir>...       # link paths into node_modules (path only!); also writes a link: dep and a root `overrides` entry
pnpm add -g .            # register the current package's bins globally
```

> Breaking in v11: `pnpm link` accepts **only relative/absolute paths** (no global store resolution, no `--global`, no bare `pnpm link`). Use `pnpm add -g .` to expose bins system-wide. `pnpm unlink` removes the overrides.

## Global packages (v11 isolated installs)

```bash
pnpm add -g typescript prettier   # each gets its own isolated install dir
pnpm add -g eslint,prettier       # comma = ONE shared install group
pnpm add -g --allow-build=esbuild esbuild
pnpm remove -g <pkg>
pnpm list -g
pnpm bin -g                       # show global bin dir ($PNPM_HOME/bin)
```

> `pnpm install -g` (no args) is not supported. After upgrading run `pnpm setup` so `$PNPM_HOME/bin` is on PATH.

## Project-aware command shims (v12)

Global `node`/`deno`/`bun` (and shimmed tools) run the version the current project pins. Create shims for tools with no global install behind them:

```bash
pnpm shim add yarn      # `yarn` runs whatever version the current project pins
pnpm shim ls
pnpm shim rm yarn
```

> Shims are never written as a side effect of `pnpm setup`/install (a shim shadows PATH). Governed by the `globalShims` setting. See features-global-virtual-store.

## Runtimes (Node/Deno/Bun)

```bash
pnpm runtime set node 22 -g       # install & expose node (alias: rt)
pnpm runtime set node lts -g
pnpm runtime set deno 2 -g
pnpm runtime set node 22            # no -g: add to project devEngines.runtime (-P: engines.runtime)
pnpm install --no-runtime         # skip installing devEngines.runtime entries
```

The Node runtime does not bundle `npm`/`npx`/`corepack`; install npm with `pnpm add -g npm`.

### Rust toolchain (v12.11+)

```bash
pnpm add rust@1.95                # pin in rust-toolchain.toml (channel: version, stable, beta, nightly, nightly-YYYY-MM-DD)
pnpm add -g rust@stable           # global toolchain; bare cargo/rustc use project-pinned one
pnx --package=rust@nightly-2026-01-01 cargo build   # one-off release (v12.11.1)
```

See features-multi-ecosystem.

## Store management

```bash
pnpm store path        # store location (prints removed size after prune)
pnpm store prune       # GC unreferenced packages (+ global virtual store links)
pnpm store status
```

## Inspection / registry

```bash
pnpm list                 # alias: ls
pnpm why <pkg>            # reverse-dependency tree (dedupes subtrees)
pnpm why --find-by=<finder>   # custom finder from .pnpmfile.mjs
pnpm outdated
pnpm audit
pnpm peers check          # report unmet/missing peers from the lockfile
pnpm view <pkg> [field]   # registry metadata (aliases: info, show)
pnpm whoami
pnpm rebuild
pnpm import               # create pnpm-lock.yaml from npm/yarn lockfile
pnpm dedupe
```

## Publishing

```bash
pnpm pack
pnpm publish -r --no-git-checks
pnpm version patch|minor|major|2.0.0    # bump version, commit + tag
pnpm version prerelease --preid beta
pnpm version patch --dry-run            # preview (also works with -r)
pnpm deprecate <pkg>@<range> "message"
pnpm dist-tag add <pkg>@<version> <tag>
pnpm unpublish <pkg>@<version>          # discouraged; prefer deprecate
pnpm sbom --sbom-format cyclonedx       # SBOM: cyclonedx (1.7) | spdx (2.3); needs lockfile, manifest optional
pnpm stage publish ...                  # staged publishing (defer 2FA)
pnpm token list|create|revoke <id>      # registry auth tokens (v12.13+; create: --read-only, --cidr)
pnpm profile get|set|enable-2fa|disable-2fa   # registry profile (set password prompts; never pass on CLI)
```

## Release management (native, v11.13+)

```bash
pnpm change                    # record a change intent in .changeset/
pnpm change status             # pending intents + release plan
pnpm change check              # validate committed versions vs epics/fixed groups (CI)
pnpm version -r [--dry-run]    # consume intents: bump, changelog, ledger (no git tag)
pnpm lane <name> --filter <p>  # move package(s) onto a release lane
```

See features-versioning for the full workflow.

## Task orchestration & pipelines

```bash
pnpm -r run <script>           # runs the tasks graph (see features-task-orchestration)
pnpm -r run --dry-run build    # inspect the graph
pnpm tasks status              # running/waiting tasks per concurrency group (v12.6)
pnpm pipeline [name]           # cached CI-style run (v12.4, experimental; `remoteCache` shares results)
```

## Cache (registry metadata)

```bash
pnpm cache path
pnpm cache prune
pnpm cache view <pkg>
```

## Maintenance & version management

```bash
pnpm self-update [<version>]   # updates the packageManager pin, or installs globally
pnpm with current install      # run a specific pnpm version for one command
pnpm with 11.0.0 install
pnpm approve-builds [--all]    # review dependency build scripts (writes allowBuilds)
pnpm approve [--all] [pkg] [!pkg]  # = pnpm permissions approve (v12.11+): build scripts AND agent skills
pnpm permissions [list]        # granted/denied permissions + packages awaiting approval
```

## Useful Flags

```bash
pnpm install --ignore-scripts
pnpm install --prefer-offline
pnpm install --prod            # -P, omit devDependencies
pnpm install --no-optional
pnpm install --strict-peer-dependencies
```

## Key Points

- `pnpm ci` = clean + frozen install; CI auto-enables frozen-lockfile.
- `dlx`/`pnpx` are aliases of `pnx`; global installs are now isolated per package (comma-list to share).
- `pnpm link` only takes paths; use `pnpm add -g .` for global bins.
- Manage Node/Deno/Bun with `pnpm runtime set`; skip them at install with `--no-runtime`.
- Publishing/registry commands: `version`, `view`, `whoami`, `deprecate`, `dist-tag`, `unpublish`, `sbom`, `stage`.
- v12 adds native releases (`change`, `version -r`, `lane`), task inspection (`tasks status`), `pipeline`, `shim`, and `cache` commands; `pnx` can run other package managers/runtimes. v12.11+ adds `pnpm permissions`/`approve` (also agent skills), `rust` toolchain support; v12.13+ adds `pnpm token`.

<!--
Source references:
- https://pnpm.io/cli/install
- https://pnpm.io/cli/add
- https://pnpm.io/cli/run
- https://pnpm.io/filtering
- https://pnpm.io/cli/link
- https://pnpm.io/global-packages
- https://pnpm.io/cli/runtime
- https://pnpm.io/cli/version
- https://pnpm.io/cli/with
- https://pnpm.io/cli/sbom
- https://pnpm.io/cli/change
- https://pnpm.io/cli/lane
- https://pnpm.io/cli/tasks
- https://pnpm.io/cli/pipeline
- https://pnpm.io/cli/shim
- https://pnpm.io/cli/pnx
- https://pnpm.io/cli/permissions
- https://pnpm.io/cli/profile
- https://pnpm.io/cli/token
- https://pnpm.io/cli/exec
-->
