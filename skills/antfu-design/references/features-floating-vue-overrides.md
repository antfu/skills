---
name: features-floating-vue-overrides
description: Floating Vue setup and style overrides aligned with UnoCSS semantic tokens.
---

# Floating Vue Overrides

Use this when a Vue app uses `floating-vue`. For non-Vue tooltip libraries, apply the same semantic tokens to popover containers and arrows.

## Runtime Setup

```ts
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

app.use(FloatingVue, {
  overflowPadding: 20,
})
```

## Shared Popper Styling

```css
.v-popper--theme-dropdown .v-popper__inner,
.v-popper--theme-tooltip .v-popper__inner {
  @apply bg-tooltip color-base font-sans rounded border border-base shadow dark:shadow-2xl;
  box-shadow: 0 6px 30px #0000001a;
}

.v-popper--theme-tooltip .v-popper__inner {
  @apply text-sm;
}

.v-popper--theme-tooltip {
  max-width: 20rem;
}

.v-popper--theme-tooltip .v-popper__arrow-inner,
.v-popper--theme-dropdown .v-popper__arrow-inner {
  visibility: visible;
  @apply border-white dark:border-#111;
}

.v-popper--theme-tooltip .v-popper__arrow-outer,
.v-popper--theme-dropdown .v-popper__arrow-outer {
  @apply border-base;
}

.v-popper--theme-tooltip.v-popper--shown,
.v-popper--theme-tooltip.v-popper--shown * {
  transition: none !important;
}
```

## Token Contract for Any Popover Library

- `bg-tooltip`: translucent light/dark surface + backdrop blur.
- `border-base`: low-contrast border that works in both themes.
- `color-base`: readable foreground for both themes.
- keep no-op transitions for tooltips to avoid jitter in dense UIs.

If your library supports custom class names, apply these tokens directly:

```html
<div class="bg-tooltip color-base border border-base rounded shadow text-sm">
  tooltip content
</div>
```

<!--
Source references:
- https://github.com/antfu/node-modules-inspector/blob/main/packages/node-modules-inspector/src/app/plugins/floating-vue.ts
- https://github.com/antfu/node-modules-inspector/blob/main/packages/node-modules-inspector/src/app/styles/global.css
- https://github.com/vitejs/devtools/blob/main/packages/rolldown/src/app/plugins/floating-vue.ts
- https://github.com/vitejs/devtools/blob/main/packages/rolldown/src/app/styles/global.css
- https://github.com/eslint/config-inspector/blob/main/app/plugins/floating-vue.ts
- https://github.com/eslint/config-inspector/blob/main/app/styles/global.css
- https://github.com/antfu/vite-plugin-inspect/blob/main/src/client/styles/main.css
- https://github.com/antfu/agent-container/blob/main/hub/app/plugins/floating-vue.client.ts
- https://github.com/antfu/agent-container/blob/main/hub/app/styles.css
-->
