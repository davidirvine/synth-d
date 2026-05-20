# Commit Review Cycle

## Purpose

Define how roborev code reviews are triggered and tracked across the commit lifecycle: which git hooks are installed, how the repository is configured to use Claude Code as the review agent, how reviews are invoked at the workflow's defined gates (rather than relied upon to fire automatically per commit), and the per-task commit cadence that keeps reviews scoped and contextual.
## Requirements
### Requirement: roborev post-commit and post-rewrite hooks are installed

The system SHALL have roborev post-commit and post-rewrite hooks installed in the repository via `roborev init`. The post-rewrite hook SHALL remap review history when commit SHAs change (e.g., during squash or rebase). The post-commit hook is a stub and SHALL NOT be relied upon to trigger a review on its own: roborev review queueing is daemon-based, and because `core.hooksPath` is shared across worktrees, commits on `feature/`/`bugfix/` worktree branches are not auto-queued. Reviews SHALL therefore be invoked explicitly at the defined gates — the proposal design review on the `proposal/<change-name>` branch (`/roborev-design-review-branch`), the end-of-implementation `roborev refine`, and explicit `roborev review` / `roborev tui` — rather than assumed to fire automatically after each commit.

#### Scenario: Reviews are invoked explicitly at the defined gates

- **WHEN** a review is required (proposal design review, the end-of-implementation gate, or addressing open findings)
- **THEN** it is invoked explicitly — `/roborev-design-review-branch`, `roborev refine`, or `roborev review` — rather than assumed to have fired automatically on commit

#### Scenario: Worktree-branch commits are not auto-queued

- **WHEN** a commit is created on a `feature/`/`bugfix/` branch inside a worktree
- **THEN** no review is guaranteed to be enqueued by the post-commit hook, and an explicit `roborev review` is used when a review of that commit is needed

#### Scenario: Post-rewrite hook remaps reviews after squash

- **WHEN** commits are squashed and SHAs change
- **THEN** roborev remaps existing review results to the new SHAs so no reviews are orphaned

---

### Requirement: roborev is configured to use Claude Code as the review agent

The repository SHALL contain a `.roborev.toml` file at the root that sets `agent = "claude-code"`, sets `post_commit_review = "commit"`, and sets `auto_close_passing_reviews = true`.

#### Scenario: Agent config is respected

- **WHEN** `roborev review` is triggered
- **THEN** the review is performed by Claude Code as the configured agent

#### Scenario: Passing reviews are auto-closed

- **WHEN** a review result is Pass
- **THEN** the review is automatically closed in the ledger

### Requirement: Commits are created after every individual task step

The system SHALL commit changes after every individual task step (e.g., step 1.1, 1.2) rather than waiting until an entire section is complete. Each commit SHALL correspond to one completed task step.

#### Scenario: Step commit is created before moving to next step

- **WHEN** a task step is completed
- **THEN** a commit is created before work begins on the next step

