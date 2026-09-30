---
name: visual-evidence
description: Capture before/after screenshots of user-visible UI changes from the merge base and the PR head, then attach them to the PR with gh --attach without committing images to the repo.
---

# Visual Evidence

Every PR that changes what a user sees ships a before/after pair per affected state. Screenshots live in GitHub's user-attachments storage, never in the repository.

## Capture

1. List every affected surface: page, route, dialog, component, responsive breakpoint, theme, locale. A shared primitive or global style change needs several consumers, not one representative page.
2. Give each state a stable id and readable title, for example `settings-connection` / `Settings / Connection`.
3. Check out the merge base in a detached temporary worktree so the working branch is untouched:

   ```bash
   base=$(git merge-base origin/main HEAD)
   git worktree add --detach /tmp/pr-base "$base"
   ```

4. Capture the same states from both revisions with whatever the repo already has: Playwright, Storybook / Histoire stories, Vishot, `agent-browser screenshot`, or the app's own dev server plus a browser. Prefer an existing story or e2e scenario over an ad hoc route.
5. Use identical viewport, theme, locale, fixture data, and readiness condition for both revisions. Write outputs to an ignored directory such as `.pr-shots/base/<id>.png` and `.pr-shots/head/<id>.png`.
6. Look at every image. Reject blank, loading, error, or unstable captures unless that state is the subject of the change. A failed capture blocks the PR; record the reason instead of dropping the state.
7. Record `before: absent` for a newly added state and `after: removed` for a deleted one.

Remove the temporary worktree after the PR is created: `git worktree remove /tmp/pr-base`.

## Attach

GitHub CLI 2.99+ uploads local images and videos with `--attach` and rewrites matching local paths in the body to the uploaded URL. Write the body with ordinary local paths, then pass each file:

```markdown
## Visual changes

| Before | After |
| --- | --- |
| ![Settings / Connection before](.pr-shots/base/settings-connection.png) | ![Settings / Connection after](.pr-shots/head/settings-connection.png) |
| Settings / Connection, 1440x900, dark | Settings / Connection, 1440x900, dark |
```

```bash
gh pr create \
  --title "fix(settings): keep connection form visible on narrow widths" \
  --body-file /tmp/pr-body.md \
  --attach .pr-shots/base/settings-connection.png \
  --attach .pr-shots/head/settings-connection.png
```

- Paths in `--attach` must match the paths in the body exactly; unmatched files are appended to the end of the body.
- `gh pr edit --attach` and `gh pr comment --attach` work the same way for follow-ups.
- A video reference (`![](path.mp4)`) alone in its paragraph renders as a player.
- Attaching requires push access to the repo. Only image and media types are accepted.

After creating the PR, open it and confirm every image renders and matches its label. Do not probe the asset URLs with GET/HEAD; anonymous requests can return 404 while the image still renders inside GitHub.

## Fallback

On an older `gh`, upload each file to `https://uploads.github.com/user-attachments/assets` with the `gh auth token` bearer token and paste the returned `https://github.com/user-attachments/assets/...` URL into the body. The airi `upload-github-attachment` script wraps this flow. If neither route works, stop and report the local paths instead of committing images.

<!--
Source references:
- https://docs.github.com/en/github-cli/github-cli/attaching-files-with-github-cli
- https://github.com/moeru-ai/airi/blob/main/.agents/skills/create-pr/SKILL.md
- https://github.com/moeru-ai/airi/blob/main/.agents/skills/upload-github-attachment/SKILL.md
-->
