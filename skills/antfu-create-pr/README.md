# antfu create-pr

Open a reviewable GitHub pull request from the current branch: Conventional Commits title,
concise evidence-based body, and before/after screenshots attached with `gh --attach` for
UI changes.

This README is for humans and is not part of the skill loaded by agents (that is
`SKILL.md` plus `references/`).

## Credits

The workflow, body structure, and evidence discipline are adapted from two Agent Skills in
[moeru-ai/airi](https://github.com/moeru-ai/airi), generalized away from AIRI's own tooling
(Vishot, Electron/Capacitor runtimes, `.vishot` paths) and combined with antfu's PR
conventions:

- **create-pr**
  https://github.com/moeru-ai/airi/blob/main/.agents/skills/create-pr/SKILL.md
  Merge-base and stacked-PR handling, change map, behavior diagrams, boundary and
  verification mapping, and the visual evidence workflow.

- **upload-github-attachment**
  https://github.com/moeru-ai/airi/blob/main/.agents/skills/upload-github-attachment/SKILL.md
  Uploading PR-only screenshots to GitHub user-attachments instead of committing them.
  This skill uses the native `gh --attach` flag (GitHub CLI 2.99+); the bundled
  `scripts/upload-github-attachment.sh` fallback for older CLIs is adapted from the
  version in https://github.com/antfu/pulls.review/pull/76.

These upstream projects are maintained by their own authors under their own licenses.
Before redistributing, check each repository's license and attribution terms.
