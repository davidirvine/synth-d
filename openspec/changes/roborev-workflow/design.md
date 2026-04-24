## Context

The project uses OpenSpec spec-driven development with a section-based task structure (sections 1–16, tasks numbered 1.1, 1.2, 2.1, etc.). The current workflow commits once per section and has no automated code review. Git interactions are done ad-hoc. This design integrates roborev AI review and stax stacked PRs into the development loop.

roborev is an AI code review system that installs post-commit and post-rewrite git hooks. It reviews commits asynchronously, accumulates findings in a local ledger, and exposes a `refine` command that iteratively fixes and re-reviews until all findings pass. It supports Claude Code as a review agent.

stax manages stacked git branches and PRs, with a Claude Code skill already installed in this project.

## Goals / Non-Goals

**Goals:**
- Trigger roborev review automatically after every commit via post-commit hook
- Preserve review history across squashes via post-rewrite hook
- Enforce a section boundary gate: all reviews must pass before squashing
- Require a human checkpoint after `roborev refine` completes and before squash + PR
- Create one stacked PR per section via stax
- Update CLAUDE.md to encode the new commit cadence and workflow rules
- Configure roborev to use Claude Code as the review agent

**Non-Goals:**
- Automated design file review (human-driven, out of scope)
- Pre-commit review (roborev reviews committed code, not staged changes)
- Replacing test suite gates (vitest, stryker, playwright requirements are unchanged)
- CI/CD integration (roborev GitHub Actions not in scope for this change)

## Decisions

### D1: Post-commit + post-rewrite hooks via `roborev init`

`roborev init` installs both hooks into the repo's `.git/hooks/`. The post-rewrite hook remaps review history when SHAs change during squash, ensuring reviews are not orphaned.

**Alternative considered**: Husky-managed hooks. Rejected because the project uses Husky only for pre-commit linting; roborev's own init is the supported path and handles post-rewrite automatically.

### D2: roborev refine runs only at section boundaries (not after every commit)

Reviews accumulate asynchronously during a section. `roborev refine` is invoked once when all section tasks are complete. This avoids blocking each task step on review completion and batches fixes efficiently.

**Alternative considered**: Run refine after every commit. Rejected because it would block step-by-step progress and create noise from incremental partial work.

### D3: Human checkpoint is a hard stop before squash

After `roborev refine` completes and all reviews pass, Claude presents results and waits for explicit human approval before proceeding. This is non-negotiable — squash and PR creation are never automated.

### D4: One stacked PR per section via stax

Each section's commits are squashed into a single commit and pushed as a stacked PR using stax. The section number maps directly to the stack level. stax is used for all branch creation, rebase, and PR submission.

**Alternative considered**: One PR per change (all sections combined). Rejected because stacked PRs allow earlier review of foundational sections while later sections are still in progress.

### D5: roborev configured to use Claude Code as review agent

`.roborev.toml` at the repo root sets `agent = "claude-code"` and `post_commit_review = true`. `auto_close_passing_reviews = true` keeps the ledger clean.

## Risks / Trade-offs

- **roborev refine commits additional fix commits** → These are included in the section squash; the post-rewrite hook preserves review history across the squash.
- **refine iteration limit reached before all reviews pass** → Human checkpoint surfaces this; human decides whether to retry, override, or address manually.
- **stax rebase conflicts during stack sync** → stax handles rebase; conflicts require manual resolution before proceeding.
- **roborev daemon not running** → `roborev status` can detect this; add check at section boundary before running refine.

## Migration Plan

1. Install roborev (`brew install roborev-dev/tap/roborev` or curl installer)
2. Run `roborev init` in the repo to install post-commit and post-rewrite hooks
3. Add `.roborev.toml` to the repo root with project configuration
4. Verify stax is installed and the stax skill is available
5. Update `CLAUDE.md` with new commit cadence, section boundary, and PR workflow rules
6. No rollback needed — removing hooks and reverting CLAUDE.md restores the old workflow

## Open Questions

- None — all decisions resolved during exploration.
