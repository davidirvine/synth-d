## MODIFIED Requirements

### Requirement: PR review feedback commits follow a lightweight review path

When addressing comments left by a human reviewer on the change's PR, the system SHALL use a lightweight review gate rather than re-running the full end-of-implementation gate:

1. Response commits are made on the change branch. Because worktree-branch commits are not auto-queued, any roborev review of a response commit is invoked explicitly (`roborev review`) when needed — there is no reliance on an automatic post-commit review firing.
2. The human reviews the response commits and any roborev findings directly — `roborev refine` is NOT run
3. On human approval, the branch is squashed non-interactively — `git reset --soft "$(git merge-base HEAD main)"` followed by a single `git commit` — and force-pushed with `git push --force-with-lease`. Interactive `git rebase -i` SHALL NOT be used. The squash commit message SHALL be the PR title (a valid Conventional Commit), since GitHub squash-merges the branch and the PR title is the release-parse input.

#### Scenario: PR feedback commits are reviewed explicitly, not via refine

- **WHEN** commits are made to address PR review comments
- **THEN** any roborev review is invoked explicitly rather than assumed to have fired automatically on commit, and `roborev refine` is NOT invoked

#### Scenario: Human approves response commits before squash

- **WHEN** the human has reviewed the response commits and any roborev findings
- **THEN** the branch is squashed non-interactively and force-pushed with `git push --force-with-lease`, with the response commits included

#### Scenario: Squash is performed without interactive git

- **WHEN** the change branch is squashed before the force-push
- **THEN** the squash is performed without `git rebase -i` (e.g., `git reset --soft "$(git merge-base HEAD main)"` followed by a single commit), so it is runnable in a non-interactive agent harness
- **THEN** the squash commit message is the PR title (a valid Conventional Commit)

#### Scenario: No downstream restack is performed

- **WHEN** the change branch is force-pushed with PR feedback changes
- **THEN** no downstream restack step is required, because no branch is stacked on this one

---

### Requirement: Proposing reviews the proposal on a branch before merging it to main

`/opsx:propose` SHALL create the OpenSpec change artifacts on a dedicated proposal branch named `proposal/<change-name>`, cut from `main`, and commit them as a single commit with the message `chore(openspec): propose <change-name>`. A roborev design review SHALL run on the proposal branch, and SHALL pass cleanly — with all findings resolved, exactly as code reviews must pass — before the proposal is merged to `main`. After the design review passes cleanly, the result SHALL be presented to the human and explicit human approval SHALL be obtained before the proposal is merged to `main`; a clean review alone SHALL NOT trigger the merge. Once the design review passes and the human approves, the `proposal/<change-name>` branch SHALL be fast-forward merged to `main` and deleted. Proposing SHALL NOT create any `feature/` or `bugfix/` branch and SHALL NOT prompt for the change type — implementation-branch creation and the change-type prompt belong to `/opsx-apply-wt` (see "User is prompted for change type before branch creation" and "Branches are cut from main"). The proposal commit SHALL use the `chore` Conventional Commit type so it produces no release version bump.

#### Scenario: Proposal artifacts are committed and reviewed on a dedicated branch

- **WHEN** `/opsx:propose <change-name>` completes generating the proposal artifacts
- **THEN** the artifacts under `openspec/changes/<change-name>/` are committed on a `proposal/<change-name>` branch cut from `main`
- **THEN** the commit message is `chore(openspec): propose <change-name>`
- **THEN** a roborev design review is run on the `proposal/<change-name>` branch

#### Scenario: Proposal merges to main only after a clean design review

- **WHEN** the roborev design review on the `proposal/<change-name>` branch still has open findings
- **THEN** the proposal is not merged to `main`

#### Scenario: Clean design review still waits for human approval

- **WHEN** the roborev design review on the `proposal/<change-name>` branch passes cleanly but the human has not approved the merge
- **THEN** the proposal is not merged to `main`, and the review result is presented to the human for a merge decision

#### Scenario: Reviewed and approved proposal fast-forwards onto main and the branch is removed

- **WHEN** the roborev design review on the `proposal/<change-name>` branch passes cleanly **and** the human has explicitly approved the merge
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
