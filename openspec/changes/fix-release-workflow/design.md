## Context

The project uses a three-workflow release pipeline:

1. **`promote.yml`** — fires on push to `develop`; opens a PR (`develop → main`) titled `chore: promote develop to main`.
2. **`release-please.yml`** — fires on push to `main`; runs `release-please-action` to open/update a Release PR and, when `release_created = true`, opens a backmerge PR.
3. **`deploy.yml`** — fires on push to `main`; builds and deploys to GitHub Pages unconditionally.

The owner always uses GitHub's "Squash and merge" for the promote PR. This collapses every commit from `develop` into a single commit whose message is the PR title: `chore: promote develop to main`. Release-please reads commits on `main` and finds only `chore:` — a non-releasable type — so it never opens a Release PR, `release_created` is never true, and the backmerge never fires. Additionally, `deploy.yml` fires on every push to `main` (both the promote merge and any future Release PR merge), causing double deploys with a stale version number.

## Goals / Non-Goals

**Goals:**
- Release PR appears after the promote PR is merged, without changing the squash-merge habit.
- Deploy fires exactly once per release, after the version bump commit lands on `main`.
- Backmerge PR opens automatically after each release.
- CLAUDE.md makes conventional commits a documented, explained requirement.

**Non-Goals:**
- Changing the owner's merge strategy — squash-and-merge stays as-is.
- Generating detailed per-commit changelogs in the squash world (one changelog entry per promote batch is acceptable).
- Automating the merge of the Release PR or backmerge PR.

## Decisions

### Decision 1: Encode commit type in the promote PR title, not in individual commits

**Chosen**: `promote.yml` inspects commits in the `develop..main` diff, detects the highest-priority conventional type (`feat` > `fix` > `chore`), and sets the PR title to `<type>: promote develop to main`.

**Alternative considered**: Switch to merge commits for `develop → main` so individual commits reach `main` intact. Rejected because it requires changing a deep-rooted user habit and introduces a merge commit every cycle; the PR-title approach is invisible to the user and self-correcting.

**Alternative considered**: Use a `workflow_dispatch` to manually trigger releases. Rejected as it requires manual action every cycle, removing the automation benefit.

The title update must also handle the case where the promotion PR already exists — `gh pr edit --title` is called when `gh pr create` exits non-zero.

### Decision 2: Move deploy into `release-please.yml` as a dependent job

**Chosen**: Add a `deploy` job to `release-please.yml` with `needs: release-please` and `if: needs.release-please.outputs.release_created == 'true'`. Remove the `push: branches: main` trigger from `deploy.yml`; keep the file as `workflow_dispatch`-only for manual emergency deploys.

**Alternative considered**: Trigger `deploy.yml` via `workflow_run` from `release-please.yml`. Rejected because `workflow_run` requires filtering on the output payload, which is awkward and harder to reason about than a co-located `if` condition.

**Alternative considered**: Delete `deploy.yml` entirely. Rejected because keeping it as `workflow_dispatch` preserves a manual escape hatch without adding complexity.

### Decision 3: `RELEASE_PLEASE_TOKEN` PAT for deploy, `GITHUB_TOKEN` for gh-pages push

The `release-please-action` already uses `RELEASE_PLEASE_TOKEN` (a PAT) to ensure downstream workflow triggers fire. The deploy steps within the same job inherit the job's token context but the `peaceiris/actions-gh-pages` action uses `github_token: ${{ secrets.GITHUB_TOKEN }}` for the actual push to `gh-pages` — this is correct and unchanged. No new secrets are needed.

### Decision 4: Conventional commits documented in CLAUDE.md as a functional requirement

The commit type is now load-bearing infrastructure (it determines the promote PR title, which determines the version bump). CLAUDE.md must explain this causally, not just list the format, so contributors understand breaking the convention has pipeline consequences.

## Risks / Trade-offs

- **Coarse changelogs**: Each release entry says "promote develop to main" rather than listing individual commits. Acceptable given the squash-merge constraint; the full commit list appears in the squash body and git log.
- **Promote PR title staleness**: If additional `feat:` commits land on `develop` after the promote PR was opened as `fix:`, the title needs updating. The workflow handles this by calling `gh pr edit` when the PR already exists — but only on the next `develop` push. Commits pushed in bulk between pushes will be caught by the subsequent push. This is a minor race window, not a correctness issue.
- **`release_created` race on rapid merges**: If two pushes land on `main` before release-please runs, it still processes them in order. No data loss, but the second run may see nothing new. Standard release-please behaviour.
- **Manual deploy escape hatch**: `deploy.yml` as `workflow_dispatch` lets an operator force a deploy outside the release cycle. This could push an unreleased version to production. Acceptable — it is an intentional operator escape hatch and requires manual action.

## Migration Plan

1. Update `promote.yml` — next promote PR cycle picks up the new title logic automatically.
2. Update `release-please.yml` — add deploy and backmerge jobs; no state migration needed.
3. Update `deploy.yml` — change trigger; takes effect immediately on merge.
4. Update `CLAUDE.md` — documentation only.

No rollback steps are needed; all changes are to workflow files and documentation. If the new promote title logic produces an incorrect type, the Release PR can be closed manually and re-triggered by pushing a no-op commit to `develop`.

## Open Questions

- None. All decisions are resolved.
