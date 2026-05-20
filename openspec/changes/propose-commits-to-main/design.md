## Context

`CLAUDE.md` is the stack-agnostic workflow kernel (governed by the `workflow-kernel-structure` capability); the per-change branch/PR/worktree flow it describes is specced under `pr-workflow`. Two parts of `CLAUDE.md` disagree about branch timing:

- Branching section, line 13: "Branches MUST be created from `main` at the time `/opsx:propose` is invoked." Line 28: "Before starting any implementation work the branch MUST exist. … create the branch first."
- Worktree Workflow section, line 36: `/opsx-apply-wt` "create[s] a sibling worktree on the correct branch", and `scripts/opsx-apply-worktree.sh` does `git branch <prefix>/<change> main` after asserting the proposal is committed to `main` and the branch does not yet exist.

An agent that follows the Branching section creates `feature/<change>` during propose and commits the proposal there, which (a) keeps the proposal off `main` and (b) pre-creates the branch the script wants to create — tripping both preflight checks. The repo's own history shows the intended landing spot: proposals land on `main` as `chore(openspec): propose <name>` commits (e.g. `0ae8311`), with the implementation branch and PR created afterward. The `pr-workflow` spec already encodes the correct implementation-branch timing in its "Branches are cut from main" requirement, but its "User is prompted for change type before branch creation" requirement is worded "When a new change is proposed … before creating the branch," which reinforces the wrong mental model.

A second gap: proposals reach `main` with no review. Code passes a roborev review before merge, but the proposal — the design the code implements — lands unreviewed. To give the proposal the same gate, it must live on a branch long enough for a roborev **design review** to run (design review operates on branch commits), and the merge to `main` must wait until that review passes cleanly.

## Goals / Non-Goals

**Goals:**

- Make the rules unambiguous: proposing works on a dedicated `proposal/<change-name>` branch and merges to `main` only after a clean design review; `/opsx-apply-wt` is the sole place the implementation branch is created and the change type is prompted.
- Gate the proposal merge on a roborev design review, mirroring the code-review gate.
- Document the proposal-commit convention (`chore(openspec): propose <change-name>`).
- Keep `CLAUDE.md` and the `pr-workflow` spec mutually consistent and consistent with the existing `opsx-apply-worktree.sh` contract.

**Non-Goals:**

- No change to `scripts/opsx-apply-worktree.sh` (its preflight already fails safely; hardening its error message is a possible follow-up, not this change).
- No PR for the proposal — the merge to `main` is a local fast-forward gated by the design review (see Decisions).
- No change to the apply, verify, or archive flows beyond the branch-timing and design-review wording.
- No `STACK.md` change — this is stack-agnostic kernel content.

## Decisions

**Tie the change-type prompt and implementation-branch creation to `/opsx-apply-wt`, not `/opsx:propose`.** This matches the script and the "Branches are cut from main" requirement, and means the proposal can be reviewed and merged before anyone commits to an implementation branch name. Alternative — keep implementation-branch creation at propose time and change the script to expect an existing branch — rejected: it puts the proposal on the implementation branch instead of `main`, breaks the "proposal lives on main" history pattern, and complicates the squash-merge model.

**Run the proposal design review on a dedicated `proposal/<change-name>` branch and gate the merge to `main` on it passing cleanly.** A roborev design review needs branch commits to review, so the proposal cannot go straight to `main`. A dedicated `proposal/` prefix keeps the implementation `feature/`|`bugfix/` branch and apply-wt's "implementation branch must not exist" preflight untouched, and keeps the change-type prompt at apply-wt time. Once the design review passes cleanly — all findings resolved, exactly as code reviews must pass — the proposal branch is merged to `main` and deleted. Alternative — reuse the `feature/`|`bugfix/` branch for the proposal — rejected: it forces the change-type prompt back to propose time and reworks apply-wt's preflight, re-introducing the original contradiction. Alternative — commit straight to `main`, then review — rejected: nothing gates the merge once the proposal is already on `main`.

**Merge the reviewed proposal to `main` with a local fast-forward, no PR.** Proposals are lightweight and historically landed on `main` directly; the design review — run locally on the branch like roborev code reviews — is the gate. A fast-forward merge preserves the literal `chore(openspec): propose <change-name>` commit on `main` (no squash), so `release-please` parses a no-bump commit. If `main` has advanced since the proposal branch was cut, rebase the proposal branch onto `main` before the fast-forward. Alternative — open a PR for the proposal — rejected as heavier than needed; the mandatory design-review gate already enforces proposal quality.

**Commit the proposal as `chore(openspec): propose <change-name>`.** `chore` yields no release bump (correct — a proposal is not a shipped feature), and the `openspec` scope plus `propose <name>` body make the commit self-describing and greppable. Alternative — a typeless or `feat`/`docs` message — rejected: `feat` triggers a spurious version bump and mislabels an artifact-only commit (exactly the `delay-mix-knob-first` failure); `docs` understates that this is a tracked process artifact.

**Reword the existing `pr-workflow` requirement in place rather than renaming it.** Keeping the header "User is prompted for change type before branch creation" preserves the archive-time MODIFIED match; the body and scenarios are edited to anchor the prompt to `/opsx-apply-wt`. A new ADDED requirement carries the propose-on-a-branch + design-review-gate rule.

## Risks / Trade-offs

- [Merging the proposal to `main` without a PR skips PR-level review of the proposal text] → The roborev design review is now a mandatory gate before the merge, so the proposal is no longer unreviewed; the implementation still goes through the full code gate + PR. Net improvement over the prior direct-to-main commit.
- [A `proposal/<change-name>` branch left undeleted could confuse a later apply] → apply-wt's preflight only checks the `feature/`|`bugfix/` branch, so a stray `proposal/` branch does not block it; the flow deletes the proposal branch after the ff-merge regardless.
- [Editing the kernel could drift from the `pr-workflow` spec again] → The implementation tasks update `CLAUDE.md` and the spec delta together, and `openspec validate` plus the completion gate run before the change is archived.
