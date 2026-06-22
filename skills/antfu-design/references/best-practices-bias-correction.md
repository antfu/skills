---
name: best-practices-bias-correction
description: Counter the default cliches in typography, color, layout, and materiality. One accent color, intentional type, diversified layouts, and restrained elevation.
---

# Bias Correction

LLMs default to cliches. Override them deliberately based on the design read.

## Typography

- **Headlines**: control hierarchy with weight and color, not raw scale. Avoid oversized H1s that only shout.
- **Body**: keep measure readable (`max-w-[65ch]`), relaxed leading, muted color (`op-fade`).
- **Sans choice**: avoid Inter as a reflex default. The antfu default of `DM Sans` (with `DM Mono` for technical values) already satisfies this; pick a brand-appropriate face otherwise.
- **Serif discipline**: serif is not the default for "creative" or "premium". Use serif only when the brand names one, or the aesthetic is genuinely editorial, luxury, or publication and you can say why. Do not reach for Fraunces or Instrument Serif as the default display serif.
- **Emphasis**: emphasize a word with italic or bold of the same family. Do not splice a serif word into a sans headline.
- **Mono**: reserve `font-mono` plus `tabular-nums` for technical metadata (paths, SHAs, counters, timestamps, percentages), not body text.

## Color

- One accent color per project. Keep saturation moderate (under roughly 80%) unless the brand is loud.
- Neutral base (`bg-base`, `color-base`, `border-base`) first, then one intentional accent (`color-active`). The antfu green primary is one such accent; swap it, do not multiply it.
- No AI-purple glow as the reflex accent. If the brand is purple, embrace it with intent.
- **Color consistency lock**: once an accent is chosen, use it across the whole page. A warm-grey page does not grow a blue CTA in section 7.
- Keep one neutral temperature (warm or cool grey), not both.

## Layout diversification

- **Anti-center bias**: when `VARIANCE > 4`, avoid the centered-hero-over-dark-gradient default. Reach for split, left-aligned-with-asset, or asymmetric whitespace.
- Centered layouts are fine for editorial or manifesto messages where the words are the design.
- Vary section layout families: do not repeat the same three-equal-cards or left-image/right-text block down the whole page.
- Use CSS Grid for column layouts, not flexbox percentage math (`grid grid-cols-1 md:grid-cols-3 gap-6`).

## Materiality and elevation

- Use cards only when elevation communicates real hierarchy. Otherwise group with `border-t`, dividers, or whitespace. (See features-micro-interactions for borders vs shadows by context.)
- Tint shadows toward the background hue. No pure-black drop shadows on light surfaces.
- **Shape consistency lock**: pick one corner-radius scale and keep it. If buttons are pill and cards are `rounded-lg`, document the rule and follow it everywhere.
- At high density, drop card containers entirely: separate data with hairlines and spacing.

<!--
Source references:
- https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md
-->
