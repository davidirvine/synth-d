# Stacked PR Workflow

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

### Requirement: Each section maps to one stacked PR

The system SHALL create one stacked PR per section via stax after human approval at the section boundary. All commits from a section (including any roborev refine fix commits) SHALL be squashed into a single commit before the PR is created.

#### Scenario: Section commits are squashed before PR creation

- **WHEN** human approves at the section boundary
- **THEN** all commits for that section are squashed into one commit

#### Scenario: Stacked PR is created for the section

- **WHEN** the section commits have been squashed
- **THEN** stax creates a stacked PR for the section on top of the previous section's PR (or base branch for section 1)

#### Scenario: PR title reflects the section

- **WHEN** a stacked PR is created for a section
- **THEN** the PR title identifies the section (e.g., "Section 1: <description>")

---

### Requirement: stax is used for all git branch and PR interactions

The system SHALL use stax for all branch creation, rebase, sync, and PR submission operations. Ad-hoc git commands for branch or PR management SHALL NOT be used.

#### Scenario: Branch created via stax

- **WHEN** a new feature branch is needed
- **THEN** stax is used to create and track the branch

#### Scenario: PR submitted via stax

- **WHEN** a section is ready for PR creation
- **THEN** stax is used to submit and manage the PR

---

### Requirement: PR review feedback commits follow a lightweight review path

When addressing comments left by a human reviewer on a stacked PR, the system SHALL use a lighter review gate than the standard section boundary workflow:

1. Response commits are made on the section branch; the roborev post-commit hook fires and queues async reviews as normal
2. The human reviews the response commits and any roborev findings directly — `roborev refine` is NOT run
3. On human approval, the section branch is squash+force-pushed (`git rebase -i` to squash, then `stax ss --yes --no-prompt` to push)
4. `stax sync --restack` syncs trunk and restacks all downstream section branches on top of the updated section

#### Scenario: PR feedback commits trigger post-commit review but not refine

- **WHEN** commits are made to address PR review comments
- **THEN** roborev post-commit review fires asynchronously, but `roborev refine` is NOT invoked

#### Scenario: Human approves response commits before squash

- **WHEN** the human has reviewed the response commits and any roborev findings
- **THEN** the section branch is squash+force-pushed with the response commits included

#### Scenario: Downstream branches rebased after section update

- **WHEN** a section branch is force-pushed with PR feedback changes
- **THEN** `stax sync --restack` is run to sync trunk and restack all downstream section branches

---

### Requirement: roborev post-rewrite hook preserves review history through squash

When section commits are squashed, the roborev post-rewrite hook SHALL remap all associated reviews to the new squash SHA so that the review record for the section remains intact and visible.

#### Scenario: Reviews remain accessible after squash

- **WHEN** section commits are squashed into one commit
- **THEN** roborev reviews for the original commits are remapped to the squash SHA and remain queryable
