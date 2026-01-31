---
title: Understand How v-if and v-for Create New VDOM Blocks
impact: LOW
impactDescription: Vue's block-based optimization means conditional and loop structures create separate optimization boundaries
type: concept
tags: [vue3, rendering, vdom, v-if, v-for, blocks, internals]
---

# Understand How v-if and v-for Create New VDOM Blocks

**Impact: LOW** - This is an informational concept about Vue internals. Understanding blocks helps you reason about rendering performance, but Vue handles this automatically.

Vue's compiler creates "blocks" - template sections with stable structure. Block boundaries are created at `v-if` and `v-for` directives, where the inner structure can vary at runtime.

## Key Concepts

### What is a Block?

A block is a template section that:
1. Has a stable internal structure (same element types, same nesting)
2. Tracks only its dynamic descendant nodes (not all descendants)
3. Creates a flattened array for efficient reconciliation

### Block Boundaries

New blocks are created at:
- **Root of each component template**
- **`v-if` / `v-else` / `v-else-if`** - different branches may have different structures
- **`v-for`** - each iteration may differ

```vue
<template>
  <!-- Root block starts here -->
  <div>
    <header>Static Header</header>  <!-- Hoisted, not tracked -->

    <p>{{ message }}</p>  <!-- Dynamic, tracked in root block -->

    <!-- v-if creates a nested block -->
    <section v-if="showDetails">
      <span>{{ detail1 }}</span>  <!-- Tracked in v-if block -->
      <span>{{ detail2 }}</span>  <!-- Tracked in v-if block -->
    </section>

    <!-- v-for creates blocks for each item -->
    <div v-for="item in items" :key="item.id">
      <span :class="item.type">{{ item.name }}</span>
    </div>

    <footer>Static Footer</footer>  <!-- Hoisted, not tracked -->
  </div>
</template>
```

### How Blocks Optimize Rendering

Without blocks (pure runtime diffing):
```
Re-render walks ENTIRE tree:
div
  header (check)
    "Static Header" (check)
  p (check)
    message (check)
  section (check)
    span (check)
    span (check)
  div*N (check each)
    span*N (check each)
  footer (check)
    "Static Footer" (check)
```

With blocks (Vue's approach):
```
Re-render only walks dynamic nodes:
Root block:
  - p with {{ message }}
  - v-if block reference
  - v-for block references

v-if block (only if visible):
  - span with {{ detail1 }}
  - span with {{ detail2 }}

Each v-for block:
  - span with :class and {{ item.name }}
```

## Why This Matters

1. **Static content is skipped**: Headers, footers, and unchanged elements are never traversed during updates

2. **Efficient list updates**: When a list item changes, Vue only diffs that item's block, not the entire list

3. **Branch switching is optimized**: When `v-if` toggles, Vue knows to replace the entire block rather than diffing incompatible structures

## Block Tracking Example

```vue
<template>
  <div>
    <!-- These static elements: hoisted once, never diffed -->
    <nav class="sidebar">Navigation</nav>

    <!-- This dynamic binding: tracked in root block -->
    <h1>{{ title }}</h1>

    <!-- v-for: each item is its own block -->
    <article v-for="post in posts" :key="post.id">
      <h2>{{ post.title }}</h2>  <!-- Tracked in item's block -->
      <p>{{ post.excerpt }}</p>   <!-- Tracked in item's block -->
    </article>

    <!-- v-if: separate block, only tracked when visible -->
    <aside v-if="showAside">
      <span>{{ asideContent }}</span>
    </aside>
  </div>
</template>
```

When `posts[2].title` changes:
- Vue finds the 3rd v-for block
- Diffs only that block's tracked dynamic nodes
- Skips all other posts, the nav, the aside

## You Don't Need to Do Anything

This optimization is automatic when using templates. Understanding blocks helps you:
- Reason about why updates are fast
- Understand Vue DevTools performance panel output
- Appreciate why templates are recommended over render functions

## Reference
- [Vue.js Rendering Mechanism - Tree Flattening](https://vuejs.org/guide/extras/rendering-mechanism.html#tree-flattening)
- [Vue.js Rendering Mechanism - Compiler-Informed Virtual DOM](https://vuejs.org/guide/extras/rendering-mechanism.html#compiler-informed-virtual-dom)
