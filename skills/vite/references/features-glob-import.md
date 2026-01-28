---
name: features-glob-import
description: Vite's import.meta.glob for batch importing modules and dynamic imports
---

# Glob Import

## Basic Usage

Import multiple modules using glob patterns:

```ts
const modules = import.meta.glob('./dir/*.js')
// Transformed to:
// {
//   './dir/foo.js': () => import('./dir/foo.js'),
//   './dir/bar.js': () => import('./dir/bar.js'),
// }
```

Iterate and load:

```ts
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

## Eager Loading

Load all modules immediately (no dynamic import):

```ts
const modules = import.meta.glob('./dir/*.js', { eager: true })
// Transformed to:
// import * as __glob_0 from './dir/foo.js'
// import * as __glob_1 from './dir/bar.js'
// const modules = {
//   './dir/foo.js': __glob_0,
//   './dir/bar.js': __glob_1,
// }
```

## Multiple Patterns

```ts
const modules = import.meta.glob([
  './dir/*.js',
  './another/*.js'
])
```

## Negative Patterns

Exclude files with `!` prefix:

```ts
const modules = import.meta.glob([
  './dir/*.js',
  '!**/bar.js'  // Exclude bar.js
])
```

## Named Imports

Import specific exports for tree-shaking:

```ts
const modules = import.meta.glob('./dir/*.js', {
  import: 'setup'
})
// './dir/foo.js': () => import('./dir/foo.js').then(m => m.setup)
```

Import default export:

```ts
const modules = import.meta.glob('./dir/*.js', {
  import: 'default',
  eager: true
})
```

## Custom Queries

Import as raw strings or URLs:

```ts
const moduleStrings = import.meta.glob('./dir/*.svg', {
  query: '?raw',
  import: 'default'
})

const moduleUrls = import.meta.glob('./dir/*.svg', {
  query: '?url',
  import: 'default'
})
```

Custom queries for plugins:

```ts
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true }
})
```

## Base Path

Change the base path for imports:

```ts
const modules = import.meta.glob('./**/*.js', {
  base: './base'
})
// Keys: './dir/foo.js'
// Imports: './base/dir/foo.js'
```

## Important Caveats

1. **Vite-only feature** - Not a web standard
2. **Patterns must be literals** - Cannot use variables
3. **Relative or absolute** - Must start with `./`, `/`, or use an alias
4. **Glob matching** - Uses [tinyglobby](https://github.com/SuperchupuDev/tinyglobby)

## Dynamic Import with Variables

Limited dynamic import support:

```ts
const module = await import(`./dir/${file}.js`)
```

**Rules:**
- Must start with `./` or `../`
- Must end with file extension
- Variable represents only one level (no `foo/bar`)
- Own directory needs filename pattern: `./prefix-${foo}.js` not `./${foo}.js`

## Practical Example: Loading Route Components

```ts
// Lazy load all page components
const pages = import.meta.glob('./pages/*.vue')

const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages\/(.*)\.vue$/)[1]
  return {
    path: `/${name.toLowerCase()}`,
    component: pages[path]  // Lazy loaded
  }
})
```

<!-- 
Source references:
- https://vite.dev/guide/features.html#glob-import
-->
