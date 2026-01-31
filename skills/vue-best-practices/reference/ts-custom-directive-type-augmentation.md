---
title: Type Custom Directives with Module Augmentation
impact: LOW
impactDescription: Without type augmentation, custom directives in templates lack TypeScript support
type: best-practice
tags: [vue3, typescript, directives, module-augmentation, ComponentCustomProperties]
---

# Type Custom Directives with Module Augmentation

**Impact: LOW** - To get TypeScript support for custom directives in templates, you must augment Vue's `ComponentCustomProperties` interface. Without this, TypeScript won't recognize your custom directives and won't provide type checking for their values.

## Task Checklist

- [ ] Create a type definition file for your directives
- [ ] Use `Directive<Element, Value>` for typing
- [ ] Augment `ComponentCustomProperties` with `v`-prefixed names
- [ ] Use `satisfies` keyword for type-safe directive definitions

## Basic Pattern

```typescript
// directives/highlight.ts
import type { Directive, DirectiveBinding } from 'vue'

// Define the directive's value type
export type HighlightValue = string | { color: string; intensity?: number }

// Create typed directive
export const vHighlight: Directive<HTMLElement, HighlightValue> = {
  mounted(el, binding) {
    const value = binding.value
    if (typeof value === 'string') {
      el.style.backgroundColor = value
    } else {
      el.style.backgroundColor = value.color
      el.style.opacity = String(value.intensity ?? 1)
    }
  },
  updated(el, binding) {
    // Same logic for updates
  }
}

// Type augmentation for template usage
declare module 'vue' {
  interface ComponentCustomProperties {
    vHighlight: typeof vHighlight  // Use 'v' prefix!
  }
}
```

## Using satisfies for Type Safety

```typescript
// directives/focus.ts
import type { Directive } from 'vue'

// The directive value is boolean: auto-focus if true
export type FocusValue = boolean

export const vFocus = {
  mounted(el, binding) {
    if (binding.value) {
      el.focus()
    }
  },
  updated(el, binding) {
    if (binding.value && !binding.oldValue) {
      el.focus()
    }
  }
} satisfies Directive<HTMLInputElement, FocusValue>

declare module 'vue' {
  interface ComponentCustomProperties {
    vFocus: Directive<HTMLInputElement, FocusValue>
  }
}
```

## Complete Example with Modifiers

```typescript
// directives/tooltip.ts
import type { Directive, DirectiveBinding } from 'vue'

export interface TooltipValue {
  text: string
  delay?: number
}

export interface TooltipModifiers {
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}

// Type the full binding
type TooltipBinding = DirectiveBinding<TooltipValue, TooltipModifiers>

export const vTooltip: Directive<HTMLElement, TooltipValue> = {
  mounted(el: HTMLElement, binding: TooltipBinding) {
    const { value, modifiers } = binding

    let position: string = 'bottom'
    if (modifiers.top) position = 'top'
    else if (modifiers.left) position = 'left'
    else if (modifiers.right) position = 'right'

    el.setAttribute('data-tooltip', value.text)
    el.setAttribute('data-tooltip-position', position)
    el.setAttribute('data-tooltip-delay', String(value.delay ?? 300))
  },

  updated(el, binding) {
    el.setAttribute('data-tooltip', binding.value.text)
  },

  unmounted(el) {
    // Cleanup
    el.removeAttribute('data-tooltip')
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    vTooltip: typeof vTooltip
  }
}
```

## Registration and Usage

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { vHighlight } from './directives/highlight'
import { vFocus } from './directives/focus'
import { vTooltip } from './directives/tooltip'

const app = createApp(App)

// Register globally
app.directive('highlight', vHighlight)
app.directive('focus', vFocus)
app.directive('tooltip', vTooltip)

app.mount('#app')
```

```vue
<!-- Component.vue -->
<template>
  <!-- TypeScript validates the value type -->
  <div v-highlight="'yellow'">Highlighted text</div>
  <div v-highlight="{ color: 'blue', intensity: 0.5 }">Complex highlight</div>

  <input v-focus="shouldFocus" />

  <button v-tooltip="{ text: 'Click me', delay: 500 }">
    Hover for tooltip
  </button>

  <!-- With modifiers -->
  <span v-tooltip.top="{ text: 'Above' }">Top tooltip</span>
</template>
```

## Organizing Type Declarations

For projects with many directives, create a dedicated types file:

```
src/
├── directives/
│   ├── index.ts           # Re-exports all directives
│   ├── highlight.ts       # Directive implementation
│   ├── focus.ts
│   └── tooltip.ts
├── types/
│   └── directives.d.ts    # Centralized type augmentation
```

```typescript
// types/directives.d.ts
import type { Directive } from 'vue'
import type { HighlightValue } from '@/directives/highlight'
import type { FocusValue } from '@/directives/focus'
import type { TooltipValue } from '@/directives/tooltip'

declare module 'vue' {
  interface ComponentCustomProperties {
    vHighlight: Directive<HTMLElement, HighlightValue>
    vFocus: Directive<HTMLInputElement, FocusValue>
    vTooltip: Directive<HTMLElement, TooltipValue>
  }
}
```

## Ensure tsconfig.json Includes Types

```json
{
  "compilerOptions": {
    // ...
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "src/types/**/*.d.ts"
  ]
}
```

## Function Shorthand Directives

For simple directives that only need `mounted` and `updated`:

```typescript
// directives/color.ts
import type { Directive } from 'vue'

// Function shorthand - runs on mounted AND updated
export const vColor: Directive<HTMLElement, string> = (el, binding) => {
  el.style.color = binding.value
}

declare module 'vue' {
  interface ComponentCustomProperties {
    vColor: typeof vColor
  }
}
```

## Local Registration with TypeScript

For directives registered only in specific components:

```vue
<script setup lang="ts">
import type { Directive } from 'vue'

// Local directive with inline type
const vLocalHighlight: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    el.style.backgroundColor = binding.value
  }
}
</script>

<template>
  <!-- Works without global type augmentation -->
  <div v-local-highlight="'yellow'">Local highlight</div>
</template>
```

Note: Local directives don't need module augmentation since TypeScript can infer the type from the local variable.

## Reference
- [Vue.js Custom Directives](https://vuejs.org/guide/reusability/custom-directives.html)
- [Vue.js TypeScript - Augmenting Global Properties](https://vuejs.org/guide/typescript/options-api.html#augmenting-global-properties)
