---
description: Create a worktree for an approved OpenSpec proposal and start implementation
---

The change `$ARGUMENTS` has an approved proposal committed to `develop`.
Create an isolated git worktree on `feature/$ARGUMENTS` and begin implementation there.

**Steps:**

1. Confirm the user is in the develop worktree and on the `develop` branch. If not, stop and tell them.

2. Run `./scripts/opsx-apply-worktree.sh $ARGUMENTS` from the repo root.
   The script will:
   - Verify the proposal exists at `openspec/changes/$ARGUMENTS/`
   - Verify `develop` is clean and up to date
   - Create a sibling worktree at `../<repo>-$ARGUMENTS` on branch `feature/$ARGUMENTS`
   - Copy untracked essentials (`.env`, `.env.local`)

3. If the script exits non-zero, surface the error verbatim to the user and stop.
   Do not attempt to fix preflight failures automatically — they usually mean
   the user needs to commit the proposal, pull develop, or clean up a stale branch.

4. On success, report:
   - The worktree path
   - The branch name
   - That the user should `cd` into the worktree and run `/opsx:apply $ARGUMENTS`

5. Do **not** `cd` or run `/opsx:apply` yourself — the user will handle that
   from the new worktree's VS Code window / terminal, where services,
   virtualenv, and editor state are set up independently.
