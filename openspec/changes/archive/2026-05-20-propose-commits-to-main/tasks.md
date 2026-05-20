## 1. Rewrite the CLAUDE.md Branching rules

- [x] 1.1 In `CLAUDE.md`, rewrite the Branching section so it no longer says branches are created at `/opsx:propose` time. State that `/opsx:propose` works on a dedicated `proposal/<change-name>` branch (distinct from the implementation `feature/`|`bugfix/` prefixes) and merges to `main`, and that the `feature/`|`bugfix/` implementation branch is created only by `/opsx-apply-wt`. Move the "prompt the human for change type and wait for confirmation" requirement so it is anchored to `/opsx-apply-wt`, not proposing. Remove/rephrase the "Before starting any implementation work the branch MUST exist … create the branch first" instruction so it refers to the worktree branch from `/opsx-apply-wt`. Run `npx prettier --write CLAUDE.md`; commit.

## 2. Document the proposal flow and commit convention

- [x] 2.1 In `CLAUDE.md` (Spec Driven Design and/or Committing Changes section), document that `/opsx:propose` commits the proposal artifacts to a `proposal/<change-name>` branch as `chore(openspec): propose <change-name>`, and that the proposal merges to `main` (fast-forward, no PR) only after the design-review gate passes. Run `npx prettier --write CLAUDE.md`; commit.

## 3. Document the proposal design-review gate

- [x] 3.1 In `CLAUDE.md`, document the proposal design-review gate: a roborev design review runs on the `proposal/<change-name>` branch and MUST pass cleanly (all findings resolved, the same posture as code reviews) before the proposal is fast-forward merged to `main` and the branch deleted. Run `npx prettier --write CLAUDE.md`; commit.

## 4. Verify consistency

- [x] 4.1 Re-read the edited `CLAUDE.md` against the `pr-workflow` delta and `scripts/opsx-apply-worktree.sh`; confirm all three agree that the proposal is reviewed on a `proposal/` branch, merges to `main` only on a clean design review, and that the implementation branch is created by `/opsx-apply-wt`. Fix any residual references to propose-time implementation-branch creation or unreviewed direct-to-main commits. Commit if changes were needed.
- [x] 4.2 Run `openspec validate propose-commits-to-main --strict` and confirm it passes.
