---
name: best-practices-strict-rules
description: High-signal do/don't checklist for stable, class-based UnoCSS UI generation.
---

# Strict Rules

Use this as a hard checklist before returning UI code.

## Must Do

- Define semantic shortcuts first (`bg-base`, `border-base`, `color-base`, `color-active`, `btn-action`).
- Ensure core tokens work in both light and dark mode.
- Name depth layers (`z-top-nav`, `z-panel-content`, `z-drawer-content`) and use those names in markup.
- Generate class-based utilities only (`class="..."`).
- Keep icon/status class strings literal in code paths that may be tree-shaken (`// @unocss-include` when needed).
- Use `font-mono` + `tabular-nums` for technical values (counts, SHAs, timestamps, percentages).
- For truncated path/ID labels, keep full value in `title`.

## Must Not Do

- Do not use raw z-index numbers directly in component markup.
- Do not scatter raw color values in templates when a semantic token exists.
- Do not emit Attributify-style utility attributes in generated examples.
- Do not build icon class names via interpolation that UnoCSS cannot statically detect.
- Do not design only for one theme; avoid light-only or dark-only primitives.

## Return-Ready Snippet Pattern

```html
<div class="w-screen h-screen flex flex-col of-hidden bg-base color-base font-sans">
  <header class="h-nav shrink-0 flex items-center gap-2 px-3 border-b border-base bg-base z-top-nav">
    <button class="btn-action-icon" aria-label="Open menu">
      <span class="i-ph-list-duotone"></span>
    </button>
    <span class="font-mono text-xs truncate" title="workspace-name">workspace-name</span>
  </header>

  <main class="flex-1 min-h-0 of-auto">
    <div class="p-4 flex items-center gap-2">
      <span class="inline-flex items-center gap-1 px-1.5 py-px rounded border border-active bg-active color-active text-micro uppercase tracking-wide">
        active
      </span>
      <span class="text-micro font-mono tabular-nums op-fade">12,480</span>
    </div>
  </main>
</div>
```

## Preflight Checklist

- semantic shortcuts used in markup
- light/dark-safe base tokens present
- named z-layer shortcuts used
- class-only utilities (no Attributify)
- truncation + `title` for long paths/IDs
- technical values use mono/tabular treatment

<!--
Source references:
- https://github.com/antfu/node-modules-inspector/blob/main/packages/node-modules-inspector/src/uno.config.ts
- https://github.com/vitejs/devtools/blob/main/packages/ui/src/unocss/shared-shortcuts.ts
- https://github.com/vitejs/devtools/blob/main/packages/ui/src/unocss/shortcuts.ts
- https://github.com/eslint/config-inspector/blob/main/uno.config.ts
- https://github.com/antfu/vite-plugin-inspect/blob/main/uno.config.ts
- https://github.com/antfu/agent-container/blob/main/hub/uno.config.ts
- https://github.com/antfu/agent-container/blob/main/hub/app/state/status.ts
-->
