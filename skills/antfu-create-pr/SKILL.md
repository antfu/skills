---
name: antfu-create-pr
description: Create a reviewable GitHub pull request from the current branch with a Conventional Commits title, a concise evidence-based body, and before/after screenshots for UI changes. Use when asked to open, create, publish, or prepare a PR.
metadata:
  author: Anthony Fu
  version: "2026.10.09"
---

# Create Pull Request

Open a PR that a reviewer can understand from the body alone. Explain the changed behavior and why, not the list of changed files. Keep the body proportional to the change: a one-line fix gets a few sentences, a cross-module feature gets tables and diagrams.

## Workflow

1. Inspect the repo: `git status`, current branch, remotes, default branch, `.github/PULL_REQUEST_TEMPLATE*`, and `AGENTS.md` / `CONTRIBUTING.md` for PR rules.
2. Compute the merge base against the target branch and record the exact `base...head` range the PR publishes. If the branch is stacked on another unmerged branch, target that branch and describe only this PR's own changes.
3. Read the full diff. Separate runtime code from generated files, lockfiles, and snapshots. Trace changed code to its entry points, callers, and external boundaries so architecture claims are backed by file paths or symbols.
4. Classify the PR (feature, fix, refactor, chore, docs) and decide which optional body sections earn their place. See [pr-body](references/pr-body.md).
5. Run the checks that match the changed surfaces (focused tests, typecheck, lint). Record the exact commands and results.
6. If the diff changes user-visible UI, capture before/after evidence. See [visual-evidence](references/visual-evidence.md).
7. Review the commit history and reshape it into atomic Conventional Commits. See [Commits](#commits).
8. Write the body to a temporary file. Push the branch. Create the PR with `gh pr create --title ... --body-file ...` (add `--attach` for each screenshot). Use `--draft` when checks are still running or the work is not review-ready.
9. Open the created PR and verify title, base, head, rendered tables, diagrams, and images.
10. Address review comments: fix each confirmed issue, run focused checks, push, reply with evidence, and resolve the thread.

## Title

Use Conventional Commits, matching how the repo already writes commit messages:

```text
feat(scope): add retry to upload client
fix(scope): avoid double submit on enter
refactor: extract diff parsing from cli
chore(deps): update vite to v8
docs: clarify worktree setup
```

- Lowercase, imperative, no trailing period, under ~70 characters.
- Scope is the package, module, or feature name the repo already uses. Omit it when the change is repo-wide.
- Squash-merge repos turn the title into the commit message; write it as the commit you want in history.

## Commits

Each commit does one logical thing and uses a Conventional Commits message. A reviewer should be able to read `git log --oneline` as the story of the change and review commit by commit.

```text
# Good: each commit is self-contained
feat(api): add task creation endpoint with validation
feat(ui): add task creation form component
feat(ui): connect form to api and add loading state
test(tasks): cover task creation (unit + integration)

# Bad: everything mixed together
feat: add task feature, fix sidebar, update deps, refactor utils
```

- Keep unrelated fixes, dependency bumps, and drive-by refactors out of the branch; open separate PRs for them.
- Before pushing, review the history and split or squash local commits (`git rebase -i <base>`) until each one stands alone and builds.
- Do not rewrite commits that are already pushed and under review; add new commits instead.

## Body

Required in every PR:

- `## Summary`: the problem or capability first, then what changed and why this approach. Mention if the PR is stacked and on what.
- Linked issues: `closes #123` / `fixes #123` / `refs #123` so GitHub links and auto-closes.
- `## Verification`: exact commands run and their results, plus anything left unverified.

Optional, only when it helps the reviewer:

- `## Change map`: table of module, before, after, reason. Use for changes across several modules or ownership boundaries. Never a raw file list.
- `## Architecture and behavior`: a Mermaid flow, sequence, or state diagram when ordering, async work, or state transitions changed. For a fix, pair a `Before` and `After` diagram at the same abstraction level.
- `## Boundaries and risks`: table of invariant, failure mode, protection, evidence. Use when there are real failure modes, migrations, or external effects.
- `## Visual changes`: before/after image table for UI changes.
- `## Rollout and follow-up`: migrations, feature flags, known gaps. State whether a gap blocks merge.

If the repo has a PR template, keep its headings and fill them; add sections above only where the template leaves room.

## Rules

- Say what is verified, what is assumed, and what is not verified. Do not write "safe", "fixed", or "backward compatible" without pointing at the evidence.
- Green CI proves only the checks CI runs. Focused tests prove only the behavior they cover.
- Do not describe inherited changes from a parent branch as this PR's changes.
- Use plain hyphens; never em dashes (U+2014) or en dashes (U+2013).
- No filler ("This PR aims to...", "comprehensive", "robust"). Start sentences with the fact.
- Do not paste tokens, secrets, user records, or full payloads into the body.
- Do not commit screenshots or other PR-only artifacts to the repo; attach them with `gh --attach`.
- If the PR was written with the help of an agent, say so in one line at the end of the body.
