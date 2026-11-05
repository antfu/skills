---
name: pnpm-supply-chain-security
description: Build-script approval (allowBuilds), minimum release age, trust policy, and exotic-subdep blocking for safer installs
---

# pnpm Supply-Chain Security

pnpm blocks several attack vectors by default. Agents installing dependencies must understand these, since installs can fail or prompt on them.

## Build-script approval (allowBuilds)

By default pnpm does **not** run dependency lifecycle scripts (`preinstall`/`install`/`postinstall`). Packages must be explicitly approved. Approval lives in one `allowBuilds` map in `pnpm-workspace.yaml`.

```yaml title="pnpm-workspace.yaml"
allowBuilds:
  esbuild: true
  core-js: false
  # version selectors are supported
  nx@21.6.4 || 21.6.5: true
```

- Packages **not listed** are unreviewed and blocked by default.
- `strictDepBuilds: true` (default) ⇒ unreviewed builds make install exit non-zero (`ERR_PNPM_IGNORED_BUILDS`). Set `false` to warn instead.
- During install, unreviewed packages with build scripts are auto-added to `pnpm-workspace.yaml` with the placeholder `set this to true or false` so you can set `true`/`false`.
- Git/tarball deps are never approved by bare name: use the exact resolved path (with commit) or the repo URL (`foo@git+https://github.com/org/foo.git: true`, also covers tarball downloads from GitHub/GitLab/Bitbucket).

> `allowBuilds` replaces the removed `onlyBuiltDependencies`, `neverBuiltDependencies`, `ignoredBuiltDependencies`, `onlyBuiltDependenciesFile`, and `ignoreDepScripts`.

### Approving builds

```bash
pnpm approve-builds            # interactive prompt
pnpm approve-builds --all      # approve all pending (cannot combine with names)
pnpm approve-builds esbuild fsevents !core-js   # ! = deny
pnpm add --allow-build=esbuild my-bundler       # approve while adding
pnpm add -g --allow-build=esbuild esbuild       # global (replaces approve-builds -g)
```

Naming one package both approved and denied fails (`ERR_PNPM_APPROVE_BUILDS_CONTRADICTING_ARGS`). Approved pending packages are rebuilt immediately. Writing `allowBuilds` also removes the ignored legacy settings from the file.

### Permissions and agent skills (v12.11.0)

`pnpm approve` (= `pnpm permissions approve`; `pnpm permissions ls` lists) reviews what each dependency may do: `build` (run build scripts) and `skills` (pnpm links the agent skills the package ships, from its `skills/<name>/SKILL.md`, into the project's agent skill dirs). Decisions go in a `permissions` map; a package's `permissions` entry outranks its `allowBuilds` entry. Build decisions are written to `permissions` only if the file already has it, otherwise to `allowBuilds`.

```yaml title="pnpm-workspace.yaml"
permissions:
  drizzle-kit:
    build: true
    skills: [guide, migrate]   # true = all, false = none, list = exactly these
  some-pkg:
    skills: false
skills:
  dirs: [.claude/skills]       # default: existing .<agent>/skills dirs + the running agent's; [] disables skills
```

- Install never fails on pending skills; it prints "Agent skills awaiting approval" for direct deps (only dep groups the install includes). Run `pnpm install` before `pnpm approve`.
- `pnpm approve drizzle-kit !esbuild` (`!` denies), `--all` approves everything.
- Links are named after the skill dir (fallback `pnpm-<package>-<skill>`, `/` in scope becomes `+`), listed in a `# pnpm` block of a `.gitignore` in each skills dir. Not linked by global installs, `dlx`, or `deploy`.

### Escape hatch (dangerous)

```yaml title="pnpm-workspace.yaml"
dangerouslyAllowAllBuilds: true   # runs ALL build scripts now and in the future — avoid
```

Explicitly denied packages (`false` in `allowBuilds`, `build: false` in `permissions`) stay blocked.

## Minimum release age

Delay installing freshly published versions so malicious releases (usually pulled within an hour) are avoided. Applies to **all** deps, including transitive.

```yaml title="pnpm-workspace.yaml"
minimumReleaseAge: 1440          # minutes; default 1440 (1 day)
minimumReleaseAgeExclude:        # always install newest of these immediately
  - webpack
  - '@myorg/*'
  - nx@21.6.5                    # exempt a specific version
```

- `minimumReleaseAgeStrict` — when no in-range version satisfies the age, fail (default when you set `minimumReleaseAge` yourself) vs. fall back.
- `minimumReleaseAgeIgnoreMissingTime` — skip the check for registries that omit the `time` field (default `true`); also governs `trustPolicy` (undatable packages are skipped with a warning instead of `ERR_PNPM_MISSING_TIME`).
- Does not apply to config dependencies pinned with `version+integrity`. `minimumReleaseAgeExcludePrune: true` (and `trustPolicyExcludePrune`, v12.4.0) drop stale exclude entries on install.

## Trust policy

Fail if a package's trust level **decreased** vs earlier releases (e.g. was published by a trusted publisher, now only has provenance or nothing).

```yaml title="pnpm-workspace.yaml"
trustPolicy: no-downgrade        # off (default) | no-downgrade
trustPolicyExclude:
  - 'chokidar@4.0.3'
trustPolicyIgnoreAfter: 525600   # ignore the check for pkgs published > N minutes ago
```

The check also covers the pnpm version pinned in `packageManager`/`devEngines.packageManager`.

## Block exotic transitive sources

```yaml title="pnpm-workspace.yaml"
blockExoticSubdeps: true   # default (on)
```

When `true`, only **direct** dependencies may use exotic sources (git repos, direct tarball URLs); all transitive deps must come from a trusted source (registry, local path, workspace link, or trusted GitHub repos).

## Lockfile integrity

Since v11, a downloaded tarball whose hash doesn't match `pnpm-lock.yaml` is a hard error (`ERR_PNPM_TARBALL_INTEGRITY`) — protecting committed lockfiles from a compromised registry/proxy. `--force` and `pnpm update` do **not** bypass it.

```bash
pnpm install --update-checksums   # narrow opt-in after verifying the new bytes
```

## Pin packages to their registry

If you install from more than one registry, use `namedRegistries` aliases for packages that must come from a specific one. pnpm records these under registry-qualified lockfile keys (`<name>@<registryName>:<version>`), so a package can't be silently substituted by another registry publishing the same name/version.

## Lockfile scanners: two-document lockfile

`pnpm-lock.yaml` may be a two-document file. A vulnerability scanner or SBOM generator that reads only the first document reports "no dependencies" (and no vulnerabilities) without failing — verify your tooling handles both documents.

## Trusted store/cache

The content-addressable store, global virtual store, and metadata cache are part of pnpm's trust domain. Share them only between mutually trusting users/jobs and protect with filesystem permissions. `verifyStoreIntegrity` (default `true`) detects accidental corruption but does not make a writable-by-untrusted store safe.

## Key Points

- Dependency build scripts are blocked until approved via `allowBuilds` / `pnpm approve-builds`; unreviewed builds fail by default (`strictDepBuilds`).
- `minimumReleaseAge` (default 1 day in v11) delays new releases; `trustPolicy: no-downgrade` blocks trust regressions; `blockExoticSubdeps` limits transitive git/tarball sources.
- Tarball integrity mismatches are fatal; use `--update-checksums` only after verification.
- Treat the store/cache as trusted shared state.

<!--
Source references:
- https://pnpm.io/settings/build#allowbuilds
- https://pnpm.io/cli/approve-builds
- https://pnpm.io/settings/dependency-resolution#minimumreleaseage
- https://pnpm.io/settings/dependency-resolution#trustpolicy
- https://pnpm.io/settings/dependency-resolution#blockexoticsubdeps
- https://pnpm.io/supply-chain-security
- https://pnpm.io/agent-skills
- https://pnpm.io/cli/permissions
- https://pnpm.io/settings/build#permissions
-->
