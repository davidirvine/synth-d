## ADDED Requirements

### Requirement: Plain git and gh are used for all branch and PR interactions

The system SHALL use plain `git` for branch creation, switching, rebasing, and pushing, and the `gh` CLI for PR creation, review, and merge. There SHALL be no requirement to use stax or any stacked-branch tool. `gh` SHALL be treated as a required tool for the PR workflow.

#### Scenario: Branch created with git

- **WHEN** a new feature or bugfix branch is needed
- **THEN** the branch is created from `main` with `git` (e.g., `git branch feature/<change> main` or `git switch -c feature/<change> main`)

#### Scenario: PR submitted with gh

- **WHEN** a change branch is ready for review
- **THEN** the branch is pushed with `git push -u origin HEAD` and the PR is created with `gh pr create --fill --base main`

#### Scenario: No stacked-branch tooling is required

- **WHEN** any branch, push, sync, or PR operation is performed
- **THEN** it is expressible in plain `git` + `gh`, and no stax command or `.stax.toml` configuration is required

### Requirement: A single PR is opened per change branch

The system SHALL open exactly one PR per `feature/`/`bugfix/` branch, targeting `main`, after the end-of-implementation gate passes. The system SHALL NOT open per-section PRs and SHALL NOT stack one change's PR on another change's unmerged branch.

#### Scenario: One PR per branch targeting main

- **WHEN** the implementation of a change is complete and the end-of-implementation gate has passed
- **THEN** a single PR for the whole branch is opened via `gh` with `main` as the base

#### Scenario: No per-section PRs

- **WHEN** a section of tasks is completed mid-implementation
- **THEN** no PR is opened for that section; work continues on the same branch until the whole change is complete

## REMOVED Requirements

### Requirement: Each section maps to one stacked PR

**Reason**: The worktree-per-change workflow opens a single PR per branch (already mandated by `CLAUDE.md`). Branches are cut from `main` in isolated worktrees and are never stacked, so section-level stacked PRs cannot occur.

**Migration**: Open one PR per change branch via `gh` after the single end-of-implementation gate (see "A single PR is opened per change branch"). Commits are squashed at merge time via the squash-merge of the PR, which provides the conventional-commit title release-please parses.

### Requirement: stax is used for all git branch and PR interactions

**Reason**: stax exists to manage stacked branches; this workflow has no stacks. Its branch/PR commands are replaced by plain `git` + `gh`.

**Migration**: Use `git` for branch/push operations and `gh` for PR operations (see "Plain git and gh are used for all branch and PR interactions"). The `.claude/skills/stax` skill and `.stax.toml` are removed.

## MODIFIED Requirements

### Requirement: PR review feedback commits follow a lightweight review path

When addressing comments left by a human reviewer on the change's PR, the system SHALL use a lightweight review gate rather than re-running the full end-of-implementation gate:

1. Response commits are made on the change branch; the roborev post-commit hook fires and queues async reviews as normal
2. The human reviews the response commits and any roborev findings directly — `roborev refine` is NOT run
3. On human approval, the branch is squashed (`git rebase -i`) and force-pushed with `git push --force-with-lease`

#### Scenario: PR feedback commits trigger post-commit review but not refine

- **WHEN** commits are made to address PR review comments
- **THEN** roborev post-commit review fires asynchronously, but `roborev refine` is NOT invoked

#### Scenario: Human approves response commits before squash

- **WHEN** the human has reviewed the response commits and any roborev findings
- **THEN** the branch is squashed and force-pushed with `git push --force-with-lease`, with the response commits included

#### Scenario: No downstream restack is performed

- **WHEN** the change branch is force-pushed with PR feedback changes
- **THEN** no downstream restack step is required, because no branch is stacked on this one

### Requirement: roborev post-rewrite hook preserves review history through squash

When a change branch's commits are squashed, the roborev post-rewrite hook SHALL remap all associated reviews to the new squash SHA so that the review record for the branch remains intact and visible.

#### Scenario: Reviews remain accessible after squash

- **WHEN** a change branch's commits are squashed into one commit
- **THEN** roborev reviews for the original commits are remapped to the squash SHA and remain queryable
