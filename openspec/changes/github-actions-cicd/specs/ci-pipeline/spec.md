## ADDED Requirements

### Requirement: PRs to develop run tests, lint, and format checks
The CI pipeline SHALL run automated quality checks on every pull request targeting the `develop` branch. All checks MUST pass before the PR can be merged.

#### Scenario: PR to develop passes all checks
- **WHEN** a pull request targeting `develop` is opened or updated
- **THEN** the CI workflow runs `npx vitest run`, `npx eslint .`, and `npx prettier --check .`
- **THEN** all three checks pass with exit code 0
- **THEN** the PR status checks show green

#### Scenario: PR to develop fails tests
- **WHEN** a pull request targeting `develop` is opened or updated and `npx vitest run` exits non-zero
- **THEN** the CI workflow reports a failed status check
- **THEN** the PR cannot be merged until the failure is resolved

#### Scenario: PR to develop fails lint
- **WHEN** a pull request targeting `develop` is opened or updated and `npx eslint .` exits non-zero
- **THEN** the CI workflow reports a failed status check
- **THEN** the PR cannot be merged until the failure is resolved

#### Scenario: PR to develop fails formatting
- **WHEN** a pull request targeting `develop` is opened or updated and `npx prettier --check .` exits non-zero
- **THEN** the CI workflow reports a failed status check
- **THEN** the PR cannot be merged until the failure is resolved

### Requirement: PRs to main run tests including e2e
The CI pipeline SHALL run automated test checks on every pull request targeting the `main` branch, including both unit and e2e tests. All tests MUST pass before the PR can be merged. Lint and format checks are NOT required for PRs to `main`.

#### Scenario: PR to main passes all tests
- **WHEN** a pull request targeting `main` is opened or updated
- **THEN** the CI workflow runs `npx vitest run` and `npx playwright test`
- **THEN** both pass with exit code 0
- **THEN** the PR status check shows green

#### Scenario: PR to main fails unit tests
- **WHEN** a pull request targeting `main` is opened or updated and `npx vitest run` exits non-zero
- **THEN** the CI workflow reports a failed status check
- **THEN** the PR cannot be merged until tests pass

#### Scenario: PR to main fails e2e tests
- **WHEN** a pull request targeting `main` is opened or updated and `npx playwright test` exits non-zero
- **THEN** the CI workflow reports a failed status check
- **THEN** the PR cannot be merged until e2e tests pass

### Requirement: CI uses cached dependencies
The CI pipeline SHALL use `actions/setup-node` with `cache: 'npm'` for npm dependency caching, cache Faust WASM build outputs keyed on the `faust/synth.dsp` hash, and cache Playwright browser binaries keyed on the `package-lock.json` hash to minimise redundant work.

#### Scenario: npm cache hit
- **WHEN** the CI workflow runs and `package-lock.json` has not changed since the last run
- **THEN** the npm cache is restored by `actions/setup-node`
- **THEN** `npm ci` runs and completes faster due to the warm cache

#### Scenario: Playwright browser cache hit
- **WHEN** `npm ci` has completed (making `node_modules/` available) and `node_modules/@playwright/test/package.json` has not changed since the last run
- **THEN** Playwright browser binaries are restored from `~/.cache/ms-playwright`
- **THEN** `npx playwright install --with-deps` is skipped

#### Scenario: Playwright browser cache miss
- **WHEN** `npm ci` has completed and the Playwright version has changed or no browser cache entry exists
- **THEN** `npx playwright install --with-deps` runs to download browser binaries

> **Constraint:** The Playwright browser cache step MUST run after `npm ci`. If placed before, `hashFiles('node_modules/@playwright/test/package.json')` returns an empty string because `node_modules/` does not exist at checkout, silently degenerating the cache key so the cache never hits.

#### Scenario: Faust WASM cache hit
- **WHEN** the CI workflow runs and `faust/synth.dsp` has not changed since the last run
- **THEN** `public/synth.wasm`, `public/synth.js`, and `public/synth.json` are restored from cache
- **THEN** Faust is not installed and `npm run faust:build` is not executed

#### Scenario: Faust WASM cache miss
- **WHEN** the CI workflow runs and `faust/synth.dsp` has changed or no cache entry exists
- **THEN** Faust is installed via `apt-get install faust`
- **THEN** `npm run faust:build` is executed to regenerate WASM outputs

### Requirement: Only the repo owner can merge PRs to main
The branch protection on `main` SHALL require approval from the repo owner before any PR can be merged. This MUST be enforced via a `CODEOWNERS` file.

#### Scenario: PR to main requires owner review
- **WHEN** a pull request targeting `main` is opened
- **THEN** GitHub automatically requests a review from the CODEOWNERS-designated owner
- **THEN** the PR cannot be merged without that review being approved
