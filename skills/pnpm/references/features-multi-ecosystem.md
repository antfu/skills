---
name: pnpm-multi-ecosystem
description: Install Python (pypi:) and Cargo (crate:) dependencies alongside npm packages in one pnpm install
---

# Multi-Ecosystem: Python & Cargo (v12.4.0+, experimental)

pnpm v12 can resolve and install Python and Rust/Cargo dependencies in the same `pnpm install` as npm packages. Both graphs share pnpm's connection budget, artifact verification, and content-addressable store; each keeps its own lockfile and requirement semantics. Settings and on-disk layout may still change.

## Python

Enable in `pnpm-workspace.yaml`:

```yaml title="pnpm-workspace.yaml"
python:
  enabled: true
```

pnpm reads `pyproject.toml`, writes `pylock.toml`, and builds a `.venv` per project (a symlink into `python-envs` in the store; swapped atomically). It never touches a hand-made `.venv`.

```sh
pnpm add pypi:httpx            # -> httpx==<latest> in pyproject.toml
pnpm add pypi:httpx@0.28.1     # exact pin
pnpm add pypi:'httpx>=0.28'    # PEP 508 spec kept as written
pnpm add -D pypi:pytest
```

- `pnpm run`/`pnpm exec` put `.venv/bin` (`.venv/Scripts` on Windows) on PATH, so scripts call `pytest`/`ruff` without activation.
- `--lockfile-only`, `--frozen-lockfile`, `--offline` apply.
- **Local/workspace deps:** declare in `[tool.uv.sources]` (`{ workspace = true }` or `{ path, editable }`); a project with `[build-system]` is installed editable.
- **Build backends need approval** under `allowBuilds` with Package URL keys: `'pkg:pypi/hatchling': true`.
- **Indexes** (v12.5.0+): declare via `registries` with `ecosystem: pypi` and route package names with `packages` patterns; `python.indexUrl` is no longer supported. Credentials go in `.npmrc`, matched by origin.
- **Multi-env locking:** `supportedArchitectures` + `python.versions: ['3.12','3.13']` locks wheels for each platform×interpreter.
- **Interpreter:** auto-selected to satisfy each `requires-python` (prefers `.python-version`); downloads a python-build-standalone build if none fits (`runtimeOnFail` controls). Set `python.executable` to force one.
- Key settings: `python.enabled`, `python.executable`, `python.extras`, `python.groups` (default `['dev']`), `python.versions`, `python.overrides`, `python.constraints`. Per-project overrides in `[tool.pnpm.python]`. `shared-environment = true` under `[tool.uv.workspace]` shares one `.venv` across uv-workspace members.

## Cargo

Enable in `pnpm-workspace.yaml`:

```yaml title="pnpm-workspace.yaml"
cargo:
  enabled: true
```

```sh
pnpm add crate:serde
pnpm add crate:serde@^1.0.200
```

- pnpm reads the workspace `Cargo.toml`, writes a deterministic `Cargo.lock`, verifies each `.crate` against its checksum, unpacks into the store, and links a Cargo [directory source] under `.pnpm/crates/crates-io`. It writes a source-replacement block into `.cargo/config.toml` between `# >>> pnpm-managed cargo sources >>>` markers (your content outside is untouched).
- `cargo build` then compiles **offline** against vendored sources; pnpm compiles nothing.
- Crates are recorded only in `Cargo.lock`, never `pnpm-lock.yaml`. `--lockfile-only`/`--frozen-lockfile`/`--offline` apply.
- **Registry:** declare a sparse index via `registries` with `ecosystem: cargo` (default crates.io); only one index per workspace. `cargo.indexUrl` is no longer supported. Auth reuses URL-scoped credentials plus `CARGO_REGISTRY_TOKEN`/`$CARGO_HOME/credentials.toml`.
- Git deps and `[patch]`/`[replace]` overrides are honored and vendored for offline builds; workspaces with overrides/git deps require the default crates.io index.
- Reuse Cargo build state across runs/worktrees with `pnpm pipeline` and `tasks.<name>.cargoTargetDir`.

## pnpr acceleration

With `pnprServer` set, the server resolves the Python/Cargo graph so pnpm needn't download wheels/index files to discover requirements; it falls back to local resolution when the server doesn't answer for that ecosystem.

<!--
Source references:
- https://pnpm.io/python
- https://pnpm.io/cargo
- https://pnpm.io/registries
-->
