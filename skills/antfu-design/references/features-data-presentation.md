---
name: features-data-presentation
description: Preferred rendering patterns for file paths, file icons, relative time, date, numbers, badges, buttons, and icons.
---

# Data Presentation

## Preference Matrix

| Data | Preferred rendering | Class recipe |
|------|----------------------|-------------|
| File path | Mono, segmented emphasis, full value in tooltip | `font-mono truncate` + `title` + segment opacity (`op25/op50/op60`) |
| File icon | Name-first then extension mapping, stable literal classes | literal `i-*` class + semantic tint (`color-blue-500`, `op-fade`) |
| Time ago | Compact relative time in dense rows | `text-micro font-mono tabular-nums op-fade` |
| Date/time | Absolute date in tooltip/detail | `title`/tooltip + `toLocaleString()` |
| Number | Locale-formatted + tabular mono alignment | `text-micro font-mono tabular-nums` |
| Badge | Small semantic chip with low-alpha background | `inline-flex items-center gap-1 px-1.5 py-px rounded border border-emerald-500/40 bg-emerald-500/10 text-micro uppercase tracking-wide` |
| Button | Reuse semantic action shortcuts | `btn-action`, `btn-action-sm`, `btn-action-icon` |
| Icon | Icon + label pair for non-trivial actions | `inline-flex items-center gap-1` |

Use this matrix as default output behavior unless the host project already defines alternatives.

## File Path

- Use `font-mono` for technical identifiers and paths.
- Truncate in layout, but keep full value in `title`.
- Reduce separator and infrastructure segment emphasis (`./`, `/`, `node_modules`, `.pnpm`).

```html
<div class="flex items-center gap-2 min-w-0 text-sm font-mono">
  <span class="i-ph-file-ts-duotone color-blue-500 shrink-0"></span>
  <span class="truncate" title="/repo/node_modules/.pnpm/react@18.3.1/node_modules/react/index.js">
    <span class="op50">./</span>
    <span class="op60">node_modules/</span>
    <span class="op25">.pnpm/</span>
    <span class="color-active">react</span>
    <span class="op50">/index.js</span>
  </span>
</div>
```

## File Icon

- Map filename first (`dockerfile`, `.env`, `.gitignore`), then extension.
- Keep icon classes literal so UnoCSS can statically extract them.
- Return both icon and tint classes.

```ts
// @unocss-include
const byName = {
  'dockerfile': { icon: 'i-ph-file-cloud-duotone', color: 'color-sky-500' },
  '.env': { icon: 'i-ph-file-lock-duotone', color: 'color-amber-600 dark:color-amber-400' },
}

const byExt = {
  ts: { icon: 'i-ph-file-ts-duotone', color: 'color-blue-500' },
  js: { icon: 'i-ph-file-js-duotone', color: 'color-yellow-500' },
  vue: { icon: 'i-ph-file-vue-duotone', color: 'color-emerald-500' },
  md: { icon: 'i-ph-file-md-duotone', color: 'op-fade' },
}

export function fileIcon(path: string) {
  const base = (path.split('/').pop() || path).toLowerCase()
  const byFilename = byName[base as keyof typeof byName]
  if (byFilename)
    return byFilename

  const ext = base.includes('.') ? base.slice(base.lastIndexOf('.') + 1) : ''
  return byExt[ext as keyof typeof byExt] || { icon: 'i-ph-file-duotone', color: 'op-fade' }
}
```

## Time and Date

- Show compact relative age in dense lists (`45s`, `8m`, `3h`, `12d`, `2mo`, `1y`).
- Show absolute date/time on hover or detail rows.
- Use `tabular-nums font-mono` for changing numbers to avoid layout jitter.

```ts
export function formatAge(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo}mo`
  return `${Math.floor(d / 365)}y`
}

export const formatDateTime = (ts: number) => new Date(ts).toLocaleString()
```

```html
<time class="font-mono text-micro tabular-nums op-fade" title="2026-06-22 09:14:12">
  8m
</time>
```

## Number

- Use locale-aware formatting for counts and percentages.
- Use explicit currency formatting for money.
- Render dense metrics as mono + tabular.

```ts
const countLabel = count.toLocaleString()
const percentLabel = ratio.toLocaleString(undefined, {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const costLabel = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
}).format(cost)
```

```html
<span class="text-micro font-mono tabular-nums op-mute">12,480</span>
```

## Badges, Buttons, Icons

- Status badges: small, uppercase or mono, tinted border and text, low-alpha background.
- Buttons: unify around `btn-action*` shortcuts.
- Icons: pair icon + text, keep icon size near text size (`text-sm` or `text-[0.9em]`).

### Icon System Strategy

- Use one main icon family for controls and actions (for consistent stroke/weight).
- Use specialized file-type icon sets for path/file lists.
- Keep file icons tinted by category, but keep control icons mostly semantic (`color-active`, `op-fade`, status colors).

```ts
// Controls/actions
const controls = {
  refresh: 'i-ph-arrow-clockwise-duotone',
  close: 'i-ph-x',
  openExternal: 'i-octicon-link-external-16',
}

// File types
const fileTypes = {
  ts: 'i-ph-file-ts-duotone color-blue-500',
  js: 'i-ph-file-js-duotone color-yellow-500',
  md: 'i-ph-file-md-duotone op-fade',
}
```

```html
<span class="inline-flex items-center gap-1 px-1.5 py-px rounded border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 text-micro uppercase tracking-wide">
  <span class="i-octicon-check-circle-16 text-[0.9em]"></span>
  open
</span>

<button class="btn-action-sm">
  <span class="i-ph-arrow-clockwise-duotone"></span>
  refresh
</button>

<a class="btn-action-icon" href="#" aria-label="Open on GitHub">
  <span class="i-octicon-mark-github-16 text-sm"></span>
</a>
```

## Centralize Status Glyph Mapping

- Keep one source of truth for status icon, color, and label.
- Return literal class strings from mapping functions so UnoCSS can extract dynamic icon classes.
- Reuse mapping across list rows, headers, tabs, and tooltips.

```ts
// @unocss-include
type SessionStatus = 'thinking' | 'tool' | 'task' | 'questions' | 'error' | 'idle'

interface StatusGlyph {
  icon: string
  color: string
  label: string
}

export function sessionStatusGlyph(status: SessionStatus): StatusGlyph {
  switch (status) {
    case 'thinking':
      return { icon: 'i-ph-spinner-duotone animate-spin', color: 'color-amber-500', label: 'thinking' }
    case 'tool':
      return { icon: 'i-ph-gear-duotone animate-spin', color: 'color-orange-500', label: 'running a tool' }
    case 'error':
      return { icon: 'i-ph-warning-circle-duotone', color: 'color-red-500', label: 'error' }
    default:
      return { icon: 'i-ph-check-circle-duotone', color: 'color-emerald-500/70', label: 'idle' }
  }
}
```

<!--
Source references:
- https://github.com/vitejs/devtools/blob/main/packages/rolldown/src/app/components/display/HighlightedPath.ts
- https://github.com/vitejs/devtools/blob/main/packages/rolldown/src/app/components/display/ModuleId.vue
- https://github.com/vitejs/devtools/blob/main/packages/rolldown/src/app/utils/format.ts
- https://github.com/eslint/config-inspector/blob/main/app/components/FileItem.vue
- https://github.com/antfu/vite-plugin-inspect/blob/main/src/client/components/ModuleId.vue
- https://github.com/antfu/node-modules-inspector/blob/main/packages/node-modules-inspector/src/app/components/display/DateBadge.vue
- https://github.com/antfu/node-modules-inspector/blob/main/packages/node-modules-inspector/src/app/components/display/DurationBadge.vue
- https://github.com/antfu/node-modules-inspector/blob/main/packages/node-modules-inspector/src/app/components/display/NumberBadge.vue
- https://github.com/antfu/agent-container/blob/main/hub/app/components/FileView.vue
- https://github.com/antfu/agent-container/blob/main/hub/app/components/GitView.vue
- https://github.com/antfu/agent-container/blob/main/hub/app/components/native/ContextIndicator.vue
- https://github.com/antfu/agent-container/blob/main/hub/app/state/status.ts
-->
