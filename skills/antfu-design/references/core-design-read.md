---
name: core-design-read
description: Read the brief before building. Infer page kind, audience, and vibe, declare a one-line design read, then set three dials (variance, motion, density) using the Tooling baseline or the Marketing baseline.
---

# Design Read and Dials

Before writing any markup, infer what the interface actually needs. Most weak output comes from jumping to a default look instead of reading the brief.

## 1. Read the Brief

Infer these signals first:

- **Kind**: tooling/devtools panel, dashboard, app shell, landing page, portfolio, docs, or marketing section.
- **Audience**: maintainers and power users (dense, keyboard-first) vs. first-time visitors (guided, spacious). The audience picks the aesthetic, not your taste.
- **Vibe words** the user used: "minimal", "Linear-style", "playful", "premium", "brutalist", "editorial", "dark tech".
- **References**: linked URLs, screenshots, named products or competitors.
- **Existing brand assets**: logo, colors, type, photography. For redesigns these are starting material, not optional input (see advanced-redesign-protocol).
- **Hard constraints**: accessibility-first, regulated, public-sector, trust-first. These override aesthetic preference.

## 2. Declare the Design Read

Before generating, state one line:

> Reading this as: `<kind>` for `<audience>`, with a `<vibe>` language, leaning toward `<token system or aesthetic family>`.

Examples:

- Reading this as: devtools inspector panel for maintainers, with a dense flat language, leaning toward the antfu UnoCSS token system.
- Reading this as: SaaS landing for technical buyers, with a calm minimal language, leaning toward UnoCSS utilities plus restrained motion.

If the brief is genuinely ambiguous, ask exactly one clarifying question. If you can infer confidently, do not ask. Just declare the read and proceed.

## 3. Set Three Dials

Tune every layout, motion, and density choice against three dials (1 to 10):

- **VARIANCE**: 1 = perfectly symmetric, 10 = asymmetric and artsy.
- **MOTION**: 1 = static, 10 = cinematic and physics-driven.
- **DENSITY**: 1 = airy gallery, 10 = packed cockpit.

### Two baselines

| Baseline | VARIANCE | MOTION | DENSITY |
|----------|----------|--------|---------|
| Tooling | 2 to 3 | 2 to 3 | 7 to 9 |
| Marketing | 7 to 8 | 5 to 7 | 3 to 4 |

- **Tooling** (the antfu default): devtools, dashboards, app shells. Information-dense and quiet: tight spacing, mono numbers, minimal motion.
- **Marketing**: landing pages, portfolios, product pages. They breathe and move.

Override either baseline only when the design read calls for it.

### What the dials drive

- **VARIANCE** 1 to 3: symmetric grids, equal padding. 4 to 7: offset headers, varied aspect ratios. 8 to 10: asymmetric grids, large empty zones. Above `md`, high-variance layouts must collapse to a single column on small screens.
- **MOTION** 1 to 3: hover and active states only. 4 to 7: fluid CSS transitions on transform and opacity. 8 to 10: scroll-driven reveals (see features-micro-interactions for the rules). Any motion above 3 must honor `prefers-reduced-motion`.
- **DENSITY** 1 to 3: large section gaps. 4 to 7: standard app spacing. 8 to 10: tight padding, hairline separators, mono for all numbers.

<!--
Source references:
- https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md
- https://github.com/antfu/node-modules-inspector
-->
