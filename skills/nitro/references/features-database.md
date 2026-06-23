---
name: database
description: Built-in SQL database layer via db0, useDatabase, connectors, and dev overrides in Nitro
---

# Database

Nitro ships a lightweight SQL layer powered by [db0](https://db0.unjs.io). It defaults to SQLite (`.data/db.sqlite`) and works out of the box in dev and Node.js production. **Experimental** — enable the flag.

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  experimental: { database: true },
});
```

## Usage

`useDatabase()` (auto-imported when the flag is on, or import from `nitro/database`) returns a connection. Optional connection name defaults to `"default"`.

```ts [routes/users.ts]
import { defineHandler } from "nitro";
import { useDatabase } from "nitro/database";

export default defineHandler(async () => {
  const db = useDatabase();

  await db.sql`CREATE TABLE IF NOT EXISTS users (
    "id" TEXT PRIMARY KEY, "firstName" TEXT, "lastName" TEXT, "email" TEXT
  )`;

  const id = String(Math.round(Math.random() * 10_000));
  await db.sql`INSERT INTO users VALUES (${id}, 'John', 'Doe', '')`;

  const { rows } = await db.sql`SELECT * FROM users WHERE id = ${id}`;
  return { rows };
});
```

Connections are created lazily and cached per name.

### Query APIs

```ts
// Tagged template with safe parameter binding
const { rows } = await db.sql`SELECT * FROM users WHERE id = ${id}`;
const res = await db.sql`INSERT INTO posts (title) VALUES (${"Hello"})`;
// res.rows, res.changes, res.lastInsertRowid

// Raw string execution
await db.exec("CREATE TABLE IF NOT EXISTS t (id TEXT)");

// Prepared statement
const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
const result = await stmt.bind("1001").all();
```

> Always use `db.sql` tagged templates (or `prepare().bind()`) for user input — they parameterize and prevent SQL injection.

## Configuration

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  experimental: { database: true },
  database: {
    default: { connector: "sqlite", options: { name: "db" } },
    users: {
      connector: "postgresql",
      options: { url: "postgresql://user:pass@host:5432/db" },
    },
  },
  // Use a local SQLite db in development while prod uses Postgres
  devDatabase: {
    default: { connector: "sqlite", options: { name: "dev-db" } },
  },
});
```

Use a named connection with `useDatabase("users")`.

## Connectors

All [db0 connectors](https://db0.unjs.io/connectors) are supported, including: `sqlite` / `node-sqlite`, `better-sqlite3`, `bun-sqlite`, `libsql` (+ `libsql-http`/`libsql-web`), `postgresql`, `mysql2`, `pglite`, `planetscale`, `cloudflare-d1`, and Cloudflare Hyperdrive variants.

## Key Points

- Requires `experimental.database: true`; defaults to a zero-config SQLite connection.
- `useDatabase()` from `nitro/database` (auto-imported when enabled); names default to `"default"`.
- Prefer `db.sql` tagged templates for safe, parameterized queries.
- Use `devDatabase` to run a different (local) database in development.
- Integrates with db0-supported ORMs; prefer this layer over platform-specific DB bindings for portability.

<!--
Source references:
- https://nitro.build/docs/database
- https://db0.unjs.io
-->
