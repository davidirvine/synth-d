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

### D1: roborev hooks installed in Husky, not `.git/hooks/`

The project uses Husky v9, which sets `core.hooksPath = .husky/_`. This means `.git/hooks/` scripts are never executed. `roborev init` is run to generate the hook scripts, then the content is migrated to `.husky/post-commit` and `.husky/post-rewrite` so Husky's bootstrap picks them up. The `.git/hooks/` versions are deleted to avoid confusion.

**Alternative considered**: Leaving hooks in `.git/hooks/` and relying on roborev init. Rejected because Husky v9 bypasses `.git/hooks/` entirely — the hooks would silently never fire.

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

### D6: PR feedback commits use a lightweight review path

When a human reviewer leaves comments on a stacked PR, the commits addressing that feedback do not go through the full section boundary gate (`roborev refine`). Instead:

1. Response commits are made on the section branch — the post-commit hook fires and queues async roborev reviews as normal
2. The human reviews the response commits and any roborev findings directly (no automated refine cycle)
3. On human approval, the section branch is squash+force-pushed (`git rebase -i` to squash, then `stax ss` to push)
4. `stax refresh` syncs trunk and restacks all downstream section branches

**Rationale**: PR review comments are already human-vetted (the reviewer wrote them). Running a full `roborev refine` cycle — which is designed for catching issues in raw implementation commits — adds friction without proportional benefit. The post-commit review still runs; it's the automated fix-and-iterate loop that is skipped.

**Alternative considered**: Full section gate for all commits regardless of origin. Rejected as too slow for responding to small nits or clarifications on an already-reviewed PR.

## Risks / Trade-offs

- **roborev refine commits additional fix commits** → These are included in the section squash; the post-rewrite hook preserves review history across the squash.
- **refine iteration limit (3) reached before all reviews pass** → Human checkpoint surfaces remaining findings; human decides whether to retry, fix manually, or override and proceed.
- **stax rebase conflicts during `stax refresh`** → Conflicts require manual resolution before proceeding; use `stax restack --continue` after resolving.
- **roborev daemon not running** → `roborev status` can detect this; check at section boundary before running refine.

## Migration Plan

1. Install roborev (`brew install roborev-dev/tap/roborev` or curl installer)
2. Run `roborev init` to generate hook scripts in `.git/hooks/`
3. Migrate hook scripts to `.husky/post-commit` and `.husky/post-rewrite`; make executable; delete `.git/hooks/` versions
4. Add `.roborev.toml` to the repo root with project configuration; install `prettier-plugin-toml`
5. Verify stax is installed, the stax skill is available, and the trunk branch is set to `develop`
6. Update `CLAUDE.md` with new commit cadence, section boundary, PR workflow, and linting table rules
7. Update `.claude/commands/opsx-apply-wt.md` and `scripts/opsx-apply-worktree.sh` to support the change-type prompt
8. Commit all new and modified files to `develop`
9. No rollback needed — removing hooks and reverting CLAUDE.md restores the old workflow

## Open Questions

- None — all decisions resolved during exploration.
