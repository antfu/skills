---
name: advanced-design-systems-map
description: Default to the antfu UnoCSS token system. Defer to an official design system only for enterprise, regulated, or platform-mandated surfaces. Be honest about aesthetics that have no official package.
---

# Design System Map

## Default

For most builds, the antfu UnoCSS token system (see core-starter-kit) is the right foundation: semantic shortcuts, dual light/dark, class-first. Do not hand-recreate another system's CSS, and do not import a system's tokens only to override most of them. One system per project.

## When to reach for an official system

Defer to the official package when the brief is one of these. Install the real package; do not fake its look.

| Brief reads as | Reach for |
|----------------|-----------|
| Microsoft or enterprise SaaS | `@fluentui/react-components` |
| Google or Material product | `@material/web` (Material 3) |
| IBM-style enterprise analytics | `@carbon/react` + `@carbon/styles` |
| Shopify app surfaces | Polaris (required for Shopify admin) |
| Atlassian or Jira-style product | `@atlaskit/*` |
| GitHub-style devtool or marketing | `@primer/css` or `@primer/react-brand` |
| UK public-sector service | `govuk-frontend` (expected) |
| US public-sector or trust-first | `uswds` |
| Accessible React foundation you theme | `@radix-ui/themes` |
| SaaS where you own the components | shadcn/ui (never ship default state) |

## Aesthetics are not systems

Glassmorphism, bento grids, brutalism, editorial, dark-tech, and aurora gradients have no official web package. Build them with native CSS plus the UnoCSS token system, and label borrowed inspiration honestly in comments. There is no official `liquid-glass.css`; web versions are `backdrop-filter` approximations and must provide a solid-fill fallback under `prefers-reduced-transparency`.

## Verify before importing

Before importing any third-party library, check `package.json`. If it is missing, output the install command first. Never assume a library exists.

<!--
Source references:
- https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md
-->
