---
name: library-development
description: Building and publishing TypeScript libraries with tsdown. Use when creating npm packages, configuring library bundling, or setting up package.json exports.
---

# Library Development

| Aspect | Choice |
|--------|--------|
| Bundler | tsdown |
| Output | Pure ESM only (no CJS) |
| DTS | Generated via tsdown |
| Exports | Auto-generated via tsdown |

## tsdown Configuration

Use tsdown with these options enabled:

```ts
// tsdown.config.ts
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  exports: true,
})
```

| Option | Value | Purpose |
|--------|-------|---------|
| `format` | `['esm']` | Pure ESM, no CommonJS |
| `dts` | `true` | Generate `.d.ts` files |
| `exports` | `true` | Auto-update `exports` field in `package.json` |

### Multiple Entry Points

```ts
export default defineConfig({
  entry: [
    'src/index.ts',
    'src/utils.ts',
  ],
  format: ['esm'],
  dts: true,
  exports: true,
})
```

The `exports: true` option auto-generates the `exports` field in `package.json` when running `tsdown`.

---

## API Stability

For published libraries, lock the public API surface so accidental breaking changes appear as a diff in code review.

| Tool | Purpose |
|------|---------|
| [`tsnapi`](https://github.com/antfu/tsnapi) | Snapshots runtime exports + type declarations into committed `.snapshot.js` / `.snapshot.d.ts` files |
| [`tsdown-stale-guard`](https://github.com/antfu-collective/tsdown-stale-guard) | Hashes build inputs/outputs so CI can prove the committed snapshots match current source |

Install both as dev dependencies and wire them as tsdown plugins:

```ts
// tsdown.config.ts
import { defineConfig } from 'tsdown'
import ApiSnapshot from 'tsnapi/rolldown'
import { StaleGuardRecorder } from 'tsdown-stale-guard'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  exports: true,
  plugins: [
    ApiSnapshot(),
    StaleGuardRecorder(),
  ],
})
```

### Updating snapshots

After an intentional API change, regenerate snapshots and commit them:

```bash
nr build              # runs tsdown, regenerates .snapshot.* files
# or, ad-hoc:
nlx tsnapi -u
UPDATE_SNAPSHOT=1 nlx tsnapi
```

### CI guard

`tsdown-stale-guard` ships a CLI that exits non-zero when the cached build hash no longer matches the source — run it before snapshot/test steps to guarantee the committed snapshots reflect current code:

```yaml
# .github/workflows/unit-test.yml (excerpt)
- run: nr build
- run: nlx tsdown-stale-guard   # fails CI if build is stale
- run: nr test
```

---

## package.json

Required fields for pure ESM library:

```json
{
  "type": "module",
  "main": "./dist/index.mjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
  "files": ["dist"],
  "scripts": {
    "build": "tsdown",
    "prepack": "pnpm build",
    "test": "vitest",
    "release": "bumpp -r"
  }
}
```

The `exports` field is managed by tsdown when `exports: true`.

### prepack Script

For each public package, add `"prepack": "pnpm build"` to `scripts`. This ensures the package is automatically built before publishing (e.g., when running `npm publish` or `pnpm publish`). This prevents accidentally publishing stale or missing build artifacts.
