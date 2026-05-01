## 1. Pre-migration triage

- [x] 1.1 Audit local and remote branches: list every `feature/*`, `bugfix/*`, `design/*`, and `planing-*` branch and classify as active (in-progress worktree) or stale (abandoned/merged)
- [x] 1.2 For each active branch, record its current base (should be develop) and confirm the human knows it will need a one-time rebase onto main after Phase 3
- [x] 1.3 Confirm develop's unreleased commits ahead of main are intentional and ready to ship: `0ead3e1` (CD pipeline deployment triggers), `a9389cd` (implementation completion workflows), and the backmerge commit `b9e068a`
- [x] 1.4 Confirm no in-flight promote PR or release-please PR is open at the start of the migration

## 2. Final develop → main promotion

- [x] 2.1 Open the final promote PR from develop → main using stax (or manually via the GitHub UI if stax does not support this one-time pattern)
- [x] 2.2 Verify CI passes on the promote PR
- [x] 2.3 Merge the PR using GitHub's "Create a merge commit" option (NOT "Squash and merge"); this preserves the unreleased commits' SHAs on main and avoids one last phantom-conflict opportunity
- [x] 2.4 Verify main now contains `0ead3e1` and `a9389cd` with their original SHAs (`git log --oneline main | grep -E '0ead3e1|a9389cd'`)

## 3. Cutover PR — workflow files

- [x] 3.1 Create a `feature/drop-develop-branch` worktree from main (per the existing CLAUDE.md rules — this branch will become the base for itself once merged)
- [x] 3.2 Delete `.github/workflows/promote.yml`
- [x] 3.3 Edit `.github/workflows/release-please.yml`: remove the `backmerge` job entirely (keep `release-please` and `deploy` jobs)
- [x] 3.4 Edit `.github/workflows/ci-main.yml`: add `npx eslint .` step after Install dependencies, add `npx prettier --check .` step after the eslint step (mirror their position in `ci-develop.yml`)
- [x] 3.5 Delete `.github/workflows/ci-develop.yml`
- [x] 3.6 Verify locally that the YAML in `ci-main.yml` parses (e.g., `npx yamllint` or just inspect)

## 4. Cutover PR — documentation

- [x] 4.1 Edit `CLAUDE.md` "Branching" section: change "Branches MUST be created from `develop`" to "Branches MUST be created from `main`"; remove all references to develop as the proposal/tooling branch
- [x] 4.2 Edit `CLAUDE.md` "Worktree Workflow" section: rewrite to drop the "develop is reserved for OpenSpec proposals and tooling work" framing; new framing is "implementation happens in worktrees branched from main"
- [x] 4.3 Edit `CLAUDE.md` "Pull Requests" section: remove all develop-vs-main split language; PRs target main directly
- [x] 4.4 Edit `README.md` "Branching & Deployment" section (lines ~82–99): rewrite the table to show only `main`, `feature/*`, `bugfix/*`; remove the develop row; rewrite the "Auto-promotion" paragraph (delete it); update the "CI checks" paragraph to describe checks on PRs to main; update the Releases paragraph to remove backmerge mention
- [x] 4.5 Verify `README.md` and `CLAUDE.md` are consistent with each other after edits

## 5. Cutover PR — opsx tooling

- [x] 5.1 Locate the `opsx-apply-wt` skill or wherever the worktree base branch is configured (likely a hardcoded `develop` reference in skill markdown or shell command)
- [x] 5.2 Update the base branch reference from `develop` to `main`
- [ ] 5.3 Test the change by running `/opsx-apply-wt drop-develop-branch` (or equivalent) and confirming the worktree is created off main

## 6. Cutover PR — submit and merge

- [ ] 6.1 Run pre-push hooks (lint/format/test) and verify all pass
- [ ] 6.2 Submit the cutover PR using stax: `stax ss --yes --no-prompt`
- [ ] 6.3 Verify CI on the cutover PR runs lint, prettier, vitest, and playwright (proves the migrated steps work)
- [ ] 6.4 Address any roborev findings via `/roborev-fix` until clean
- [ ] 6.5 Wait for human approval per the implementation-completion gate in CLAUDE.md
- [ ] 6.6 Merge the cutover PR (squash, per the existing per-feature PR convention — this is a normal feature merge, not a promote)

## 7. GitHub repository settings

- [ ] 7.1 Switch GitHub default branch from `develop` to `main` (Settings → Branches → Default branch)
- [ ] 7.2 Add or verify branch protection rules on `main` mirroring whatever protection `develop` had (require CI checks, require review, etc.)
- [ ] 7.3 Remove branch protection from `develop` (required before deletion)

## 8. Branch deletion

- [ ] 8.1 Delete the remote develop branch: `git push origin --delete develop`
- [ ] 8.2 Delete the local develop branch: `git branch -D develop`
- [ ] 8.3 Delete the stale release-please tracking branch: `git push origin --delete release-please--branches--develop--components--subtractive-synth`
- [ ] 8.4 Update local `origin/HEAD` to point at main: `git remote set-head origin -a`

## 9. Active worktree migration

- [ ] 9.1 For each active branch identified in Phase 1: rebase onto main with `git rebase --onto main develop <branch>` (this must happen before reflog gc reclaims the develop ref)
- [ ] 9.2 Force-push the rebased branches if they were already on origin
- [ ] 9.3 Confirm each rebased branch's PR (if any) now targets main, not develop

## 10. Verification

- [ ] 10.1 Confirm `git branch -a` shows no `develop` ref (local or remote)
- [ ] 10.2 Confirm a fresh clone defaults to main (`git clone <repo> /tmp/test && cd /tmp/test && git branch --show-current` returns `main`)
- [ ] 10.3 Confirm CI on a test PR to main runs the full check suite (vitest + playwright + eslint + prettier)
- [ ] 10.4 Confirm release-please.yml no longer references the develop branch or a backmerge job
- [ ] 10.5 Confirm `/opsx-apply-wt` creates worktrees off main
- [ ] 10.6 Wait one release cycle and confirm no backmerge conflict appears (this is the success criterion that motivated the change)
