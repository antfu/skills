---
name: app-development
description: Vue/Nuxt/UnoCSS application conventions. Use when building web apps, choosing between Vite and Nuxt, writing Vue components, setting up Storybook component tests, or disabling Nuxt/Nitro auto-imports.
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

Set up Storybook for component development. Writing stories pushes components toward being **side-effect-free and state-predictable**: every meaningful state becomes an enumerable story driven only by `args`, with no hidden global dependencies.

- **One story per state**: default, loading, error, disabled, etc. — drive everything through `args`.
- **Keep components pure**: props in, events out. Push data fetching and side effects up to the parent/page layer so stories render deterministically.
- **Use the `play` function** for interaction tests (simulate user behaviour, then assert).

```ts
// Button.stories.ts — CSF, Vue + Vite framework
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Button from './Button.vue'

const meta = {
  title: 'Components/Button',
  component: Button,
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { label: 'Click me', variant: 'primary' },
}

export const Disabled: Story = {
  args: { label: 'Click me', disabled: true },
}
```

### Story Tests in CI

Use the **Vitest addon** (`@storybook/addon-vitest`) so stories run as Vitest browser tests. For Vite-powered frameworks (Vue/Nuxt) it supersedes the older Playwright-based test-runner and reuses the existing Vitest setup, so stories run through the same `vitest` command:

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/vue3-vite'

export default {
  framework: '@storybook/vue3-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-vitest'],
} satisfies StorybookConfig
```

Because the addon turns stories into Vitest tests, they are picked up by `nr test` and run automatically by the existing Unit Test workflow (see [setting-up](setting-up.md)) — no separate CI job is required. Render errors fail the test even for stories without a `play` function, so every story acts as a smoke test.
