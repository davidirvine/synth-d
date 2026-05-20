## 1. #1 — Stop claiming roborev reviews fire automatically after each commit

- [x] 1.1 In `CLAUDE.md` "Code review with roborev", replace "After each commit, reviews run automatically in the background" with prose stating reviews are invoked explicitly at the defined gates (proposal design review, end-of-implementation `roborev refine`, explicit `roborev review` / `roborev tui`) and that worktree-branch commits are not auto-queued. Run prettier on `CLAUDE.md`.
- [x] 1.2 In `CLAUDE.md` PR-feedback step 1, remove "the roborev post-commit hook fires and queues async reviews as normal"; state that any review of a response commit is invoked explicitly. Run prettier on `CLAUDE.md`.

## 2. #2 — Correct the Conventional Commits rationale

- [x] 2.1 In `CLAUDE.md` "Conventional Commits", reword the "This is a functional requirement, not a style preference" paragraph so per-commit types are framed as required for review scoping/readability and the release-bump input is the squash-merge PR title (not the per-commit types). Run prettier on `CLAUDE.md`.

## 3. #3 — Replace interactive squash with a non-interactive one

- [ ] 3.1 In `CLAUDE.md` PR-feedback step 3, replace `git rebase -i` with a non-interactive squash (`git reset --soft "$(git merge-base HEAD main)"` then a single `git commit`), keeping `git push --force-with-lease`, and specify that the squash commit message is the PR title (a valid Conventional Commit). Run prettier on `CLAUDE.md`.

## 4. #6 — Add a human-approval step before a proposal merges to main

- [ ] 4.1 In `CLAUDE.md` "Spec Driven Design" (proposal-merge prose) and the "Proposal design-review gate" subsection, add an explicit human-approval step: after the design review passes cleanly, present the result and wait for explicit human approval before the `proposal/<change-name>` branch fast-forward merges to `main`. Run prettier on `CLAUDE.md`.

## 5. Verification

- [ ] 5.1 Run `openspec validate fix-workflow-kernel-friction` and confirm it passes.
- [ ] 5.2 Confirm `CLAUDE.md` is consistent with the `pr-workflow`, `commit-review-cycle`, and `conventional-commits` deltas via grep-verifiable checks: (a) the roborev section no longer claims automatic per-commit review — `grep -in "run automatically\|fires and queues\|automatically in the background" CLAUDE.md` returns nothing; (b) `grep -n "rebase -i" CLAUDE.md` returns nothing; (c) the Conventional Commits section ties the release bump to the PR title, not per-commit types; (d) the proposal/Spec-Driven-Design section includes an explicit human-approval step before the fast-forward merge to `main`. Then re-read the affected sections to confirm the prose reads coherently.
