---
name: antfu-design
description: UnoCSS-first design conventions distilled from Anthony Fu's devtools-style UIs. Use when building or refactoring interfaces with semantic tokens, dual light/dark themes, and stable class-based utility composition.
metadata:
  author: Anthony Fu
  version: "2026.06.22"
---

> Based on patterns from `node-modules-inspector`, `vite-devtools/packages/rolldown`, `eslint-config-inspector`, `vite-plugin-inspect`, and `agent-container/hub`.

This skill is framework-agnostic: React, Vue, Svelte, Solid, and plain HTML can use the same UnoCSS token system.

## Working Rules

- Use semantic shortcuts (`bg-base`, `border-base`, `color-active`) instead of repeating raw utility chains.
- Always design light and dark modes as one system, not a later patch.
- Name z-index layers (`z-top-nav`, `z-drawer-content`) and avoid magic numbers in templates.
- Prefer normal `class="..."` utilities; avoid Attributify syntax for generated code.
- Keep metadata compact: mono text, `tabular-nums`, subtle opacity, and icon + text pairs.

## References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Core Principles | Semantic tokens, dark mode parity, z-index naming, class-first output | [core-principles](references/core-principles.md) |
| Starter Kit | Copy-paste UnoCSS starter config + base styles for framework-agnostic apps | [core-starter-kit](references/core-starter-kit.md) |
| Strict Rules | High-signal do/don't checklist for stable agent-generated UI code | [best-practices-strict-rules](references/best-practices-strict-rules.md) |
| Class Utilities Over Attributify | Why to avoid Attributify for generated code and how to convert patterns | [best-practices-class-utilities-over-attributify](references/best-practices-class-utilities-over-attributify.md) |
| Tokens and Combos | Common token families, reusable class combinations, and mobile-safe shell tokens | [core-tokens-and-combinations](references/core-tokens-and-combinations.md) |
| Data Presentation | Preferred patterns for file paths, icons, time, date, numbers, badges, buttons | [features-data-presentation](references/features-data-presentation.md) |
| Floating Vue Overrides | Shared Floating Vue setup and popper style overrides | [features-floating-vue-overrides](references/features-floating-vue-overrides.md) |
