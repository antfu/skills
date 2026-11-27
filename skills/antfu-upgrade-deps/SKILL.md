---
name: antfu-upgrade-deps
description: Upgrade the dependencies of the current project with taze, migrate code for major versions by reading their changelogs, dedupe the lockfile, verify tests, lint, and typecheck, then open a PR. Use when asked to upgrade, update, or bump dependencies.
metadata:
  author: Anthony Fu
  version: "2026.11.27"
---

# Upgrade Dependencies

Bump every dependency the project allows to its latest version with [taze](https://github.com/antfu-collective/taze), migrate the code for each major version, and ship it as one reviewable PR. The bar: after the PR, the project's consumers see no change unless the user approved it.

## Workflow

1. **Prepare.** Start from a clean working tree on the up-to-date default branch, then create a branch (e.g. `chore/upgrade-deps`). Detect the package manager from the lockfile and the `packageManager` field. Note the check scripts in the root `package.json` (`lint`, `typecheck`, `test`, `build`) and what CI runs in `.github/workflows`.
2. **Collect the ignore list.** Read `pnpm-workspace.yaml` for `updateConfig.ignoreDependencies` and `update.ignoreDeps` (names or globs), plus `exclude` in `taze.config.*` / `.tazerc`. These dependencies stay at their current versions, including in catalogs. `taze@21+` applies all of them itself, along with `minimumReleaseAge`; with an older taze, pass each entry as `-x <name>`.
3. **Survey.** Run `npx taze@latest major -r --json` (drop `-r` for a single-package repo). Check that no ignored dependency shows up in the output. Split the result into non-major bumps and major bumps. Treat `0.x` minor bumps (`0.3` to `0.4`) as major. Done when every outdated dependency is in one of the two lists or the ignore list.
4. **Research each major.** For every major bump, read the changelog from the current version to the target: GitHub releases, `CHANGELOG.md`, and the migration guide if one exists. List each breaking change, then search the repo for the affected APIs, options, and config. Done when every breaking change is marked "affects us" (with the file paths) or "does not affect us" (with the reason).
5. **Judge the user-side impact.** A major is **user-facing** when consumers of this project would notice it:
   - It is in `dependencies` or `peerDependencies` of a published package, and its types, exports, or behavior pass through this package's public API.
   - It raises the Node.js `engines` floor, drops CJS or a platform, or changes the output format (build tools, bundlers).
   - Migrating it requires changing this project's own public API, options, or defaults.

   For each user-facing major, ask the user with the question tool before upgrading. Give the breaking change, who it affects, and options: upgrade and accept the breaking change, upgrade with a compatibility shim, or skip it (add to `-x`). Recommend one. `devDependencies` and internal tooling are not user-facing; upgrade them without asking.
6. **Upgrade.** Write the versions with `npx taze@latest major -r -w -x <skipped...>`, then install. taze leaves `peerDependencies` alone by default (no `--peer`). See [Peer dependencies](#peer-dependencies).
7. **Migrate.** Apply the code changes from step 4 for every "affects us" item, following the official migration guide over guesses. Lint rule changes from an ESLint config upgrade count: run the lint fix script, then review what it changed.
8. **Dedupe.** Run the dedupe command (`pnpm dedupe`, `yarn dedupe`, or `npm dedupe`), then install once more so the lockfile is stable.
9. **Verify.** Run every check script from step 1 (lint, typecheck, test, build). Fix the root cause of each failure; never skip tests, loosen types, or disable lint rules to pass. If a failure comes from a regression in the new version that you cannot fix, revert that one dependency, record why, and report it. Done when all checks pass on the final lockfile.
10. **Open the PR** with the `antfu-create-pr` skill. Commit shape:
    - `chore(deps): update dependencies` for non-major bumps and the lockfile.
    - One commit per major that needed migration, e.g. `chore(deps): update vite to v8`, holding its bump and code changes together.

    In the PR body, add a table of major upgrades: package, from, to, changelog link, migration done, user-facing impact. List skipped and ignored dependencies with the reason.

## Peer dependencies

Widen peer ranges; keep the old majors in them. Raising the floor drops support for users still on the old major. Only the dev copy in `devDependencies` moves to the new version.

When a peer releases a new major and the code works with it unchanged (all checks pass), append the new major to the range:

```diff
  "peerDependencies": {
-   "vite": "^4.0.0-0"
+   "vite": "^4.0.0-0 || ^5.0.0-0"
  }
```

If the code must change to support the new major, ask the user before dropping the old one. That is a breaking change for consumers.

## Rules

- Only upgrade what is listed as outdated by taze; leave pinned versions (without `^`/`~`) alone unless the user asks (`-l` includes them).
- Keep catalogs as catalogs: taze updates `pnpm-workspace.yaml` catalogs in place; never inline versions into `package.json`.
- Do not change `overrides`, `resolutions`, or `patchedDependencies` silently. If a bump makes a patch or override obsolete or broken, say so in the PR and ask before removing it.
- State what you verified. A claim like "no user-facing change" needs the evidence from step 4 and 5 behind it.
