## ADDED Requirements

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

### Requirement: roborev post-rewrite hook preserves review history through squash
When section commits are squashed, the roborev post-rewrite hook SHALL remap all associated reviews to the new squash SHA so that the review record for the section remains intact and visible.

#### Scenario: Reviews remain accessible after squash
- **WHEN** section commits are squashed into one commit
- **THEN** roborev reviews for the original commits are remapped to the squash SHA and remain queryable
