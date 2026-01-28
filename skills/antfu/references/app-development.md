---
name: app-development
description: Anthony Fu's preferences for building web applications with Vue, Vite/Nuxt, and UnoCSS
---

# App Development Preferences

Preferences for building web applications.

## Stack Overview

| Aspect | Choice |
|--------|--------|
| Framework | Vue 3 (Composition API) |
| Build Tool | Vite (SPA) or Nuxt (SSR/SSG) |
| Styling | UnoCSS |
| Utilities | VueUse |

---

## Framework Selection

| Use Case | Choice |
|----------|--------|
| SPA, client-only, library playgrounds | Vite + Vue |
| SSR, SSG, SEO-critical, file-based routing, API routes | Nuxt |

---

## Vue Conventions

| Convention | Preference |
|------------|------------|
| Script syntax | Always `<script setup lang="ts">` |
| State | Prefer `shallowRef()` over `ref()` |
| Objects | Use `ref()`, avoid `reactive()` |

### Props and Emits

Use TypeScript interfaces:

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

interface Emits {
  (e: 'update', value: number): void
  (e: 'close'): void
}

const {
  count = 0
} = defineProps<Props>()

const emit = defineEmits<Emits>()
</script>
```
