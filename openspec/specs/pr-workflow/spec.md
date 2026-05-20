# PR Workflow

## Purpose

Define the per-change branch and PR workflow used by humans and AI agents on this project: how branches are named and based, how OpenSpec proposals are tracked, and how a single PR per feature/bugfix gets merged after the implementation gate. The workflow uses isolated worktrees and plain `git` + `gh` so that one human and one AI can collaborate without stepping on each other's work.

## Requirements

### Requirement: User is prompted for change type before branch creation

When a new change is proposed, the system SHALL prompt the human to identify the type of change (feature or bugfix) before creating the branch. The branch name prefix SHALL be constructed from the human's answer: `feature/<change-name>` for features, `bugfix/<change-name>` for bug fixes.

#### Scenario: Feature change produces feature/ prefix

- **WHEN** the human identifies the change as a feature
- **THEN** the branch is created with the `feature/` prefix (e.g., `feature/add-oscillator`)

#### Scenario: Bug fix change produces bugfix/ prefix

- **WHEN** the human identifies the change as a bug fix
- **THEN** the branch is created with the `bugfix/` prefix (e.g., `bugfix/fix-filter-cutoff`)

#### Scenario: Branch creation is blocked until type is confirmed

- **WHEN** a new change is being set up and the change type has not been confirmed
- **THEN** the branch is not created and implementation does not begin

---

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

---

### Requirement: A single PR is opened per change branch

The system SHALL open exactly one PR per `feature/`/`bugfix/` branch, targeting `main`, after the end-of-implementation gate passes. The system SHALL NOT open per-section PRs and SHALL NOT stack one change's PR on another change's unmerged branch.

#### Scenario: One PR per branch targeting main

- **WHEN** the implementation of a change is complete and the end-of-implementation gate has passed
- **THEN** a single PR for the whole branch is opened via `gh` with `main` as the base

#### Scenario: No per-section PRs

- **WHEN** a section of tasks is completed mid-implementation
- **THEN** no PR is opened for that section; work continues on the same branch until the whole change is complete

---

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

---

### Requirement: roborev post-rewrite hook preserves review history through squash

When a change branch's commits are squashed, the roborev post-rewrite hook SHALL remap all associated reviews to the new squash SHA so that the review record for the branch remains intact and visible.

#### Scenario: Reviews remain accessible after squash

- **WHEN** a change branch's commits are squashed into one commit
- **THEN** roborev reviews for the original commits are remapped to the squash SHA and remain queryable

---

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
