---
name: unocss-safelist-blocklist
description: Force include or exclude specific utilities
---

# Safelist and Blocklist

Control which utilities are always included or excluded.

## Safelist

Utilities always included, regardless of detection:

```ts
export default defineConfig({
  safelist: [
    'p-1', 'p-2', 'p-3',
    // Dynamic generation
    ...Array.from({ length: 4 }, (_, i) => `p-${i + 1}`),
  ],
})
```

### Function Form

```ts
safelist: [
  'p-1',
  () => ['m-1', 'm-2'],
  (context) => {
    const colors = Object.keys(context.theme.colors || {})
    return colors.map(c => `bg-${c}-500`)
  },
]
```

### Common Use Cases

```ts
safelist: [
  // Dynamic colors from CMS
  () => ['primary', 'secondary'].flatMap(c => [
    `bg-${c}`, `text-${c}`, `border-${c}`,
  ]),
  
  // Component variants
  () => {
    const variants = ['primary', 'danger']
    const sizes = ['sm', 'md', 'lg']
    return variants.flatMap(v => sizes.map(s => `btn-${v}-${s}`))
  },
]
```

## Blocklist

Utilities never generated. Beyond excluding false positives, the blocklist enforces a single canonical syntax across a codebase (e.g. block `border` and `border-1` so everyone writes `b`), keeping CSS output minimal. Combine with `@unocss/eslint-plugin` to surface the block messages during development — without it, blocked utilities are silently dropped.

### Matcher Types

Three matcher types, each optionally wrapped in a `[matcher, meta]` tuple:

```ts
type BlocklistValue = string | RegExp | ((selector: string) => boolean | null | undefined)
type BlocklistRule = BlocklistValue | [BlocklistValue, BlocklistMeta]

interface BlocklistMeta {
  message?: string | ((selector: string) => string)
}
```

```ts
blocklist: [
  'p-1',                       // string: exact match
  /^p-[2-4]$/,                 // RegExp: pattern match (.test())
  s => s.endsWith('px'),       // function: returns truthy to block
]
```

### Messages

A `message` (static or callback receiving the matched selector) explains why a utility is blocked:

```ts
blocklist: [
  [/^border$/, { message: 'use shorter "b"' }],
  // dynamic message from the blocked selector
  [/^border(?:-[btrlxy])?$/, {
    message: v => `use shorter "${v.replace(/^border/, 'b')}"`,
  }],
]
```

With `@unocss/eslint-plugin` this appears as `"border" is in blocklist: use shorter "b"`.

### Variant Awareness

The blocklist checks selectors **before and after variant stripping** — blocking `p-1` also blocks `hover:p-1`, `md:p-1`, `dark:p-1`. Don't account for variant prefixes in patterns.

### Merging

Blocklist arrays from all presets and user config are **merged** (accumulate, never override). A utility blocked by any source stays blocked.

### Common Patterns

```ts
blocklist: [
  // enforce shorter aliases
  [/^flex-grow$/, { message: 'use shorter "grow"' }],

  // restrict to design system tokens via negative lookahead
  // (\$ allows CSS var references like font-$myVar to pass)
  [new RegExp(`^font-(?!(?:${Object.keys(theme.fontFamily).join('|')}|\\$)$).+$`), {
    message: 'use design system font families',
  }],

  // force separate utilities over slash opacity (better reuse, smaller bundle)
  [/^(c|bg)-.+\/\d+$/, { message: 'use "bg-red bg-op-50" instead of slash notation' }],

  // decompose shorthands: "size-4" → "w-4 h-4"
  [/^size-(.+)$/, {
    message: v => `use "w-${v.match(/^size-(.+)$/)?.[1]} h-${v.match(/^size-(.+)$/)?.[1]}"`,
  }],
]
```

## Safelist vs Blocklist

| Feature | Safelist | Blocklist |
|---------|----------|-----------|
| Purpose | Always include | Always exclude |
| Strings | ✅ | ✅ |
| Regex | ❌ | ✅ |
| Functions | ✅ | ✅ (returns truthy to block) |
| Messages | ❌ | ✅ |

**Note:** Blocklist wins if utility is in both.

## Best Practice

Prefer static mappings over safelist:

```ts
// Better: UnoCSS extracts automatically
const sizes = {
  sm: 'text-sm p-2',
  md: 'text-base p-4',
}

// Avoid: Large safelist
safelist: ['text-sm', 'text-base', 'p-2', 'p-4']
```

<!-- 
Source references:
- https://unocss.dev/config/safelist
- https://unocss.dev/guide/extracting
-->
