---
name: features-micro-interactions
description: Small details that make interfaces feel polished. Concentric radius, optical alignment, borders vs shadows by context, staggered enters, subtle exits, tabular numbers, text wrapping, image outlines, tap scale, and hit areas, expressed as UnoCSS classes.
---

# Micro-Interaction Polish

Great interfaces are a stack of small details. These are framework-agnostic; the class names use UnoCSS, but the principles apply to any stack.

## Additive config

Add these when a project needs the polish layer. They are additive; do not force them onto dense devtools surfaces that intentionally stay flat.

```ts
export default defineConfig({
  theme: {
    boxShadow: {
      // Layered, background-tinted elevation for floating or marketing surfaces.
      card: '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px rgb(0 0 0 / 0.08)',
    },
  },
  shortcuts: [
    {
      // Subtle image edge. Pure black in light, pure white in dark, never a tinted neutral.
      'img-outline': 'outline outline-1 outline-black/10 dark:outline-white/10 outline-offset-[-1px]',
      // Tactile press feedback.
      'tap-scale': 'transition-transform active:scale-[0.96]',
    },
  ],
})
```

## Borders vs shadows (by context)

antfu tooling UIs are deliberately flat and border-driven. Marketing and floating surfaces read better with layered shadows.

- **Dense, devtools, structural**: keep `border-base` hairlines. Flat is correct here.
- **Elevated, floating, marketing cards**: use `shadow-card` (layered, transparent, background-tinted), not a hard 1px border. Shadows adapt to any background; solid borders do not.
- Never animate `box-shadow` for hover depth on large lists; swap opacity or use a pseudo-element.

## Concentric border radius

Outer radius = inner radius + padding. Mismatched nested radii is the most common reason a card feels off. A `rounded-2xl` card with `p-2` should hold a `rounded-lg` child, not another `rounded-2xl`.

## Optical over geometric alignment

When geometric centering looks off, align optically. Play triangles, single icons in round buttons, and asymmetric glyphs usually need a 1px nudge (`pl-px`) or a fix to the SVG viewBox.

## Animation

- **Interruptible state changes**: use CSS transitions for hover, active, and toggle so they can reverse mid-flight. Reserve keyframes for staged sequences that run once.
- **Never `transition: all`**: specify exact properties (`transition-property: opacity, transform`). UnoCSS `transition-transform` already covers transform, translate, scale, and rotate.
- **Split and stagger enters**: do not animate one container. Break content into chunks and stagger each by about 100ms (`animation-delay: calc(var(--i) * 100ms)` or a stagger in a motion library).
- **Subtle exits**: exit with a small fixed `translateY` and a fade, softer than the enter.
- **Skip animation on first load**: do not replay enter animations on initial render (in a motion library, the equivalent of `initial={false}`).
- **Icon swaps**: cross-fade with opacity, scale, and a little blur rather than toggling visibility. Values: scale `0.25` to `1`, opacity `0` to `1`, blur `4px` to `0`. With a motion library use a spring with `bounce: 0`; without one, keep both icons in the DOM (one absolutely positioned) and cross-fade with `cubic-bezier(0.2, 0, 0, 1)`.
- **Tap feedback**: `tap-scale` gives `scale(0.96)` on press. Never go below `0.95`; it looks exaggerated. Offer a way to disable it where motion would distract.
- Any motion beyond hover and active must honor `prefers-reduced-motion`.

## Text and numbers

- **Tabular numbers**: any dynamically updating number uses `tabular-nums` to prevent layout shift. antfu already pairs this with `font-mono` for technical values.
- **Heading wrap**: `text-balance` on headings. **Body wrap**: `text-pretty` to avoid orphans. These map to `text-wrap: balance` and `text-wrap: pretty`.
- **Font smoothing**: apply `antialiased` to the root on macOS for crisper text.

## Images

- Give photos a subtle `img-outline`. The outline color must be pure black in light mode and pure white in dark mode at low opacity, never a tinted neutral, which reads as dirt on the edge.

## Performance and hit area

- **`will-change` sparingly**: only on elements that actually animate, and only for `transform`, `opacity`, `filter`. Never `will-change: all`. Add it only when you see first-frame stutter.
- Animate only `transform` and `opacity` for movement. Never animate `top`, `left`, `width`, or `height`.
- **Minimum hit area**: interactive controls need at least 40x40px. Extend a small visible control with a pseudo-element. Do not let two hit areas overlap.

<!--
Source references:
- https://github.com/jakubkrehel/make-interfaces-feel-better/tree/main/skills/make-interfaces-feel-better
-->
