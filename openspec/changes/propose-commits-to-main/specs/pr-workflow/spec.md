## ADDED Requirements

### Requirement: Proposing commits the proposal to main and creates no branch

`/opsx:propose` SHALL create the OpenSpec change artifacts and commit them directly to `main` as a single commit with the message `chore(openspec): propose <change-name>`. Proposing SHALL NOT create any `feature/` or `bugfix/` branch and SHALL NOT prompt for the change type — branch creation and the change-type prompt belong to `/opsx-apply-wt` (see "User is prompted for change type before branch creation" and "Branches are cut from main"). The proposal commit SHALL use the `chore` Conventional Commit type so it produces no release version bump.

#### Scenario: Proposal artifacts are committed to main

- **WHEN** `/opsx:propose <change-name>` completes generating the proposal artifacts
- **THEN** the artifacts under `openspec/changes/<change-name>/` are committed on `main`
- **THEN** the commit message is `chore(openspec): propose <change-name>`

#### Scenario: Proposing does not create an implementation branch

- **WHEN** `/opsx:propose <change-name>` runs
- **THEN** no `feature/<change-name>` or `bugfix/<change-name>` branch is created
- **THEN** the human is not prompted for the change type during proposing

#### Scenario: apply-wt finds the proposal on main and the branch absent

- **WHEN** `/opsx-apply-wt <change-name>` is invoked after a proposal has been committed
- **THEN** the proposal exists at `openspec/changes/<change-name>/` on `main`
- **THEN** no `feature/<change-name>` or `bugfix/<change-name>` branch exists yet, so the worktree script can create it

## MODIFIED Requirements

### Requirement: User is prompted for change type before branch creation

When the implementation branch for a change is about to be created — that is, at `/opsx-apply-wt` time, not at `/opsx:propose` time — the system SHALL prompt the human to identify the type of change (feature or bugfix) before creating the branch. The branch name prefix SHALL be constructed from the human's answer: `feature/<change-name>` for features, `bugfix/<change-name>` for bug fixes.

#### Scenario: Feature change produces feature/ prefix

- **WHEN** the human identifies the change as a feature at `/opsx-apply-wt` time
- **THEN** the branch is created with the `feature/` prefix (e.g., `feature/add-oscillator`)

#### Scenario: Bug fix change produces bugfix/ prefix

- **WHEN** the human identifies the change as a bug fix at `/opsx-apply-wt` time
- **THEN** the branch is created with the `bugfix/` prefix (e.g., `bugfix/fix-filter-cutoff`)

#### Scenario: Branch creation is blocked until type is confirmed

- **WHEN** `/opsx-apply-wt` is setting up a change and the change type has not been confirmed
- **THEN** the branch is not created and implementation does not begin

#### Scenario: Proposing does not trigger the change-type prompt

- **WHEN** `/opsx:propose <change-name>` runs
- **THEN** the change-type prompt is not shown, because no branch is created during proposing
