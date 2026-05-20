## Why

The workflow kernel contradicts itself about when the implementation branch is born. `CLAUDE.md`'s Branching section says branches "MUST be created from `main` at the time `/opsx:propose` is invoked," while the Worktree Workflow section and `scripts/opsx-apply-worktree.sh` require the proposal to already be on `main` and create the `feature/`|`bugfix/` branch themselves at `/opsx-apply-wt` time. Following the Branching section makes an agent commit the proposal onto a premature branch instead of `main`, which then collides with the apply-wt script's two preflight checks (proposal-not-on-main, branch-already-exists). This already happened on the `delay-mix-knob-first` proposal. There is also no documented commit convention for the proposal commit, so it can land with the wrong Conventional Commit type (e.g. a `feat` commit that contains only proposal artifacts).

Separately, proposals reach `main` with **no review gate**. Code must pass a roborev review before it merges, but a proposal — the design that all the code follows — can land on `main` unreviewed. A flawed design therefore propagates into implementation before anyone catches it. The proposal deserves the same "review must pass cleanly before merge" posture as code, which means it must live on a branch long enough to be reviewed.

## What Changes

- Resolve the contradiction **and** add a design-review gate. `/opsx:propose` creates a dedicated `proposal/<change-name>` branch from `main`, commits the proposal artifacts there as `chore(openspec): propose <change-name>`, and runs a roborev **design review** on that branch. The proposal is merged to `main` (fast-forward) only once the design review passes cleanly — the same gate posture as code reviews. Proposing does **not** create a `feature/`|`bugfix/` branch and does **not** prompt for the change type; both belong to `/opsx-apply-wt`.
- Use a dedicated `proposal/` branch prefix, distinct from the implementation `feature/`|`bugfix/` prefixes, so apply-wt's preflight checks (proposal-on-main, implementation-branch-absent) and the change-type-at-apply-wt rule are unaffected.
- Merge the reviewed proposal to `main` with a local fast-forward — no PR for the proposal. The roborev design review is the gate; ff-merge keeps the literal `chore(openspec): propose` commit on `main` so `release-please` sees a no-bump commit.
- Document the proposal-commit convention: proposal artifacts are committed as `chore(openspec): propose <change-name>`.
- Update `CLAUDE.md` so the Branching section no longer instructs implementation-branch creation at propose time, documents the `proposal/` branch + design-review gate, and ties the change-type prompt to worktree creation rather than to proposing.
- Out of scope (possible follow-up): hardening `scripts/opsx-apply-worktree.sh` to detect a stray proposal-only `feature/`|`bugfix/` branch and print realign-to-main guidance. This change fixes the rules that cause the mistake; the script already fails safely (just with a generic message).

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `pr-workflow`: the "User is prompted for change type before branch creation" requirement conflates proposing with branch creation; reword so the prompt and implementation-branch creation both occur at `/opsx-apply-wt` time. Add a requirement that `/opsx:propose` commits the proposal to a dedicated `proposal/<change-name>` branch as `chore(openspec): propose <change-name>`, runs a roborev design review on it, and merges to `main` only after that review passes cleanly.

## Impact

- `openspec/specs/pr-workflow/spec.md` — one requirement reworded, one requirement added (via delta).
- `CLAUDE.md` — Branching section rewritten; proposal branch + design-review gate + commit convention documented. No `STACK.md` change (these are stack-agnostic kernel rules).
- No code change. `scripts/opsx-apply-worktree.sh` is intentionally left untouched in this change.
