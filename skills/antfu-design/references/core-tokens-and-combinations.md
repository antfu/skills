---
name: core-tokens-and-combinations
description: Common semantic token families and class combinations for UnoCSS-based interfaces.
---

# Tokens and Combinations

## Common Token Families

| Family | Common Tokens | Purpose |
|-------|----------------|---------|
| Surface | `bg-base`, `bg-secondary`, `bg-active`, `bg-tooltip`, `bg-glass` | Main app surfaces, hover/selected state, overlays |
| Text | `color-base`, `color-active`, `op-fade`, `op-mute` | Readability hierarchy and active emphasis |
| Border | `border-base`, `border-active` | Structural and active outlines |
| Action | `btn-action`, `btn-action-sm`, `btn-action-icon` | Unified clickable controls |
| Scale | `color-scale-neutral/low/medium/high/critical` | Visual severity gradients |
| Layout | `h-nav`, `h-tabs`, `pad-safe`, `page-padding` | Stable shell geometry and responsive spacing |
| Depth | `z-*` named shortcuts | Explicit stack order without magic numbers |

## Reusable Shortcuts

```ts
shortcuts: [
  {
    'btn-action': 'inline-flex items-center gap-2 rounded border border-base px2 py1 op75 hover:op100 hover:bg-active disabled:pointer-events-none disabled:op30!',
    'btn-action-sm': 'btn-action text-sm',
    'btn-action-icon': 'inline-flex h-8 w-8 items-center justify-center rounded border border-base op75 hover:op100 hover:bg-active disabled:pointer-events-none disabled:op30!',
    'glass-panel': 'rounded-lg border border-base bg-glass shadow',
    'page-padding': 'pt-24 pl-112 pr-8 pb-8',
    'page-padding-collapsed': 'pt-24 pl-14 pr-8 pb-8',

    'op-fade': 'op65 dark:op55',
    'op-mute': 'op30 dark:op25',

    'color-scale-neutral': 'text-gray-700 dark:text-gray-300',
    'color-scale-low': 'text-lime-700 dark:text-lime-300',
    'color-scale-medium': 'text-amber-700 dark:text-amber-300',
    'color-scale-high': 'text-orange-700 dark:text-orange-300',
    'color-scale-critical': 'text-red-700 dark:text-red-300',
  },
  [/^badge-color-(\w+)$/, ([, color]) => `bg-${color}-400:20 dark:bg-${color}-400:10 text-${color}-700 dark:text-${color}-300 border-${color}-600:10 dark:border-${color}-300:10`],
  [/^bg-glass(:\d+)?$/, ([, opacity = ':75']) => `bg-white${opacity} dark:bg-#111${opacity} backdrop-blur-8`],
]
```

## Preferred Class Combinations

```html
<header class="h-10 flex items-center gap-2 px-3 border-b border-base bg-base">
  <button class="btn-action-icon" aria-label="Open drawer">
    <span class="i-ph-list-duotone text-sm"></span>
  </button>
  <span class="font-mono text-xs truncate">project-name</span>
</header>

<button class="btn-action-sm">
  <span class="i-ph-arrow-clockwise-duotone"></span>
  <span>refresh</span>
</button>

<span class="inline-flex items-center gap-1 px-1.5 py-px rounded text-micro font-mono bg-active border border-active color-active">
  open
</span>

<section class="glass-panel p-3">
  <p class="text-sm op-fade">Compact, readable overlay content</p>
</section>
```

## Layer Tokens Example

```ts
shortcuts: [
  {
    'z-flow-line': 'z--1',
    'z-graph-link': 'z-10',
    'z-graph-node': 'z-11',
    'z-top-nav': 'z-60',
    'z-panel-content': 'z-70',
    'z-drawer-backdrop': 'z-90',
    'z-drawer-content': 'z-100',
  },
]
```

## Mobile-Safe Shell Pattern

Use these tokens when building app-like shells with sticky nav, drawers, and nested scroll containers.

```ts
shortcuts: [
  {
    'h-nav': 'h-10',
    'h-tabs': 'h-8',
    'pad-safe': 'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]',
    'app-shell': 'w-screen h-screen flex flex-col of-hidden bg-base color-base font-sans',
    'scroll-touch': '[-webkit-overflow-scrolling:touch] [overscroll-behavior:contain]',
  },
]
```

```html
<div class="app-shell pad-safe">
  <header class="h-nav border-b border-base bg-base flex items-center gap-2 px-3">
    <button class="btn-action-icon" aria-label="Menu">
      <span class="i-ph-list-duotone"></span>
    </button>
    <span class="font-mono text-xs truncate">workspace-name</span>
  </header>

  <main class="flex-1 min-h-0 of-auto scroll-touch">
    <section class="page-padding">
      <p class="text-sm op-fade">content</p>
    </section>
  </main>
</div>
```

<!--
Source references:
- https://github.com/antfu/node-modules-inspector/blob/main/packages/node-modules-inspector/src/uno.config.ts
- https://github.com/vitejs/devtools/blob/main/packages/ui/src/unocss/shared-shortcuts.ts
- https://github.com/vitejs/devtools/blob/main/packages/ui/src/unocss/shortcuts.ts
- https://github.com/eslint/config-inspector/blob/main/uno.config.ts
- https://github.com/antfu/agent-container/blob/main/hub/uno.config.ts
-->
