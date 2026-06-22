---
name: advanced-pattern-vocabulary
description: A vocabulary of named UI patterns the agent should recognize and reach for when the design read calls for them. Names only, not implementations.
---

# Pattern Vocabulary

Know these names so you can reason about and reach for the right pattern. This is a vocabulary, not a component library. Reach for any of them only when the design read and dials justify it; most tooling UIs need almost none.

## Hero
- **Asymmetric split**: message on one side, asset on the other.
- **Editorial manifesto**: large type, no asset.
- **Media-mask**: type cut as a mask over video.
- **Scroll-pinned**: hero pins while content scrolls behind.

## Navigation and menus
- **Dock magnification**, **magnetic button**, **dynamic island** (morphing status pill), **mega-menu reveal**.

## Layout and grids
- **Bento grid** (asymmetric tiles), **masonry**, **split-screen scroll**, **sticky-stack sections**.

## Cards
- **Parallax tilt**, **spotlight border**, **glassmorphism panel**, **morphing modal** (button expands into its dialog).

## Scroll
- **Sticky scroll stack**, **horizontal scroll hijack**, **zoom parallax**, **scroll progress path**.

## Media
- **Coverflow carousel**, **drag-to-pan grid**, **hover image trail**, **accordion image slider**.

## Typography
- **Kinetic marquee**, **text-mask reveal**, **text scramble**, **gradient stroke**.

## Micro-interactions
- **Directional hover-aware button** (fill enters from the cursor side), **ripple click**, **skeleton shimmer**, **mesh-gradient background**, **lens-blur depth**.

## Animation library choice
- Default to a small motion library for UI state changes. Use a scroll library only for genuine scroll choreography, isolated in a dedicated leaf with cleanup. Do not mix two animation engines in one component tree; they fight over frames.

<!--
Source references:
- https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md
-->
