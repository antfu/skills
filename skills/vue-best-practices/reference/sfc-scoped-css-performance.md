---
title: Use Class Selectors in Scoped CSS for Performance
impact: MEDIUM
impactDescription: Element selectors in scoped CSS are slower because browsers must check both the element type and data attribute
type: efficiency
tags: [vue3, sfc, scoped-css, performance, css-selectors]
---

# Use Class Selectors in Scoped CSS for Performance

**Impact: MEDIUM** - When Vue compiles scoped CSS, it adds attribute selectors to every rule. Element selectors combined with attribute selectors (e.g., `p[data-v-xxx]`) are significantly slower for browsers to match than class selectors with attributes (e.g., `.text[data-v-xxx]`).

## Task Checklist

- [ ] Prefer class selectors over element selectors in scoped styles
- [ ] Avoid deeply nested element selectors in scoped CSS
- [ ] Use BEM or similar naming conventions to ensure unique class names
- [ ] For heavy styling, consider CSS modules or utility-first approaches

**Problematic Code:**
```vue
<template>
  <article>
    <header>
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </header>
    <section>
      <p>{{ content }}</p>
      <ul>
        <li v-for="item in items" :key="item">{{ item }}</li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
/* BAD: Element selectors are slower when scoped */
article {
  max-width: 800px;
}

header {
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
}

p {
  line-height: 1.6;
}

ul {
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.5rem;
}
</style>
```

**Correct Code:**
```vue
<template>
  <article class="article">
    <header class="article-header">
      <h1 class="article-title">{{ title }}</h1>
      <p class="article-subtitle">{{ subtitle }}</p>
    </header>
    <section class="article-content">
      <p class="article-text">{{ content }}</p>
      <ul class="article-list">
        <li v-for="item in items" :key="item" class="article-list-item">
          {{ item }}
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
/* GOOD: Class selectors are faster */
.article {
  max-width: 800px;
}

.article-header {
  margin-bottom: 2rem;
}

.article-title {
  font-size: 2rem;
}

.article-subtitle,
.article-text {
  line-height: 1.6;
}

.article-list {
  padding-left: 1.5rem;
}

.article-list-item {
  margin-bottom: 0.5rem;
}
</style>
```

## How Scoped CSS Compiles

Vue transforms scoped CSS by adding data attributes:

```css
/* What you write */
p { color: red; }
.text { color: blue; }

/* What Vue generates */
p[data-v-7ba5bd90] { color: red; }
.text[data-v-7ba5bd90] { color: blue; }
```

Browser CSS matching for `p[data-v-xxx]`:
1. Find all `<p>` elements (element lookup)
2. Check each for the `data-v-xxx` attribute (attribute check)

Browser CSS matching for `.text[data-v-xxx]`:
1. Find all elements with class `text` (class lookup - optimized)
2. Check each for the `data-v-xxx` attribute

Class lookups are highly optimized in modern browsers, making option 2 faster.

## When Performance Matters

This optimization matters most when:
- Rendering large lists (100+ items)
- Complex component trees
- Animation-heavy interfaces
- Mobile devices with limited CPU

```vue
<template>
  <!-- 1000 items - performance difference is noticeable -->
  <ul class="list">
    <li v-for="item in items" :key="item.id" class="list-item">
      <span class="item-name">{{ item.name }}</span>
      <span class="item-price">{{ item.price }}</span>
    </li>
  </ul>
</template>

<style scoped>
/* Fast selectors for large lists */
.list { ... }
.list-item { ... }
.item-name { ... }
.item-price { ... }
</style>
```

## Acceptable Element Selectors

For small components with few elements, element selectors are fine:

```vue
<template>
  <button class="btn">
    <span>{{ label }}</span>
  </button>
</template>

<style scoped>
/* OK for small, simple components */
.btn {
  padding: 0.5rem 1rem;
}

span {
  font-weight: bold;
}
</style>
```

## CSS Modules Alternative

For performance-critical components, CSS modules avoid the attribute selector entirely:

```vue
<template>
  <p :class="$style.text">Content</p>
</template>

<style module>
/* Generates unique class names without attribute selectors */
.text {
  color: red;
}
/* Compiles to something like: .text_abc123 { color: red; } */
</style>
```

## Reference
- [Vue Loader Scoped CSS](https://vue-loader.vuejs.org/guide/scoped-css.html#child-component-root-elements)
- [CSS Selector Performance](https://csswizardry.com/2011/09/writing-efficient-css-selectors/)
