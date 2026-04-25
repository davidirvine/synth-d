# Commit Review Cycle

## Requirements

### Requirement: roborev post-commit and post-rewrite hooks are installed

The system SHALL have roborev post-commit and post-rewrite hooks installed in the repository via `roborev init`. The post-commit hook SHALL trigger an asynchronous AI code review after every commit. The post-rewrite hook SHALL remap review history when commit SHAs change (e.g., during squash or rebase).

#### Scenario: Post-commit hook triggers review

- **WHEN** a commit is created on any feature branch
- **THEN** roborev enqueues a review job for that commit within the local ledger

#### Scenario: Post-rewrite hook remaps reviews after squash

- **WHEN** commits are squashed and SHAs change
- **THEN** roborev remaps existing review results to the new SHAs so no reviews are orphaned

---

### Requirement: roborev is configured to use Claude Code as the review agent

The repository SHALL contain a `.roborev.toml` file at the root that sets `agent = "claude-code"`, enables `post_commit_review = true`, and sets `auto_close_passing_reviews = true`.

#### Scenario: Agent config is respected

- **WHEN** `roborev review` is triggered
- **THEN** the review is performed by Claude Code as the configured agent

#### Scenario: Passing reviews are auto-closed

- **WHEN** a review result is Pass
- **THEN** the review is automatically closed in the ledger

---

### Requirement: Commits are created after every individual task step

The system SHALL commit changes after every individual task step (e.g., step 1.1, 1.2) rather than waiting until an entire section is complete. Each commit SHALL correspond to one completed task step.

#### Scenario: Step commit is created before moving to next step

- **WHEN** a task step is completed
- **THEN** a commit is created before work begins on the next step
