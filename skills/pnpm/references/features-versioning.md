---
name: pnpm-release-management
description: Native workspace versioning and releases with pnpm change, pnpm version -r, lanes, epics, and fixed groups
---

# Release Management (v11.13.0+)

pnpm versions and releases a workspace without a separate release tool. Two halves:

1. As you work, `pnpm change` records **change intents** — markdown files in `.changeset/` (changesets format) naming affected packages, bump types, and a changelog summary. Commit them with the change.
2. At release, bare `pnpm version -r` consumes pending intents: bumps versions, propagates to dependents, writes changelogs, and records what it consumed in a committed ledger.

An existing `.changeset/` keeps working; you can still use the Changesets CLI instead.

## Recording a change

```sh
pnpm change                                              # interactive prompt
pnpm change --bump patch --summary "Fix crash" @ex/core  # non-interactive (scripts)
pnpm change status                                       # pending intents + release plan
```

Writes e.g. `.changeset/calm-cats-resolve.md`:

```markdown
---
"@example/core": minor
---
Added a `--watch` flag to the build command.
```

`--bump` accepts `none|patch|minor|major` (`none` = explicit "no release"). When two projects share a name, reference one by `./`-prefixed directory (`"./packages/cli": minor`).

## Releasing

```sh
pnpm version -r              # consume intents, bump, changelog, ledger
pnpm version -r --dry-run    # preview
pnpm version -r --filter …   # narrow (selection expands to settle deps/fixed groups)
```

No git commit/tag is created (many packages, many versions) — commit yourself, then `pnpm publish -r`. Working tree must be clean unless `--dry-run`/`--no-git-checks`. Every package bumped through a `workspace:` range to a bumped dependency is bumped too. First release of a package publishes the manifest version verbatim (v11.16.0+).

## Configuration (`versioning` in pnpm-workspace.yaml)

```yaml title="pnpm-workspace.yaml"
versioning:
  fixed:
    - ['@example/cli', '@example/napi']   # always release at one shared version
  ignore:
    - '@example/internal'                 # excluded from versioning + propagation
  maxBump: minor                          # cap the bump this checkout may apply
  lanes:
    '@example/cli': alpha                 # parallel release track
  epics:
    - lead: '@example/app'
      packages: ['./packages/**', '!./packages/private-*']
  changelog:
    storage: repository                   # commit CHANGELOG.md (default: registry)
```

- **fixed groups** release together at the highest current version bumped by the largest needed bump; must move lanes together and sit wholly in/out of an epic.
- **changelog.storage:** `registry` (default) composes each section at publish time into the tarball, no committed `CHANGELOG.md`; `repository` commits one per package.

## Lanes

A lane is a parallel release track. A package on lane `alpha` releases `X.Y.Z-alpha.N` prereleases from the same runs that ship stable versions of everything on `main`.

```sh
pnpm lane alpha --filter @example/cli   # move onto alpha (--filter required)
pnpm lane main --filter @example/cli    # graduate to stable on next version -r
pnpm lane                               # show membership
```

`N` counts from 0 and restarts when the stable target changes. Lane names: alphanumerics/hyphens, not purely numeric; `main` is reserved.

## Epics

An epic ties member packages to a lead, constraining each member's major to a band: while the lead is on major `M`, members live in `M*100`…`M*100+99` (lead on `11.x` ⇒ members in `1100`–`1199`). A bump past the ceiling is rejected until the lead advances; when the lead hits a new major, members re-base to the band floor in the same plan.

## Validation & the ledger

```sh
pnpm change check   # (v12.4.0) validate committed versions against epic bands + fixed groups; reads no intents — run on every PR
```

`pnpm version -r` records consumed intents in `.changeset/ledger.yaml` (committed, append-only). Consumption is tracked per project — an intent file is deleted only once every project it names has released, making cherry-picks/merge-backs between release branches safe.

<!--
Source references:
- https://pnpm.io/versioning
- https://pnpm.io/cli/change
- https://pnpm.io/cli/lane
- https://pnpm.io/cli/version
- https://pnpm.io/settings/versioning
-->
