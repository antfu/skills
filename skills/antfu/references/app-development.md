---
name: app-development
description: Vue/Nuxt/UnoCSS application conventions. Use when building web apps, choosing between Vite and Nuxt, or writing Vue components.
---

# App Development

## Framework Selection

| Use Case | Choice |
|----------|--------|
| SPA, client-only, library playgrounds | Vite + Vue |
| SSR, SSG, SEO-critical, file-based routing, API routes | Nuxt |

## Nuxt Conventions

### Disable Auto-imports (new projects)

Prefer explicit imports over auto-imports so every symbol is traceable. For new Nuxt projects, turn off both app-side (Nuxt) and server-side (Nitro) auto-imports in `nuxt.config.ts`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    autoImport: false, // disable composable/util auto-imports
  },
  components: {
    dirs: [], // disable component auto-imports
  },
  nitro: {
    imports: false, // disable server-side (Nitro) auto-imports
  },
})
```

Framework helpers stay available through the `#imports` alias — import them explicitly:

```ts
import { computed, ref } from '#imports'
```

| Option | Effect |
|--------|--------|
| `imports.autoImport: false` | Stops auto-importing `~/composables` and `~/utils` (and framework APIs like `ref`) |
| `components.dirs: []` | Stops auto-importing components from `~/components` |
| `nitro.imports: false` | Stops auto-importing in the server (`server/utils`, etc.) |

> Standalone Nitro projects already default to `imports: false` — leave server auto-imports off rather than enabling them.

### Path Aliases

Nuxt's built-in aliases (`~/`, `@/`, `#imports`) are already configured, so they're fine to use. Don't add custom path aliases for new code — prefer relative imports otherwise.

## Vue Conventions

| Convention | Preference |
|------------|------------|
| Script syntax | Always `<script setup lang="ts">` |
| State | Prefer `shallowRef()` over `ref()` |
| Objects | Use `ref()`, avoid `reactive()` |
| Styling | UnoCSS |
| Utilities | VueUse |

### Props and Emits

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

const props = withDefaults(defineProps<Props>(), {
  count: 0,
})

const emit = defineEmits<Emits>()
</script>
```

### Storybook for Components

Set up Storybook for component development. Expressing each state as a story keeps components side-effect-free and their states predictable.

Run the story tests in CI. Prefer the Vitest addon (`@storybook/addon-vitest`) so stories run as part of the existing `vitest` run (see [setting-up](setting-up.md)).
