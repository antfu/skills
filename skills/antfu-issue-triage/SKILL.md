---
name: antfu-issue-triage
description: Triage open issues and PRs of the current GitHub repo - find already-fixed, duplicate, and spam items, suggest labels, gauge demand from reactions and comments, then present a table of proposed actions and comments for confirmation before touching anything. Use when asked to triage, organize, clean up, or groom issues and PRs.
metadata:
  author: Anthony Fu
  version: "2026.10.23"
---

# Issue Triage

Go through the open issues and PRs of the **current repo** (`gh repo view --json nameWithOwner`) and propose clean-up actions. Maintainers decide; the agent investigates.

## Hard Rules

- **Read-only until confirmed.** Never comment, label, close, or edit before the user approves the action tables. Reads (`gh issue view`, `gh api` GET, `gh search`) are fine.
- **Every comment says it is automated by an agent.** End with a separate last line (blank line before it): `🤖 *Automated by an agent.*`
- **Comments are short and plain.** Write them in simple English (use the `simple-english` skill if available): 1-3 short sentences, active voice, no jargon, no filler. Write each comment fresh for the item. Do not reuse a fixed template. Always include the link (PR, commit, release, or canonical issue) that justifies the action.
- Only apply approved rows. If the user edits or drops rows, follow their edits exactly.
- Be conservative: when unsure, propose `keep open` (with labels if useful) instead of closing. Do not close items with active maintainer discussion, an open linked PR, or a milestone unless the user asks.
- Use plain hyphens; no em or en dashes.

## Workflow

1. **Scope.** Confirm the repo and range (default: all open items; for large repos ask for a limit, label, or age filter). Fetch in bulk:
   ```bash
   gh issue list --state open --limit 200 --json number,title,body,author,labels,createdAt,updatedAt,comments,reactionGroups,url,milestone
   gh pr list --state open --limit 200 --json number,title,body,author,labels,isDraft,reviewDecision,closingIssuesReferences,url,reactionGroups
   gh label list --limit 200 --json name,description
   ```
2. **Learn the labels.** Read every label name and description. Only apply labels that exist. New labels (including `spam` if missing) go in the Labels table and are created only after approval. Check how maintainers labeled similar items (`gh issue list --state all --label <l>`). Compare the repo's labels with the Recommended Labels section below and note useful ones that are missing.
3. **Map references.** Collect cross-references from bodies, comments, and the timeline (`gh api repos/{owner}/{repo}/issues/{n}/timeline --paginate`): `#123`, URLs, `closes/fixes`, linked PRs, cross-repo links. Treat linked items as one cluster. Do not close an issue whose fix PR is still open. Do not mark linked items as duplicates of each other.
4. **Check each item:**
   - **Already fixed/implemented.** Search merged PRs and commits (`gh pr list --state merged --search "<keywords>"`, `git log -i --grep`), changelog, docs, and current code. Find the first release with the fix (`git tag --contains <sha> --sort=version:refname | head -1`). Verify in the code, not just the title. A partial fix is not fixed: keep it open.
   - **Duplicate.** Group by symptom or request, not wording. Search open and closed issues with distinctive text (`gh issue list --state all --search "<text>"`). Pick one canonical item: linked PR > maintainer response > best repro > most reactions > oldest. Close the others into it.
   - **Spam.** Needs two or more strong signals: promo/SEO/crypto links, off-topic text, repeated identical posts, empty body with a link, bulk activity from a new account. Typos, terse text, wrong template, or non-English are not spam.
   - **Labels.** Suggest existing labels for unlabeled or mislabeled items.
   - **Low hanging fruit.** Items a maintainer can finish fast: PRs that are approved or ready with passing CI, small PRs with a clear change, typo or docs fixes, bugs with a clear repro and an obvious small fix, and requests that are small and well defined. Say why each is quick, and propose the `low hanging fruit` label for it. Skip items that are blocked, unclear, or large.
   - **Demand.** Count positive reactions (👍 ❤️ 🎉 🚀), negative ones, distinct commenters, "+1" comments, and folded-in duplicates. Rate `High / Medium / Low` for the repo's size and show the raw numbers. Recent activity on an old item means it is still wanted.
5. **Present the plan** as the tables below, **Stop to ask for confirmation**. Run no write command in this turn.
6. **Execute** approved rows only, one at a time: comment, then label, then close. Stop on the first API error and report it. End with a done/failed table with links.

## Recommended Labels

General labels. Map them to the repo's existing labels first (same meaning, different name). Never rename or delete existing labels.

| Group | Labels | Meaning |
|-------|--------|---------|
| Type | `bug`, `enhancement`, `documentation`, `regression` | What kind of item it is. `regression`: only appears after a new release. |
| Triage state | `pending triage`, `needs reproduction` | Where the item is stuck. |
| Resolution | `duplicate`, `invalid`, `wontfix`, `spam` | Why it was closed. |
| Priority | `p1-chore`, `p2-nice-to-have`, `p2-edge-case`, `p3-minor-bug`, `p3-significant`, `p4-important`, `p5-urgent` | How much it matters. Descriptions: p5 breaks most users and needs a release now; p4 breaks documented behavior; p3 is an edge case or a high-priority enhancement; p2 is nice to have or has a workaround; p1 changes no behavior. |
| Contribution | `low hanging fruit` | Quick for a maintainer to finish. |
| Context | `has workaround`, `bug: upstream`, `<platform> only` (e.g. `windows only`) | Extra facts that help the next reader. |
| Area | `feat: <area>` (one per major module of the repo) | Which part of the code it touches. Derive areas from the repo's directories, docs, and past issues. |
| Bot | `bot: maybe`, `bot: likely` | Suspected bot or LLM content, short of spam. |

Rules:

- Keep every label's description filled. If an existing label has none and its meaning is clear, suggest a description.
- Suggest only labels that would help *this* repo's triage: needed by items you saw, or filling an obvious gap (for example no way to mark "needs reproduction" while many issues lack a repro). Do not suggest the whole list.
- Prefer a few `feat: <area>` labels backed by real clusters of issues over many speculative ones.
- Creating labels is a write action. List them in the Labels table (as `(new label)` rows) with name, color (match the repo's palette), description, and the items that would use them. Create only after approval (`gh label create <name> --description "..." --color <hex>`), and before applying them to items.

## Comments

Short, friendly, and specific. Examples of the tone (do not copy verbatim). Each ends with the notice on its own line:

- Fixed:
  ```md
  This was fixed in #456, released in v1.2.0. Please upgrade to get it. If it still happens, comment with a repro and we will reopen.

  🤖 *Automated by an agent.*
  ```
- Duplicate:
  ```md
  This is a duplicate of #123. Please follow that issue. Tell us if it is different and we will reopen.

  🤖 *Automated by an agent.*
  ```
- Spam:
  ```md
  Detected as a spam. Sorry if this was a mistake. Let us know and a maintainer can bring it back.

  🤖 *Automated by an agent.*
  ```

Rules per type:

- **Fixed:** link the PR or commit and release, and say what to do (upgrade, enable an option, use an API). Close as completed.
- **Duplicate:** name the canonical issue and invite the author to reopen if it differs. Close as `not planned`.
- **Spam:** add the `spam` label. Say it was detected as spam, with no reasoning. Say sorry if wrong, and say we can bring it back. Put the reasoning in the table, not in the comment. Close as `not planned`.

## Action Tables

Three tables, rows numbered so the user can reply "apply 1-5, skip 3". Show the full comment text in the table.

**1. Close**

| # | Item | Reason | Link (fix / canonical) | Comment |
|---|------|--------|------------------------|---------|

`Reason` is `fixed`, `duplicate`, or `spam`. Spam rows also add the `spam` label, and their reasoning stays in this table, not in the comment.

**2. Labels**

| # | Item | Add | Reason |
|---|------|-----|--------|

Include `low hanging fruit` rows here. For a label the repo does not have, add a row with item `(new label)`, the name, description, color, and which items will use it. Approved new labels are created first (`gh label create`), then applied.

**3. Needs attention** (no write action)

| # | Item | Demand | Reactions / comments | Note |
|---|------|--------|----------------------|------|

Put the most recommended check-them-first items at the top, ranked by importance: high demand, regressions or build-breaking bugs, security reports, security-sensitive or long-waiting PRs, and items with active unanswered discussion. Say why in `Note`. Low hanging fruits go here too, after those, with the reason it is quick.

Do not close PRs for being stale unless asked; label or flag them instead.
