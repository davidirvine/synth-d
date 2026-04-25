## Why

The current development workflow lacks automated code review, resulting in issues that surface only at human review or post-merge. Introducing roborev AI review after every commit and structured stacked PRs per section creates a tighter feedback loop and ensures quality gates are met incrementally rather than all at once at the end.

## What Changes

- **Commit cadence**: Commit after every individual task step (not after an entire section)
- **Post-commit review**: roborev post-commit and post-rewrite hooks trigger async AI code review after every commit
- **Section boundary gate**: When all tasks in a section are complete (all 1.x, all 2.x, etc.), run `roborev refine` to resolve all open review findings before proceeding
- **Human checkpoint**: A mandatory human review of roborev refine results is required before squashing and creating a PR
- **Stacked PRs**: One stacked PR per section, created via stax after human approval and commit squash
- **stax for all git interactions**: Replace ad-hoc git commands with stax for branch and PR management
- **Test suite gates unchanged**: vitest, stryker, and playwright requirements per section remain in force; roborev is an additional gate

## Capabilities

### New Capabilities

- `commit-review-cycle`: Post-commit roborev review hook fires after every commit; findings accumulate asynchronously until addressed
- `section-review-gate`: At section boundary, `roborev refine` iterates auto-fix until all branch reviews pass, followed by a mandatory human checkpoint
- `stacked-pr-workflow`: Each completed section is squashed and pushed as a stacked PR via stax

### Modified Capabilities

- `testing`: Section completion now also requires all roborev reviews to pass (in addition to existing test suite requirements)

## Impact

- `CLAUDE.md`: Commit cadence, section completion criteria, and PR workflow rules updated
- `.roborev.toml`: New per-repo roborev configuration file
- `.husky/` or git hooks: post-commit and post-rewrite hooks installed via `roborev init`
- stax: Required to be installed and used for all branch and PR operations
- roborev: Required to be installed; configured to use Claude Code as the review agent
