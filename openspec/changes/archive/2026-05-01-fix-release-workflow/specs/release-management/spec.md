## ADDED Requirements

### Requirement: Backmerge PR opens automatically after every release
After release-please cuts a release (`release_created = true`), the release-please workflow SHALL automatically open a pull request merging `main` back into `develop` so the version bump commit does not cause conflicts on the next promote cycle.

#### Scenario: Backmerge PR opened after release
- **WHEN** release-please sets `release_created = true`
- **THEN** a pull request is opened with base `develop` and head `main`
- **THEN** the PR title references the released tag (e.g., `chore: backmerge release v1.2.0 to develop`)

#### Scenario: Backmerge PR not duplicated
- **WHEN** a backmerge PR from the same release already exists
- **THEN** no second PR is opened; the existing PR is left unchanged
