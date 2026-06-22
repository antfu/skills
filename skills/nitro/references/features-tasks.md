---
name: tasks
description: On-demand and scheduled (cron) tasks in Nitro, defineTask, runTask, and platform support
---

# Tasks

Tasks are one-off runtime operations (migrations, cleanups, cache refresh). **Experimental** — enable the flag first.

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  experimental: { tasks: true },
});
```

## Defining tasks

Files in `tasks/[name].ts`. Nested dirs join with `:` (e.g. `tasks/db/migrate.ts` → `db:migrate`). `defineTask` is auto-imported.

```ts [tasks/db/migrate.ts]
export default defineTask({
  meta: {
    name: "db:migrate",
    description: "Run database migrations",
  },
  run({ payload, context }) {
    console.log("Running DB migration...");
    return { result: "Success" };
  },
});
```

`run` receives a `TaskEvent` with `name`, `payload` (`Record<string, unknown>`), and `context` (may include `waitUntil`). Return `{ result }`.

Tasks can also be registered in config (config `handler` wins over a scanned file of the same name):

```ts [nitro.config.ts]
export default defineConfig({
  experimental: { tasks: true },
  tasks: {
    "db:migrate": { handler: "./tasks/custom-migrate.ts", description: "Migrations" },
  },
});
```

## Scheduled tasks (cron)

Map cron expressions to task name(s). Multiple tasks under one expression run in parallel; scheduled runs get a `payload.scheduledTime` timestamp.

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  scheduledTasks: {
    "* * * * *": ["cms:update"],        // every minute
    "0 0 * * *": "db:cleanup",          // daily (string shorthand)
    "*/5 * * * *": ["health:check", "metrics:collect"],
  },
});
```

Platform support:
- `dev`, `node_server`, `node_cluster`, `node_middleware`, `bun`, `deno_server` → [croner](https://croner.56k.guru/) engine.
- `cloudflare_module` / `cloudflare_pages` → native Cron Triggers (wrangler config auto-generated).
- `vercel` → native Cron Jobs (config auto-generated; secure with `CRON_SECRET`).

## Running tasks programmatically

```ts [api/migrate.post.ts]
import { defineHandler } from "nitro";
import { runTask } from "nitro/task";

export default defineHandler(async (event) => {
  // IMPORTANT: authenticate and validate before running!
  const payload = Object.fromEntries(event.url.searchParams);
  const { result } = await runTask("db:migrate", { payload });
  return { result };
});
```

`runTask` throws a `404` if the task doesn't exist, `501` if it has no handler; errors from `run` propagate to the caller.

## Background work with `waitUntil`

```ts [tasks/sync.ts]
export default defineTask({
  run({ context }) {
    const promise = fetch("https://api.example.com/sync");
    context.waitUntil?.(promise);
    return promise.then(() => ({ result: "ok" }));
  },
});
```

## Dev server tools

While `nitro dev` runs:
- `GET /_nitro/tasks` — list available tasks + scheduled tasks.
- `GET|POST /_nitro/tasks/:name` — execute (payload from query and/or JSON body under `"payload"`).
- CLI: `nitro task list` and `nitro task run db:migrate --payload "{}"`.

## Key Points

- Requires `experimental.tasks: true`; `defineTask` is auto-imported, `runTask` comes from `nitro/task`.
- Each task has one running instance — parallel calls of the same name share a single run/result.
- `scheduledTasks` cron config is translated to native triggers on Cloudflare and Vercel automatically.

<!--
Source references:
- https://nitro.build/docs/tasks
-->
