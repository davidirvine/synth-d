## Why

The `develop` → `main` → backmerge cycle produces recurring merge conflicts every release (4+ instances visible in recent history with the message `chore: merge main into develop, resolving conflicts in favor of develop`). The root cause is the squash-merge of the promote PR: git cannot reconcile main's squash blob against develop's original commits during the backmerge, producing phantom conflicts on files that are literally identical content. With two developers (one human, one AI) and a worktree-per-change workflow already providing per-feature isolation, the develop branch adds friction without doing structural work that worktrees don't already cover. Removing it eliminates the entire failure mode.

## What Changes

- **BREAKING (workflow):** `develop` branch is deleted. `main` becomes the single long-running branch. All feature/bugfix worktrees branch off main and PR into main.
- The promote PR (develop → main) and its workflow are removed.
- The backmerge PR (main → develop) and its workflow are removed.
- The CI workflow for PRs to develop is removed; its lint and prettier checks are migrated to the main CI workflow (PRs to main currently run tests only).
- OpenSpec proposal artifacts commit directly to `main` as `chore(openspec): ...` (release-please ignores `chore:` for version bumps).
- CLAUDE.md "Branching", "Worktree Workflow", and "Pull Requests" sections are rewritten to drop all develop/main split framing.
- README.md "Branching & Deployment" section is rewritten to describe the trunk-based flow.
- The `opsx-apply-wt` worktree creation flow uses `main` as the base branch instead of `develop`.
- GitHub default branch is switched from `develop` to `main`. Branch protection rules move from develop to main.
- Stale `release-please--branches--develop--components--subtractive-synth` tracking branch is deleted.

## Capabilities

### New Capabilities

None. This change modifies existing workflow capabilities; no new spec files are created.

### Modified Capabilities

- `stacked-pr-workflow`: Branch creation rules change — branches are cut from `main` (not `develop`). The "develop is reserved for proposals" framing is removed. Worktree workflow is preserved, only the base branch changes.
- `ci-pipeline`: The "PRs to develop" requirement is removed. The "PRs to main" requirement is expanded to include lint and prettier checks (currently only on PRs to develop). PRs to main now run the full check suite.
- `cd-pipeline`: The "promote PR" scenarios are removed. Production deploy still fires only on release-please cut.
- `release-management`: The backmerge requirement and its scenarios are removed. Release flow ends when release-please cuts and deploys; no second branch to update.
- `readme-branching-docs`: The branching strategy documented in the README is rewritten to remove the `develop` integration branch and the auto-promotion PR. The new flow is `feature/*` → `main` → GitHub Pages, with `release-please` running on main.

## Impact

**Code & infrastructure:**
- Delete `.github/workflows/promote.yml`
- Delete `.github/workflows/ci-develop.yml` (after migrating its lint + prettier steps to `ci-main.yml`)
- Edit `.github/workflows/ci-main.yml` to add the lint + prettier steps
- Edit `.github/workflows/release-please.yml` to remove the `backmerge` job
- Edit `CLAUDE.md` (Branching, Worktree Workflow, Pull Requests sections)
- Edit `README.md` (Branching & Deployment section)
- Edit the `opsx-apply-wt` skill (or wherever the worktree base branch is configured) to use `main` instead of `develop`

**GitHub repository settings (manual, not version-controlled):**
- Switch default branch develop → main
- Mirror develop's branch protection rules onto main (or verify they already exist)
- Remove branch protection from develop before deletion

**Branches:**
- Final develop → main MERGE (not squash) PR brings 2 unreleased commits over with proper history before deletion: `0ead3e1` (CD pipeline deployment triggers) and `a9389cd` (implementation completion workflows). Using merge instead of squash for this final promotion avoids creating one last phantom-conflict opportunity for any in-flight work.
- Delete `develop` branch (local + remote) after successful promote
- Delete stale `release-please--branches--develop--components--subtractive-synth` branch

**Out of scope (deferred):**
- Pruning the 60+ stale `feature/*`, `bugfix/*`, `design/*`, `planing-*` branches in the repo. Natural cleanup moment, but separable and does not block the workflow change.
- Switching individual feature/bugfix → main PRs from squash to merge. Current squash-per-feature is fine and unrelated to the develop/main phantom-conflict problem; the squash issue only manifested when squashing the *cumulative* promote PR.

**Risk:**
- Reversible: recreating develop is `git branch develop main && git push -u origin develop` plus restoring the deleted workflow files.
- The migration is one substantive PR plus housekeeping. Mechanical risk is low; muscle-memory risk (forgetting the old rules are gone) is mitigated by updating CLAUDE.md and README.md as part of the same PR.
- If active worktrees exist at cutover time, they need to be rebased onto main once: `git rebase --onto main develop <branch>`. This is a known cost of any base-branch migration.
