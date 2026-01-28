---
name: features-workers
description: Web Worker support in Vite
---

# Web Workers

## Constructor Syntax (Recommended)

Standard Web Worker creation:

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

Module worker:

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module'
})
```

Shared Worker:

```ts
const sharedWorker = new SharedWorker(
  new URL('./shared-worker.js', import.meta.url)
)
```

**Note:** The `new URL()` must be used directly inside `new Worker()` for detection.

## Query Suffix Syntax

Import with `?worker` suffix:

```ts
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

Shared worker:

```ts
import MySharedWorker from './worker?sharedworker'

const worker = new MySharedWorker()
```

### Inline Worker

Inline as base64 string (no separate chunk):

```ts
import MyWorker from './worker?worker&inline'

const worker = new MyWorker()
```

### Worker URL Only

Get URL instead of constructor:

```ts
import workerUrl from './worker?worker&url'
```

## Worker Script

Workers can use ESM `import` statements:

```ts
// worker.js
import { heavyComputation } from './utils'

self.onmessage = (e) => {
  const result = heavyComputation(e.data)
  self.postMessage(result)
}
```

## Worker Options

Configure worker bundling:

```ts
// vite.config.ts
export default defineConfig({
  worker: {
    format: 'es',  // or 'iife'
    plugins: () => [/* worker-specific plugins */],
    rollupOptions: {
      // Rollup options for worker bundle
    }
  }
})
```

## WebAssembly in Workers

```ts
// worker.js
import init from './module.wasm?init'

init().then((instance) => {
  instance.exports.compute()
})
```

<!-- 
Source references:
- https://vite.dev/guide/features.html#web-workers
-->
