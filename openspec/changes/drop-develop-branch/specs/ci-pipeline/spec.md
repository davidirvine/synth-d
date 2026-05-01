## REMOVED Requirements

### Requirement: PRs to develop run tests, lint, and format checks
**Reason:** The `develop` branch is being removed as part of the trunk-based migration. PRs no longer target develop because develop no longer exists.
**Migration:** All quality checks previously enforced on PRs to develop (`npx vitest run`, `npx playwright test`, `npx eslint .`, `npx prettier --check .`) are migrated to PRs to `main`. See the MODIFIED `Requirement: PRs to main run tests, lint, and format checks` below.

## MODIFIED Requirements

### Requirement: PRs to main run tests, lint, and format checks
The CI pipeline SHALL run automated quality checks on every pull request targeting the `main` branch, including unit tests, e2e tests, lint, and format checks. All checks MUST pass before the PR can be merged.

#### Scenario: PR to main passes all checks
- **WHEN** a pull request targeting `main` is opened or updated
- **THEN** the CI workflow runs `npx vitest run`, `npx playwright test`, `npx eslint .`, and `npx prettier --check .`
- **THEN** all four checks pass with exit code 0
- **THEN** the PR status checks show green

#### Scenario: PR to main fails unit tests
- **WHEN** a pull request targeting `main` is opened or updated and `npx vitest run` exits non-zero
- **THEN** the CI workflow reports a failed status check
- **THEN** the PR cannot be merged until tests pass

#### Scenario: PR to main fails e2e tests
- **WHEN** a pull request targeting `main` is opened or updated and `npx playwright test` exits non-zero
- **THEN** the CI workflow reports a failed status check
- **THEN** the PR cannot be merged until e2e tests pass

#### Scenario: PR to main fails lint
- **WHEN** a pull request targeting `main` is opened or updated and `npx eslint .` exits non-zero
- **THEN** the CI workflow reports a failed status check
- **THEN** the PR cannot be merged until the failure is resolved

#### Scenario: PR to main fails formatting
- **WHEN** a pull request targeting `main` is opened or updated and `npx prettier --check .` exits non-zero
- **THEN** the CI workflow reports a failed status check
- **THEN** the PR cannot be merged until the failure is resolved
