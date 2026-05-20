## Context

`CLAUDE.md` is the stack-agnostic workflow kernel (governed by the `workflow-kernel-structure` capability); the per-change branch/PR/worktree flow it describes is specced under `pr-workflow`. Two parts of `CLAUDE.md` disagree about branch timing:

- Branching section, line 13: "Branches MUST be created from `main` at the time `/opsx:propose` is invoked." Line 28: "Before starting any implementation work the branch MUST exist. … create the branch first."
- Worktree Workflow section, line 36: `/opsx-apply-wt` "create[s] a sibling worktree on the correct branch", and `scripts/opsx-apply-worktree.sh` does `git branch <prefix>/<change> main` after asserting the proposal is committed to `main` and the branch does not yet exist.

An agent that follows the Branching section creates `feature/<change>` during propose and commits the proposal there, which (a) keeps the proposal off `main` and (b) pre-creates the branch the script wants to create — tripping both preflight checks. The repo's own history shows the intended pattern: proposals land on `main` as `chore(openspec): propose <name>` commits (e.g. `0ae8311`), with the implementation branch and PR created afterward. The `pr-workflow` spec already encodes the correct branch-creation timing in its "Branches are cut from main" requirement, but its "User is prompted for change type before branch creation" requirement is worded "When a new change is proposed … before creating the branch," which reinforces the wrong mental model, and no requirement states where the proposal commit lands.

## Goals / Non-Goals

**Goals:**

- Make the rules unambiguous: proposing commits to `main` and creates no branch; `/opsx-apply-wt` is the sole place the branch is created and the change type is prompted.
- Document the proposal-commit convention (`chore(openspec): propose <change-name>`).
- Keep `CLAUDE.md` and the `pr-workflow` spec mutually consistent and consistent with the existing `opsx-apply-worktree.sh` contract.

**Non-Goals:**

- No change to `scripts/opsx-apply-worktree.sh` (its preflight already fails safely; hardening its error message is a possible follow-up, not this change).
- No change to the apply, verify, or archive flows beyond the branch-timing wording.
- No `STACK.md` change — this is stack-agnostic kernel content.

## Decisions

**Tie the change-type prompt and branch creation to `/opsx-apply-wt`, not `/opsx:propose`.** This matches the script and the "Branches are cut from main" requirement, and means the proposal can be reviewed/committed before anyone commits to a branch name. Alternative — keep branch creation at propose time and change the script to expect an existing branch — rejected: it puts the proposal on a branch instead of `main`, breaks the "proposal lives on main" history pattern, and complicates the squash-merge model.

**Commit the proposal as `chore(openspec): propose <change-name>`.** `chore` yields no release bump (correct — a proposal is not a shipped feature), and the `openspec` scope plus `propose <name>` body make the commit self-describing and greppable. Alternative — a typeless or `feat`/`docs` message — rejected: `feat` triggers a spurious version bump and mislabels an artifact-only commit (exactly the `delay-mix-knob-first` failure); `docs` understates that this is a tracked process artifact.

**Reword the existing `pr-workflow` requirement in place rather than renaming it.** Keeping the header "User is prompted for change type before branch creation" preserves the archive-time MODIFIED match; the body and scenarios are edited to anchor the prompt to `/opsx-apply-wt`. A new ADDED requirement carries the propose-to-main rule.

## Risks / Trade-offs

- [Committing a proposal directly to `main` bypasses PR review of the proposal text] → This is the established repo pattern (proposals are lightweight, reviewed as part of the implementation PR's spec deltas); the implementation still goes through the full gate + PR. No change in risk posture.
- [Editing the kernel could drift from the `pr-workflow` spec again] → The implementation tasks update `CLAUDE.md` and the spec delta together, and `openspec validate` plus the completion gate run before the change is archived.
