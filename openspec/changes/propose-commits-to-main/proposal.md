## Why

The workflow kernel contradicts itself about when the implementation branch is born. `CLAUDE.md`'s Branching section says branches "MUST be created from `main` at the time `/opsx:propose` is invoked," while the Worktree Workflow section and `scripts/opsx-apply-worktree.sh` require the proposal to already be on `main` and create the `feature/`|`bugfix/` branch themselves at `/opsx-apply-wt` time. Following the Branching section makes an agent commit the proposal onto a premature branch instead of `main`, which then collides with the apply-wt script's two preflight checks (proposal-not-on-main, branch-already-exists). This already happened on the `delay-mix-knob-first` proposal. There is also no documented commit convention for the proposal commit, so it can land with the wrong Conventional Commit type (e.g. a `feat` commit that contains only proposal artifacts).

## What Changes

- Resolve the contradiction: `/opsx:propose` commits the proposal artifacts directly to `main` and does **not** create any branch. The `feature/`|`bugfix/` branch is created only by `/opsx-apply-wt`, which is also where the human is prompted for the change type.
- Document the proposal-commit convention: proposal artifacts are committed to `main` as `chore(openspec): propose <change-name>`.
- Update `CLAUDE.md` so the Branching section no longer instructs branch creation at propose time, and so the change-type prompt is tied to worktree creation rather than to proposing.
- Out of scope (possible follow-up): hardening `scripts/opsx-apply-worktree.sh` to detect a stray proposal-only branch and print realign-to-main guidance. This change fixes the rules that cause the mistake; the script already fails safely (just with a generic message).

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `pr-workflow`: the "User is prompted for change type before branch creation" requirement conflates proposing with branch creation; reword so the prompt and branch creation both occur at `/opsx-apply-wt` time. Add a requirement that `/opsx:propose` commits the proposal to `main` as `chore(openspec): propose <change-name>` and creates no branch.

## Impact

- `openspec/specs/pr-workflow/spec.md` — one requirement reworded, one requirement added (via delta).
- `CLAUDE.md` — Branching section rewritten; proposal-commit convention documented. No `STACK.md` change (these are stack-agnostic kernel rules).
- No code change. `scripts/opsx-apply-worktree.sh` is intentionally left untouched in this change.
