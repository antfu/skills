---
name: best-practices-anti-slop
description: Avoid the signatures that make generated interfaces look templated. Hard bans on em-dashes, generic names, fake-perfect numbers, filler verbs, fake screenshots, and decorative clutter.
---

# Anti-Slop Hygiene

These are the patterns LLMs reach for when trying to "look designed". Treat them as bans unless the brief explicitly asks for one.

## Dash ban (non-negotiable)

The em-dash character (Unicode U+2014) and the en-dash (U+2013) are the single biggest text tell. Do not emit either character anywhere visible: headlines, labels, body copy, quotes, attribution, captions, button text, alt text. The only permitted dash is the regular hyphen (`-`).

To replace a dash, restructure: use a period, a comma, parentheses, a colon, a line break, or a column. Ranges (`2018-2026`, `40-80k`) use a hyphen.

## Visual and CSS tells

- No neon or outer glows by default. Use inner borders or subtle tinted shadows.
- No pure black (`#000`) or pure white (`#fff`). Use off-black (`#111`, neutral-950) and off-white.
- No AI-purple or violet gradient as the reflex accent. Pick a neutral base plus one intentional accent.
- No oversaturated accents, no excessive gradient text on large headings.
- No custom mouse cursors.

## Content and data tells (the "Jane Doe" effect)

- No generic names ("John Doe", "Jane Doe"). Use realistic, locale-appropriate names.
- No fake-perfect numbers (`99.99%`, `50%`, `1234567`). Use organic values, or label mock data clearly. Do not fake engineering precision a product does not claim.
- No startup-slop brand names ("Acme", "Nexus", "SmartFlow"). Invent names that sound real and contextual.
- No filler verbs ("Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionize"). Use concrete verbs.
- No generic avatars (SVG "egg", default user glyphs). Use believable placeholders.

## Decoration tells

- No fake product UI built from `<div>` rectangles (fake terminals, dashboards, task lists). Use a real screenshot, a generated image, a real component preview, or nothing.
- No decorative status dots before every nav item, list row, or badge. A colored dot is allowed only for real semantic state, used sparingly.
- No scroll cues ("Scroll", "scroll to explore", animated wheels). The user already knows what scrolling is.
- No section-number eyebrows (`00 / INDEX`, `001 Capabilities`). Name the topic in plain language, or drop the label.
- No version stamps on marketing pages (`v1.4.2`, `Build 0048`, `last sync 4s ago`). These are devtool fixtures, not landing-page content.
- No locale, time, or weather strips ("Lisbon 14:23, 18C") unless the brief is genuinely place or timezone focused.
- Ration the middle dot (`·`): at most one per metadata line, never as the universal separator.

## Copy self-audit

Before shipping, re-read every visible string. Flag anything grammatically broken, with unclear referents, or that reads like the model trying to sound thoughtful (forced wordplay, mock-humble craftsman labels). Replace flagged strings with plain functional sentences. Boring but correct beats cute but wrong.

<!--
Source references:
- https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md
-->
