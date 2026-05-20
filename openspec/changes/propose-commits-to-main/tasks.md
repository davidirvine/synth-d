## 1. Rewrite the CLAUDE.md Branching rules

- [x] 1.1 In `CLAUDE.md`, rewrite the Branching section so it no longer says branches are created at `/opsx:propose` time. State that `/opsx:propose` commits the proposal to `main` and creates no branch, and that the `feature/`|`bugfix/` branch is created only by `/opsx-apply-wt`. Move the "prompt the human for change type and wait for confirmation" requirement so it is anchored to `/opsx-apply-wt`, not proposing. Remove the "Before starting any implementation work the branch MUST exist … create the branch first" instruction (or rephrase it to mean "the worktree branch from `/opsx-apply-wt` must exist"). Run `npx prettier --write CLAUDE.md`; commit.

## 2. Document the proposal-commit convention

- [x] 2.1 In `CLAUDE.md` (Spec Driven Design and/or Committing Changes section), document that proposal artifacts are committed directly to `main` as `chore(openspec): propose <change-name>`. Run `npx prettier --write CLAUDE.md`; commit.

## 3. Verify consistency

- [x] 3.1 Re-read the edited `CLAUDE.md` against the `pr-workflow` delta and `scripts/opsx-apply-worktree.sh`; confirm all three agree that the proposal is on `main` and the branch is created by `/opsx-apply-wt`. Fix any residual references to propose-time branch creation. Commit if changes were needed.
- [x] 3.2 Run `openspec validate propose-commits-to-main --strict` and confirm it passes.
