---
name: antfu-simplify
description: Simplify the changes of the current PR or working tree with an ablation study - remove each piece of the diff and keep only what is proven needed - so the result has just-right abstraction, minimal clean code, and stays robust and universal. Use when asked to simplify, slim down, clean up, or reduce the current changes or PR.
metadata:
  author: Anthony Fu
  version: "2026.10.31"
---

# Simplify Changes

Review the **current changes** (PR branch or working tree) and cut them down to the smallest correct diff, the way a skilled developer would. The method is an **ablation study**: remove each piece, check whether anything that matters breaks, and keep only what earns its place.

Goal: clean, minimal code with the **just-right abstraction**, that is also **robust** (handles real edge cases) and **universal** (solves the general case, not only the one that triggered the change).

## Hard Rules

- **Behavior stays the same.** Simplify only. Do not add features, change public APIs, or fix unrelated issues. Report unrelated findings instead.
- **Scope is the diff.** Only touch code the change introduced or modified, plus code that must change to remove it. Do not refactor the surrounding codebase.
- **Every removal is verified.** Run the repo's tests, typecheck, and lint after each batch. If a check has no coverage for the removed piece, reason about it explicitly or keep it.
- Match the surrounding code's style, naming, and comment density.

## Workflow

1. **Get the diff.** Pick the base: PR target branch merge base (`git merge-base HEAD origin/<default>`), else `git diff HEAD` for uncommitted work. Read the full diff and the files around it. Note the goal of the change in one sentence; it is the yardstick for everything below.
2. **Inventory the pieces.** List each unit the diff adds: function, parameter, option, branch, type, file, dependency, abstraction layer, comment, test. See [Ablation Study](#ablation-study).
3. **Ablate.** For each piece, try removing, inlining, or merging it. Decide keep or cut using [Keep vs Cut](#keep-vs-cut).
4. **Apply** the cuts in small steps. After each batch run focused checks (tests, typecheck, lint). Revert a cut that breaks behavior; that piece is now proven needed.
5. **Check the result.** Re-read the final diff as a reviewer. Is each remaining line explained by the one-sentence goal? Is it still robust and general?
6. **Report.** Show a short table of what was cut or kept and why, plus the diff size before and after (`git diff --stat`). Do not commit unless asked.

## Ablation Study

For every piece in the diff, ask: *if I delete this, what concretely breaks?*

| Piece | Ablation | Keep if |
|-------|----------|---------|
| New function / helper | Inline it at the call site | Called from 2+ places, or the name explains a non-obvious step |
| Wrapper / abstraction layer | Call the underlying thing directly | It hides real complexity or a likely-to-change boundary |
| Parameter / option / config | Hardcode the only used value | A real caller needs a different value now |
| Type / interface / generic | Use the inferred or existing type | It is exported, or inference gives a worse or wrong type |
| Branch / guard / try-catch | Delete it and run tests | It guards a reachable case (real input, real failure), not an impossible one |
| New file / module | Merge it into its only consumer | It has multiple consumers or a distinct responsibility |
| Dependency | Replace with a few lines or an existing dep | It handles hard edge cases you would otherwise get wrong |
| Duplicate logic | Reuse an existing util in the repo | No equivalent exists (search first) |
| Comment | Delete it | It explains *why* (constraint, workaround, surprising choice), not *what* |
| Test | Remove it and see what is unprotected | It covers behavior or a regression nothing else covers |
| Changed lines unrelated to the goal | Revert them | Never keep drive-by edits |

## Keep vs Cut

Cut when the piece is:

- Speculative: built for a future need nobody has (extra options, hooks, plugin points, "just in case" generics).
- Redundant: repeats what the language, framework, types, or an existing util already provides.
- Defensive against the impossible: null checks on values the types or callers guarantee, fallbacks that never run, catch blocks that swallow errors.
- Indirection without payoff: one-use helpers, pass-through wrappers, classes where a function works, factories that build one thing.
- Noise: commented-out code, narrating comments, unused imports and exports, formatting-only churn.

Keep (or even add) when the piece is:

- **Robustness:** handles real edge cases (empty input, concurrency, cleanup, cross-platform paths, error propagation with context).
- **Universality:** solves the general problem instead of special-casing the reported one. If the fix hardcodes a name, path, or value from the bug report, generalize it.
- **Right-sized abstraction:** the third repetition of something gets extracted; the first and second usually do not. A good abstraction removes more code than it adds.

If an abstraction is too small, merge; if a function does several unrelated things, split. The target is neither fewest lines nor most layers, it is the fewest concepts a reader must hold.

## Smells to Look For

- A fix that patches the symptom at the call site instead of the cause.
- Special cases (`if (name === 'foo')`) where a general rule would cover them.
- Two code paths that do the same thing with small differences; unify them.
- State, flags, or caches that can be derived from existing data.
- Long parameter lists or option bags where most values are never varied.
- Types duplicated by hand when they can be derived (`typeof`, `ReturnType`, `Parameters`, utility types).
- Hand-rolled utilities that the repo, runtime, or an existing dependency already has.
- Tests that assert implementation details or mirror the code line by line.

## Report Format

```md
| # | Piece | Action | Why |
|---|-------|--------|-----|
| 1 | `parseOptions()` in src/cli.ts | inlined | one caller, 3 lines |
| 2 | `retry` option | removed | no caller passes it; default is enough |
| 3 | `try/catch` in fetchData | kept | network errors reach users; test covers it |

Diff: +142 -8 -> +61 -8. Tests, typecheck, lint pass.
```

List anything noticed but out of scope (unrelated bugs, wider refactors) separately, and leave it alone.
