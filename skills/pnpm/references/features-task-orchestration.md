---
name: pnpm-task-orchestration
description: Declare cross-project task graphs (tasks/dependsOn), concurrency groups, priorities, and run cached CI pipelines
---

# Workspace Task Orchestration

`pnpm -r run <script>` schedules a graph of workspace tasks. A task is `<project>#<script>`; it becomes ready once every task it depends on succeeds, and ready tasks run under `--workspace-concurrency`. Independent tasks run in unpredictable order.

## Declaring task dependencies

Configure under `tasks` in `pnpm-workspace.yaml`:

```yaml title="pnpm-workspace.yaml"
tasks:
  build:
    dependsOn:
      - ^build        # build in each workspace dependency
  test:
    dependsOn:
      - build         # build in the same project
```

- `build` → the `build` task in the same project.
- `^build` → the `build` task in each selected workspace dependency.
- A task with **no** `tasks` entry defaults to depending on the same task in its workspace deps (an unconfigured `build` behaves as `dependsOn: ['^build']`), preserving deps-before-dependents order.
- Once a task has an entry, an omitted `dependsOn` means `dependsOn: []`. If you set another field (e.g. `concurrency`) and still want topological order, declare `dependsOn: ['^build']` explicitly.
- Task deps stay within the `--filter`/`includeWorkspaceRoot` selection. A project missing the named script is a pass-through (reported skipped, doesn't break the chain).

## Per-task concurrency

```yaml title="pnpm-workspace.yaml"
tasks:
  build:
    concurrency: 2          # max 2 instances of build across projects
    dependsOn: ['^build']
```

Separate from `--workspace-concurrency`; a task waiting for its slot doesn't occupy a workspace slot.

## Concurrency groups (v12.5.0)

Machine-wide limits shared across pnpm processes that use the same `stateDir` (including `pnpm pipeline`):

```yaml title="pnpm-workspace.yaml"
tasks:
  test:rust:
    concurrencyGroup: cargo
    dependsOn: []
concurrencyGroups:
  cargo: 2                  # at most 2 cargo tasks at once, across processes
```

- A nested `pnpm run` in the same group reuses its parent's slot. Slots release on process exit/crash.
- A missing/zero group limit doesn't restrict. Changing `stateDir` creates a separate slot pool.

### Task priority (v12.6.0)

`priority` (integer, default `0`) orders waiting tasks for available slots — higher runs first, ties broken by arrival:

```yaml title="pnpm-workspace.yaml"
tasks:
  build:critical: { concurrencyGroup: build, priority: 10 }
  build:cleanup:  { concurrencyGroup: build, priority: -1 }
```

### Inspecting groups (v12.6.0)

```sh
pnpm tasks status [groups...]   # running + waiting tasks per group
pnpm pm tasks status            # force built-in if a "tasks" script shadows it
```

## Inspecting the graph

```sh
pnpm -r run --dry-run build         # stable topological ordering, no scripts run
pnpm -r run --dry-run --json test   # nodes + edges as JSON
```

## Recursive run options

- `--resume-from <pkg>` — resume at a package's task, skipping tasks a prior run of the same invocation recorded as passed.
- `--reverse` — reverse every edge (dependents run first).
- `--no-bail` — keep running independent ready tasks after a failure (default `--bail` cancels running tasks and stops dispatching).
- Output is inherited when only one script can run at a time; otherwise piped. Use `--stream` for immediate prefixed output or `--aggregate-output`.

## Cycles

A cycle fails before any script with `ERR_PNPM_TASK_CYCLE`. Set `ignoreWorkspaceCycles: true` only for deliberate cycles (pnpm warns and drops ordering among members).

## Commands that ignore `tasks`

`--no-sort` and `--parallel` (implies `--no-sort`) ignore `tasks` declarations. Recursive `exec` has no script name so it doesn't join `dependsOn`, but still uses dependency-aware scheduling and `--resume-from`.

## pnpm pipeline (v12.4.0, experimental)

Runs a named set of tasks the way a CI job would: frozen install, then the affected projects' task graph, with cached results restored.

```yaml title="pnpm-workspace.yaml"
tasks:
  build: { dependsOn: ['^build'], outputs: ['dist/**'], inputs: ['src/**'], env: ['NODE_ENV'] }
  test:  { dependsOn: ['build'], outputs: [] }
  lint:  { outputs: [] }
pipelines:
  default: [build, test, lint]
  release: [build]
```

```sh
pnpm pipeline           # runs the "default" pipeline
pnpm pipeline release
pnpm pipeline --dry-run --json
pnpm pipeline --full    # every project, not just affected-since-base
pnpm pipeline --base <ref>   # affected diff base (default origin/main, or pipelineBase)
pnpm pipeline --no-cache
```

- **Caching:** a task is cacheable only when it declares `outputs` (`outputs: []` = "produces no files", makes a linter/test cacheable). `inputs` narrows the cache key (`+glob` adds to the default); `env` names hashed vars; `cache: false` opts out. The key also covers script text, dependency task keys, the lockfile, and the runtime. A hit restores files and replays logs.
- A plain recursive `pnpm run` **never** restores from the pipeline cache; `outputs`/`inputs`/`env`/`cache`/`cargoTargetDir` are read by `pnpm pipeline` only.
- **Cargo build state:** `cargoTargetDir: target` keeps a task's Cargo target dir between runs/worktrees via immutable snapshots.

## Other dependency-aware commands

Workspace install, rebuild, pack, publish, stage, and lifecycle work start a project's work as soon as its workspace deps finish — following the package graph (not `tasks`), no longer waiting for unrelated topological groups.

<!--
Source references:
- https://pnpm.io/workspace-task-orchestration
- https://pnpm.io/cli/tasks
- https://pnpm.io/cli/pipeline
-->
