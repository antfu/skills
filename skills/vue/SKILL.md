---
name: vue
description: Vue.js - The Progressive JavaScript Framework for building user interfaces
metadata:
  author: Anthony Fu
  version: "2026.1.28"
  source: Generated from https://github.com/vuejs/docs, scripts located at https://github.com/antfu/skills
---

# Vue

Vue is a progressive JavaScript framework for building user interfaces. It builds on standard HTML, CSS, and JavaScript with intuitive API and world-class documentation. The Composition API with `<script setup>` and TypeScript is the recommended approach for building Vue applications.

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Reactivity System | ref, reactive, computed, watch, and watchEffect | [core-reactivity](references/core-reactivity.md) |

## Components

| Topic | Description | Reference |
|-------|-------------|-----------|
| Props | Declare and validate component props with TypeScript | [components-props](references/components-props.md) |
| Events (Emits) | Emit custom events from components | [components-emits](references/components-emits.md) |
| Slots | Pass template content to child components | [components-slots](references/components-slots.md) |
| v-model | Two-way binding on custom components | [components-v-model](references/components-v-model.md) |
| Lifecycle Hooks | Run code at specific component lifecycle stages | [components-lifecycle](references/components-lifecycle.md) |

## Features

### Script Setup & TypeScript

| Topic | Description | Reference |
|-------|-------------|-----------|
| Script Setup | Composition API syntactic sugar for SFCs | [features-script-setup](references/features-script-setup.md) |
| TypeScript | Type-safe Vue components with Composition API | [features-typescript](references/features-typescript.md) |

### Reusability

| Topic | Description | Reference |
|-------|-------------|-----------|
| Composables | Encapsulate and reuse stateful logic | [features-composables](references/features-composables.md) |
| Custom Directives | Low-level DOM manipulation directives | [features-directives](references/features-directives.md) |
| Template Refs | Direct DOM and component instance access | [features-template-refs](references/features-template-refs.md) |

## Advanced

| Topic | Description | Reference |
|-------|-------------|-----------|
| Provide/Inject | Dependency injection across component tree | [advanced-provide-inject](references/advanced-provide-inject.md) |
| Async & Suspense | Top-level await pitfalls, async components, Suspense | [advanced-async-suspense](references/advanced-async-suspense.md) |

## Key Recommendations

- **Use `<script setup lang="ts">`** for all components
- **Prefer `ref()` over `reactive()`** for declaring state
- **Use type-based prop declarations** with interfaces
- **Use `defineModel()`** for v-model (3.4+)
- **Destructure props reactively** (3.5+) for cleaner code
- **Extract composables** for reusable stateful logic
