## ADDED Requirements

### Requirement: Proposing reviews the proposal on a branch before merging it to main

`/opsx:propose` SHALL create the OpenSpec change artifacts on a dedicated proposal branch named `proposal/<change-name>`, cut from `main`, and commit them as a single commit with the message `chore(openspec): propose <change-name>`. A roborev design review SHALL run on the proposal branch, and SHALL pass cleanly — with all findings resolved, exactly as code reviews must pass — before the proposal is merged to `main`. Once the design review passes, the `proposal/<change-name>` branch SHALL be fast-forward merged to `main` and deleted. Proposing SHALL NOT create any `feature/` or `bugfix/` branch and SHALL NOT prompt for the change type — implementation-branch creation and the change-type prompt belong to `/opsx-apply-wt` (see "User is prompted for change type before branch creation" and "Branches are cut from main"). The proposal commit SHALL use the `chore` Conventional Commit type so it produces no release version bump.

#### Scenario: Proposal artifacts are committed and reviewed on a dedicated branch

- **WHEN** `/opsx:propose <change-name>` completes generating the proposal artifacts
- **THEN** the artifacts under `openspec/changes/<change-name>/` are committed on a `proposal/<change-name>` branch cut from `main`
- **THEN** the commit message is `chore(openspec): propose <change-name>`
- **THEN** a roborev design review is run on the `proposal/<change-name>` branch

#### Scenario: Proposal merges to main only after a clean design review

- **WHEN** the roborev design review on the `proposal/<change-name>` branch still has open findings
- **THEN** the proposal is not merged to `main`

#### Scenario: Reviewed proposal fast-forwards onto main and the branch is removed

- **WHEN** the roborev design review on the `proposal/<change-name>` branch passes cleanly
- **THEN** the `proposal/<change-name>` branch is fast-forward merged to `main`
- **THEN** the `proposal/<change-name>` branch is deleted

#### Scenario: Proposing does not create an implementation branch or prompt for type

- **WHEN** `/opsx:propose <change-name>` runs
- **THEN** no `feature/<change-name>` or `bugfix/<change-name>` branch is created
- **THEN** the human is not prompted for the change type during proposing

#### Scenario: apply-wt finds the proposal on main and the implementation branch absent

- **WHEN** `/opsx-apply-wt <change-name>` is invoked after the proposal has merged to `main`
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
- **THEN** the change-type prompt is not shown, because the implementation branch is not created during proposing
