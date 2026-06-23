---
name: core-principles
description: Framework-agnostic UnoCSS design principles with semantic shortcuts, dark mode parity, named depth layers, and class-based utility generation.
---

# Core Principles

## Semantic First

- Define visual meaning once in `shortcuts` and reuse it everywhere.
- Keep app code semantic (`bg-base`, `border-base`, `btn-action`) instead of raw color values.
- Treat tokens as API surface: rename rarely, extend intentionally.
- Shortcuts are names, not utilities: you cannot apply modifiers to them. `border-base/60` is invalid, since a shortcut does not accept an opacity suffix. When you need a new variation, define a new token (for example `border-base-strong`) instead of modifying an existing one.

## Extracted Design Philosophy

- Build neutral foundations first (`bg-base`, `color-base`, `border-base`), then layer accents.
- Keep information density high but readable: compact spacing, micro text tiers, and clear opacity hierarchy.
- Use `font-mono` selectively for technical metadata (paths, SHAs, counters, timestamps), not body text.
- Prefer icon + label pairs over icon-only controls unless the action is universally obvious.
- Use deterministic color mapping for unbounded labels (cluster names, plugin names, tags) to preserve recognition.
- Self-host fonts (or load locally at build time) when possible; avoid runtime font CDN dependency.

## Light and Dark Together

- Every core token must define both light and dark behavior.
- Build neutral primitives (`bg-base`, `bg-secondary`, `border-base`, `color-base`) before feature colors.
- Add accent tokens (`color-active`, `border-active`, status colors) on top of neutral primitives.

## Name Depth Layers

- Never drop raw z-index values in templates.
- Define layer names in `shortcuts` (`z-top-nav`, `z-panel-content`, `z-drawer-content`).
- Keep one place where stack order is reasoned about.

## Framework-Agnostic Class Composition

- Store shared class combinations as string constants (or utility functions) and reuse them across frameworks.
- Keep the same class token language in React, Vue, Svelte, and plain HTML.

```ts
export const ui = {
  panel: 'bg-base color-base border border-base rounded-lg',
  button: 'btn-action-sm',
  dimText: 'op-fade text-mini',
}
```

```tsx
// React
export function Toolbar() {
  return (
    <div className={`h-10 flex items-center gap-2 px-3 border-b border-base ${ui.panel}`}>
      <button className={ui.button}>Refresh</button>
    </div>
  )
}
```

```svelte
<!-- Svelte -->
<div class={`h-10 flex items-center gap-2 px-3 border-b border-base ${ui.panel}`}>
  <button class={ui.button}>Refresh</button>
</div>
```

## Class-Based Output, Not Attributify

- Prefer normal utility classes for generated code.
- Avoid Attributify-style attributes for agent output because class strings are easier to generate and refactor safely.
- If a legacy codebase already uses Attributify, keep compatibility, but still generate new code with `class="..."`.

```html
<button class="btn-action text-sm">Refresh</button>
```

## Baseline UnoCSS Config

```ts
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import {
  defineConfig,
  presetIcons,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  theme: {
    colors: {
      primary: {
        300: '#7CBC71',
        400: '#49833E',
        600: '#396831',
        DEFAULT: '#49833E',
      },
    },
    fontSize: {
      micro: ['0.625rem', '0.875rem'],
      mini: ['0.6875rem', '1rem'],
      compact: ['0.8125rem', '1.125rem'],
    },
  },
  shortcuts: [
    {
      'color-base': 'color-neutral-800 dark:color-neutral-200',
      'bg-base': 'bg-white dark:bg-#111',
      'bg-secondary': 'bg-#eee dark:bg-#222',
      'border-base': 'border-#8882',

      'bg-active': 'bg-#8881',
      'color-active': 'color-primary-600 dark:color-primary-300',
      'border-active': 'border-primary-600/25 dark:border-primary-400/25',

      'z-graph-link': 'z-10',
      'z-top-nav': 'z-60',
      'z-drawer-backdrop': 'z-90',
      'z-drawer-content': 'z-100',
    },
    [/^bg-glass(:\d+)?$/, ([, opacity = ':75']) => `bg-white${opacity} dark:bg-#111${opacity} backdrop-blur-8`],
  ],
  presets: [
    presetWind4(),
    presetIcons({ scale: 1.2 }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans:200,400,700',
        mono: 'DM Mono:400,500',
      },
      processors: createLocalFontProcessor({
        fontAssetsDir: './public/assets/fonts',
        fontServeBaseUrl: '/assets/fonts',
      }),
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
```

<!--
Source references:
- https://github.com/antfu/node-modules-inspector/blob/main/packages/node-modules-inspector/src/uno.config.ts
- https://github.com/vitejs/devtools/blob/main/packages/ui/src/unocss/shared-shortcuts.ts
- https://github.com/vitejs/devtools/blob/main/packages/ui/src/unocss/shortcuts.ts
- https://github.com/eslint/config-inspector/blob/main/uno.config.ts
- https://github.com/antfu/vite-plugin-inspect/blob/main/uno.config.ts
- https://github.com/antfu/agent-container/blob/main/hub/uno.config.ts
-->
