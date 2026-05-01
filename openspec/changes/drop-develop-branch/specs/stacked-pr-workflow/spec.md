## ADDED Requirements

### Requirement: Branches are cut from main

The system SHALL create all `feature/*` and `bugfix/*` worktree branches from `main`. The `develop` branch SHALL NOT be used as a base branch and SHALL NOT exist after the migration. All change implementation worktrees SHALL be sibling worktrees branched from main, and their PRs SHALL target main.

#### Scenario: New worktree is created from main

- **WHEN** `/opsx-apply-wt <change-name>` is invoked for a new change
- **THEN** the worktree is created on a branch cut from `main` (e.g., `feature/<change-name>` based on `main`)
- **THEN** the worktree's branch tracks main as its upstream base for rebases and PRs

#### Scenario: PR from worktree targets main

- **WHEN** a worktree branch is ready for review
- **THEN** the PR is opened with `main` as the base branch
- **THEN** no intermediate `develop` branch is involved in the PR flow

#### Scenario: develop branch does not exist post-migration

- **WHEN** the workflow is operating after the drop-develop-branch migration completes
- **THEN** there is no `develop` branch in the repository (local or remote)
- **THEN** any tooling that previously referenced `develop` as a base branch references `main` instead
