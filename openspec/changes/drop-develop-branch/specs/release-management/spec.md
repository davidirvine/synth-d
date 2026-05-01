## REMOVED Requirements

### Requirement: Backmerge PR opens automatically after every release
**Reason:** The `develop` branch is being removed as part of the trunk-based migration. There is no second branch to backmerge into, so the backmerge step is no longer applicable.
**Migration:** Delete the `backmerge` job from `.github/workflows/release-please.yml`. The release-please job and the deploy job remain unchanged.

## MODIFIED Requirements

### Requirement: release-please target-branch matches the workflow trigger branch

The `release-please` GitHub Actions workflow SHALL pass `target-branch: main` to `googleapis/release-please-action` so the action operates on the same branch the workflow's `push` trigger fires on. The `target-branch` input MUST NOT be omitted, because the action falls back to the repository's default branch when omitted; even though `main` is the post-migration default branch, explicit `target-branch: main` makes the workflow robust against future default-branch changes.

#### Scenario: target-branch is set to main in the workflow

- **WHEN** `.github/workflows/release-please.yml` is loaded
- **THEN** the `googleapis/release-please-action` step's `with:` block contains `target-branch: main`

#### Scenario: release-please run on push to main operates on main

- **WHEN** a commit is pushed to `main` and the `release-please` job runs
- **THEN** the action logs report `targetBranch: main`

#### Scenario: gated deploy runs after release-please succeeds

- **WHEN** the `release-please` job sets `release_created == 'true'` on a push to `main`
- **THEN** the `deploy` job in the same workflow runs and publishes `dist/` to the `gh-pages` branch root
