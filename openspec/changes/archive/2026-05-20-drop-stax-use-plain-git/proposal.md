## Why

The project's worktree-per-change workflow cuts every branch from `main` in its own isolated worktree and opens exactly one PR per change. That structure makes branch-on-branch stacking impossible by construction, so stax's core value — dependent stacks, bottom-up merges, downstream restacking — is unreachable here. What remains is a mandated tool whose `restack`/`cascade`/`sync --restack` machinery is dead weight, whose "raw git is FORBIDDEN" rule causes friction, and whose stale section-level stacked-PR spec now contradicts the single-PR-per-branch reality already documented in `CLAUDE.md`.

## What Changes

- Replace stax with plain `git` + `gh` for all branch creation, push, sync, and PR operations across the workflow rules.
- Rewrite `CLAUDE.md`'s Pull Requests and Worktree Workflow sections to use `git`/`gh`; **remove the "raw git commands … are FORBIDDEN" mandate**.
- Rewrite the `stacked-pr-workflow` capability to describe a single PR per `feature/`/`bugfix/` branch using plain git + gh — dropping the "each section maps to one stacked PR" requirement and the downstream-restack PR-feedback path.
- Reframe the `section-review-gate` capability around the single end-of-implementation gate (matching `CLAUDE.md`): remove the "refine runs at section boundaries" requirement, remove stax / stacked-PR references, and rename the capability to `implementation-completion-gate`.
- Simplify `scripts/opsx-apply-worktree.sh` to create the branch with `git branch <branch> main` (no checkout), removing the `stax create` call and the switch-back-to-main dance it forces.
- Remove the `.claude/skills/stax` skill directory and `.stax.toml`.
- Clean up the two stax-related auto-memory notes (`feedback_stax_git.md`, `feedback_stax_trunk_drift.md`) and their `MEMORY.md` index lines.

No user-visible application behavior changes; this is a tooling/process change (`chore`).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `stacked-pr-workflow`: Replace section-level stacked PRs and the stax mandate with a single-PR-per-branch workflow driven by plain `git` + `gh`. Drop the per-section PR requirement, the squash-preserves-review-history-through-stax-rewrite requirement framing, and the downstream-restack feedback path (no downstream exists).
- `section-review-gate`: Reframe around the single end-of-implementation gate — remove "refine runs at section boundaries", remove `stax`/"stacked PR" references, and target the human-approval-then-PR step at the single per-branch PR opened via `gh`. Capability renamed to `implementation-completion-gate` at archive.

## Impact

- **Docs / rules**: `CLAUDE.md` (Pull Requests, Worktree Workflow sections), `STACK.md` (verify no stax references remain).
- **Scripts**: `scripts/opsx-apply-worktree.sh`, `.claude/commands/opsx-apply-wt.md` (drops the `stax create` description).
- **Removed files**: `.claude/skills/stax/` (skill + references), `.stax.toml`.
- **Specs**: `openspec/specs/stacked-pr-workflow/spec.md` (→ `pr-workflow`), `openspec/specs/section-review-gate/spec.md` (→ `implementation-completion-gate`).
- **Memory**: `feedback_stax_git.md`, `feedback_stax_trunk_drift.md`, `MEMORY.md` index.
- **Dependencies**: stax CLI is no longer required to follow the workflow. No application/runtime dependency change.
