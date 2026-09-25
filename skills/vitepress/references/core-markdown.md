---
name: vitepress-markdown
description: Markdown extensions including frontmatter, custom containers, tables, anchors, and file includes
---

# Markdown Extensions

VitePress extends standard markdown with additional features for documentation.

## Frontmatter

YAML metadata at the top of markdown files:

```md
---
title: Page Title
description: Page description for SEO
layout: doc
outline: [2, 3]
---

# Content starts here
```

Access frontmatter in templates:

```md
# {{ $frontmatter.title }}
```

Or in script:

```vue
<script setup>
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>
```

## Custom Containers

Styled callout blocks:

```md
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details Click to expand
Hidden content here.
:::
```

Custom titles:

```md
::: danger STOP
Do not proceed!
:::

::: details Click me {open}
Open by default with {open} attribute.
:::
```

The `no-title` attribute renders a container without a title element (no effect
on `details`):

```md
::: tip {no-title}
Just want to try it out? Skip to the Quickstart.
:::
```

### Registering New Containers (v2)

Map new container names to their default titles in config; they behave like the
built-in ones (custom titles, attributes, GitHub-alert syntax):

```ts
// config.ts
export default {
  markdown: {
    container: {
      customContainers: { success: 'SUCCESS' }
    }
  }
}
```

New containers ship unstyled — add CSS using the container name as the class:

```css
.custom-block.success {
  border-color: transparent;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-success-soft);
}
```

### Nesting Containers

`:::` markers follow the same rule as code fences: a fence is closed only by a
matching fence at least as long. Make the outer fence longer to nest:

```md
:::: info Outer container
This box contains another container.

::: details Inner container
Nested content
:::
::::
```

## GitHub-flavored Alerts

Alternative syntax using blockquotes:

```md
> [!NOTE]
> Highlights information users should know.

> [!TIP]
> Optional information for success.

> [!WARNING]
> Critical content requiring attention.

> [!CAUTION]
> Negative potential consequences.
```

Text after the marker becomes the alert title: `> [!NOTE] Custom Title`.
Containers you registered yourself work here too. `[!DANGER]` is a VitePress
extension (renders as a plain blockquote on GitHub). By default alert colors
match GitHub's (caution and danger both red); enable
`themeConfig.gradedContainers` for a graded scale (danger red, warning orange,
caution yellow).

## Header Anchors

Headers get automatic anchor links. Custom anchors:

```md
# My Heading {#custom-anchor}

[Link to heading](#custom-anchor)
```

## Table of Contents

Generate a TOC with:

```md
[[toc]]
```

## GitHub-Style Tables

```md
| Feature | Status |
|---------|--------|
| SSR     | ✅     |
| HMR     | ✅     |
```

## Task Lists

```md
- [ ] Write the press release
- [x] Update the website
```

## Footnotes

```md
Footnotes are supported[^1], including inline ones^[This is an inline footnote.].

[^1]: Definitions can contain **markdown** and render at the end of the page.
```

## Emoji

Use shortcodes:

```md
:tada: :rocket: :100:
```

## File Includes

Include content from other files:

```md
<!--@include: ./shared/header.md-->
```

With line ranges:

```md
<!--@include: ./code.md{3,10}-->  <!-- Lines 3-10 -->
<!--@include: ./code.md{3,}-->   <!-- From line 3 -->
<!--@include: ./code.md{,10}-->  <!-- Up to line 10 -->
```

With regions:

```md
<!-- In parts/basics.md -->
<!-- #region usage -->
Usage content here
<!-- #endregion usage -->

<!-- Include just that region -->
<!--@include: ./parts/basics.md#usage-->
```

Header anchors work too: `<!--@include: ./parts/basics.md#my-heading-->`.
Including a missing file/region/anchor or out-of-range lines throws a build error;
set `markdown.include.silent: true` to warn and skip. Relative links/images in an
included file resolve from the included file's location (disable via
`markdown.include.rebaseRelativeUrls: false`). To show the directive literally in
docs (e.g. inside a fence), escape it as `@@include`.

## Code Snippet Import

Import code from files:

```md
<<< @/snippets/example.js
```

With line highlighting:

```md
<<< @/snippets/example.js{2,4-6}
```

With language override:

```md
<<< @/snippets/example.cs{1,2 c#:line-numbers}
```

Import specific region:

```md
<<< @/snippets/example.js#regionName{1,2}
```

Multiple regions with the same name are concatenated (across comment styles too).
Importing a missing file/region throws a build error — set
`markdown.snippet.silent: true` to render nothing instead. Extra tokens after the
language are passed as attributes, e.g. `{ts twoslash}` enables twoslash.

## Code Groups

Tab groups for code variants:

````md
::: code-group

```js [config.js]
export default { /* ... */ }
```

```ts [config.ts]
export default defineConfig({ /* ... */ })
```

:::
````

Import files in code groups:

```md
::: code-group

<<< @/snippets/config.js
<<< @/snippets/config.ts

:::
```

## Math Equations

Requires setup:

```bash
npm add -D markdown-it-mathjax3@^4
```

```ts
// .vitepress/config.ts
export default {
  markdown: {
    math: true
  }
}
```

Then use LaTeX:

```md
Inline: $E = mc^2$

Block:
$$
\frac{-b \pm \sqrt{b^2-4ac}}{2a}
$$
```

## Image Lazy Loading

```ts
export default {
  markdown: {
    image: {
      lazyLoad: true // Renamed from `lazyLoading` in v2
    }
  }
}
```

## Raw Container

Prevent VitePress style conflicts:

```md
::: raw
<CustomComponent />
:::
```

## Key Points

- Frontmatter supports YAML or JSON format
- Custom containers support info, tip, warning, danger, details; register more via `markdown.container.customContainers` (v2)
- Task lists and footnotes are supported
- `[[toc]]` generates table of contents
- `@` in imports refers to source root (or `srcDir` if configured)
- Code groups create tabbed code blocks
- Math support requires markdown-it-mathjax3 package
- v2: `image.lazyLoading` renamed to `image.lazyLoad`; anchor uses `@mdit/plugin-anchor`, attrs uses `@mdit/plugin-attrs`
- Include/snippet failures throw build errors by default (`markdown.include.silent` / `markdown.snippet.silent` to soften)

<!--
Source references:
- https://vitepress.dev/guide/markdown
- https://vitepress.dev/guide/frontmatter
-->
