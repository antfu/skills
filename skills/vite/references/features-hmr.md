---
name: features-hmr
description: Vite's Hot Module Replacement (HMR) client API
---

# HMR API

The HMR API is exposed via `import.meta.hot`. Primarily for framework and tooling authors.

## Conditional Guard

Always guard HMR code for tree-shaking in production:

```ts
if (import.meta.hot) {
  // HMR code
}
```

## TypeScript Support

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

## Self-Accepting Module

Module handles its own updates:

```ts
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      console.log('updated: count is now', newModule.count)
    }
  })
}
```

## Accept Dependency Updates

React to changes in dependencies without self-reload:

```ts
import { foo } from './foo.js'

foo()

if (import.meta.hot) {
  // Single dependency
  import.meta.hot.accept('./foo.js', (newFoo) => {
    newFoo?.foo()
  })
  
  // Multiple dependencies
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFooModule, newBarModule]) => {
      // Handle updates
    }
  )
}
```

## Cleanup on Update

Clean up side effects before module is replaced:

```ts
function setupSideEffect() {
  const interval = setInterval(() => {}, 1000)
  return interval
}

const interval = setupSideEffect()

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    clearInterval(interval)
  })
}
```

## Prune Callback

Called when module is no longer imported:

```ts
if (import.meta.hot) {
  import.meta.hot.prune((data) => {
    // Cleanup when module is removed from page
  })
}
```

## Persistent Data

Pass data between module instances:

```ts
if (import.meta.hot) {
  // Mutate properties, don't reassign data itself
  import.meta.hot.data.count = (import.meta.hot.data.count || 0) + 1
}
```

## Invalidate

Force propagation to importers:

```ts
if (import.meta.hot) {
  import.meta.hot.accept((module) => {
    if (cannotHandleUpdate(module)) {
      import.meta.hot.invalidate()  // Propagate to importers
    }
  })
}
```

## HMR Events

Listen to built-in events:

```ts
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', (payload) => {
    console.log('Update incoming')
  })
  
  import.meta.hot.on('vite:afterUpdate', (payload) => {
    console.log('Update applied')
  })
  
  import.meta.hot.on('vite:beforeFullReload', () => {
    console.log('Full reload')
  })
  
  import.meta.hot.on('vite:error', (error) => {
    console.error('HMR error', error)
  })
  
  import.meta.hot.on('vite:ws:connect', () => {
    console.log('WebSocket connected')
  })
  
  import.meta.hot.on('vite:ws:disconnect', () => {
    console.log('WebSocket disconnected')
  })
}
```

## Custom Events

Send events to server:

```ts
// Client
if (import.meta.hot) {
  import.meta.hot.send('my:event', { msg: 'Hello from client' })
}
```

Receive from server:

```ts
// Client
if (import.meta.hot) {
  import.meta.hot.on('my:response', (data) => {
    console.log(data.msg)
  })
}
```

## TypeScript for Custom Events

```ts
// events.d.ts
import 'vite/types/customEvent.d.ts'

declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'my:event': { msg: string }
    'my:response': { msg: string }
  }
}
```

<!-- 
Source references:
- https://vite.dev/guide/api-hmr.html
-->
