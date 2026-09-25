---
name: vitest-configuration
description: Configure Vitest with vite.config.ts or vitest.config.ts
---

# Configuration

Vitest reads configuration from `vitest.config.ts` or `vite.config.ts`. It shares the same config format as Vite.

## Basic Setup

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // test options
  },
})
```

## Using with Existing Vite Config

Add Vitest types reference and use the `test` property:

```ts
// vite.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

## Merging Configs

If you have separate config files, use `mergeConfig`:

```ts
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
  },
}))
```

## Common Options

```ts
defineConfig({
  test: {
    // Enable global APIs (describe, it, expect) without imports
    globals: true,
    
    // Test environment: 'node', 'jsdom', 'happy-dom'
    environment: 'node',
    
    // Setup files to run before each test file
    setupFiles: ['./tests/setup.ts'],
    
    // Include patterns for test files
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    
    // Exclude patterns
    exclude: ['**/node_modules/**', '**/dist/**'],
    
    // Limit test discovery to a directory (faster than broad excludes)
    dir: './src',

    // Test timeout in ms
    testTimeout: 5000,
    
    // Hook timeout in ms
    hookTimeout: 10000,
    
    // Coverage configuration (v4+: define `include`, no more `all`)
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
    },
    
    // Run each file in an isolated module graph (threads/forks pools only)
    isolate: true,
    
    // Pool: 'forks' (default), 'threads', 'vmForks', 'vmThreads'
    pool: 'forks',
    
    // v4+: pool options are top-level (poolOptions was removed)
    maxWorkers: 4,
    fileParallelism: true,
    
    // Clear mock call history before each test (v5: defaults to true)
    clearMocks: true,
    
    // Restore spies created with vi.spyOn between tests
    restoreMocks: true,
    
    // Retry failed tests
    retry: 0,
    
    // Stop after first failure
    bail: 0,

    // v5: repeat every test N times regardless of result (flaky-hunting)
    repeats: 0,
  },
})
```

## v5 Performance Config

```ts
defineConfig({
  test: {
    // Persist transformed modules on disk, reused across reruns AND separate
    // processes (stable in v5; was experimental.fsModuleCache). Cache lives in
    // node_modules by default; clear with `vitest --clearCache`. Not for browser.
    fsModuleCache: true,

    // Inline projects that don't change the Vite config reuse the declaring
    // config's Vite server (default true) — shared files transformed once.
    // Set false if a plugin must be re-instantiated per project.
    sharedViteServer: true,

    // Inject CJS globals (module/exports/require/__filename/__dirname) into
    // every module (default true). Set false for stricter ESM-like scope.
    injectCjsGlobals: false,

    // Detect async resources leaking past a test file (slow; debugging only)
    detectAsyncLeaks: false,
  },
})
```

## v4/v5 Config Changes

- **v5 requires Vite >= 6.4.0 and Node >= 22.12.0.** `vite` is now a required peer dependency (Yarn users must `yarn add -D vite`).
- **`clearMocks` defaults to `true`** in v5 — `vi.clearAllMocks()` runs before every test (history cleared, implementations kept). Set `clearMocks: false` for the old behavior.
- **Inline projects inherit the root config by default** (`extends` defaults to `true`) — including Vite `plugins`/`resolve.alias`. Set `extends: false` to opt out. See [advanced-projects](advanced-projects.md).
- **`testNamePattern` (`-t`) matches the `>`-joined full name** (`'math > adds'`), not the space-joined Jest form.
- **`vi.mock`/`vi.unmock`/`vi.hoisted` must be at the top level** — nested calls now throw (they were only warned before).
- **Pool default is `forks`** (child processes), not `threads`.
- **`poolOptions` removed** — `maxThreads`/`maxForks` are now top-level `maxWorkers`; `singleThread`/`singleFork` become `maxWorkers: 1, isolate: false`; VM `memoryLimit` is `vmMemoryLimit`. `minWorkers` was removed.
- **`workspace` removed** — use [`projects`](advanced-projects.md). `vitest.workspace.ts` no longer supported.
- **`coverage.all` and `coverage.extensions` removed** — by default only covered files are reported; set `coverage.include` explicitly.
- **Simplified `exclude`** — only `node_modules`/`.git` excluded by default. Use `test.dir` to scope discovery, or spread `configDefaults.exclude`.
- **Config not looked up from parent dirs** — pass `--config` explicitly when running from a subdirectory.
- **`.vitest` artifact dir** — blob reports (`.vitest/blob/`), attachments (`.vitest/attachments/`), and the `html`/`json`/`junit` reporters now all live under a single `.vitest/` directory; add one entry to `.gitignore`.
- **`test.sequential`/`describe.sequential`/`sequential` removed** — use `{ concurrent: false }`.
- `deps.optimizer.web` renamed to `deps.optimizer.client`; `deps.inline`/`deps.external` moved under `server.deps`.

## Conditional Configuration

Use `mode` or `process.env.VITEST` for test-specific config:

```ts
export default defineConfig(({ mode }) => ({
  plugins: mode === 'test' ? [] : [myPlugin()],
  test: {
    // test options
  },
}))
```

## Projects (Monorepos)

Run different configurations in the same Vitest process:

```ts
defineConfig({
  test: {
    projects: [
      'packages/*',
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'jsdom',
        },
      },
    ],
  },
})
```

## Key Points

- Vitest uses Vite's transformation pipeline - same `resolve.alias`, plugins work
- `vitest.config.ts` takes priority over `vite.config.ts`
- Use `--config` flag to specify a custom config path (required from subdirectories in v5)
- `process.env.VITEST` is set to `true` when running tests
- Test config uses `test` property, rest is Vite config
- v5 requires **Vite >= 6.4.0** and **Node >= 22.12.0**; `vite` is a required peer dependency

<!-- 
Source references:
- https://vitest.dev/guide/#configuring-vitest
- https://vitest.dev/config/
-->
