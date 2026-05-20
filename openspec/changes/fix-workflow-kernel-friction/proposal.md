## Why

The workflow kernel (`CLAUDE.md`) and its specs contain four self-contradictory or non-executable rules that mislead agents and humans: (1) they claim roborev reviews fire automatically after every commit, but the `post-commit` hook is an empty stub and worktree commits are not auto-queued — every real gate already invokes review explicitly; (2) the Conventional Commits rationale attributes the release bump to per-task commit types, but PRs are squash-merged so only the PR title is parsed; (3) PR-feedback squashing is specified as `git rebase -i`, which is non-interactive-only in the agent harness and redundant before a squash-merge; (4) a proposal fast-forward merges to `main` with no human-approval step — the only merge to `main` lacking a human gate. These are documentation/spec bugfixes; no hook or runtime code changes.

## What Changes

> The `#1`/`#2`/`#3`/`#6` labels match the original six-item workflow-friction audit. `#4` (the "approved via the OpenSpec workflow" gate was undefined) and `#5` (vestigial branch-on-`main` language) were resolved by the just-archived `propose-commits-to-main` change, leaving these four.

- **#1 (roborev auto-review claim):** Stop claiming reviews run automatically after every commit. Reword the "Code review with roborev" section and PR-feedback step so reviews are described as invoked explicitly at the defined gates (proposal design-review, end-of-implementation `roborev refine`, and explicit `roborev review`), noting that worktree commits are not auto-queued. Correct the `commit-review-cycle` spec accordingly, including the `.roborev.toml` value (`post_commit_review = "commit"`, not `true`). No hook/config change.
- **#2 (Conventional Commits rationale):** Keep requiring Conventional Commits on every commit, but correct the justification — per-commit types aid review scoping and readability; the release-bump *functional* requirement attaches to the squash-merge PR title, not the individual commits.
- **#3 (`git rebase -i`):** Replace the interactive squash in PR feedback with a non-interactive squash (soft-reset to the merge-base, then a single commit) before `git push --force-with-lease`, preserving the review-history remap.
- **#6 (proposal human-approval gate):** Add an explicit human-approval step after a proposal's design review passes cleanly and before the `proposal/<change-name>` branch fast-forward merges to `main`, consistent with the implementation gate.
- **#7 (`/opsx:verify` as the first end-of-implementation gate step):** Add `/opsx:verify` as the first step of the end-of-implementation gate — before the test suite, `roborev refine`, and human approval — so the implementation is confirmed to match the change artifacts (proposal/design/specs/tasks) before any review or PR work. This is a **hard gate**: if `/opsx:verify` reports the implementation does not match the artifacts, halt and resolve the mismatch before proceeding. Reword `CLAUDE.md`'s "Implementation Completion" section and add an `implementation-completion-gate` delta requirement.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `commit-review-cycle`: the "roborev post-commit and post-rewrite hooks are installed" requirement asserts the post-commit hook triggers a review after every commit (false — empty stub; worktree commits not auto-queued), and the roborev-config requirement states `post_commit_review = true` (actual: `"commit"`). Reword both to describe explicit review invocation at the defined gates and match the real config value. (#1)
- `conventional-commits`: the "All commits MUST follow Conventional Commits format" requirement implies the per-commit type is the load-bearing release input; clarify that per-commit types aid review scoping/readability and the squash-merge PR title is what release-please parses. (#2)
- `pr-workflow`: the "PR review feedback commits follow a lightweight review path" requirement specifies `git rebase -i` (replace with a non-interactive squash), and the "Proposing reviews the proposal on a branch before merging it to main" requirement has no human-approval step before the fast-forward merge (add one). (#3, #6)
- `implementation-completion-gate`: the gate currently begins with the test suite and `roborev refine` with no artifact-coherence check; add a requirement that `/opsx:verify` runs first as a hard gate, halting on any mismatch between the implementation and the change artifacts before tests/refine/approval proceed. (#7)

## Impact

- `CLAUDE.md` — Code-review section, Conventional Commits rationale, PR-feedback squash step, Spec-Driven-Design/proposal-gate prose, and the "Implementation Completion" end-of-implementation gate reworded. No `STACK.md` change (stack-agnostic kernel rules).
- `openspec/specs/commit-review-cycle/spec.md`, `openspec/specs/conventional-commits/spec.md`, `openspec/specs/pr-workflow/spec.md` — requirement reword via delta. `openspec/specs/implementation-completion-gate/spec.md` — new `/opsx:verify` hard-gate requirement via delta.
- No change to `.githooks/`, `.roborev.toml`, `scripts/`, or any runtime code. Documentation/spec only.
