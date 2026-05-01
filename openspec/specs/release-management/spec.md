# Release Management

## Purpose

Defines how releases are versioned, proposed, cut, deployed, and back-merged. The release pipeline is driven by `release-please` reading conventional commits on `main`; releases produce git tags, GitHub Releases with notes, gated production deployments, and a backmerge PR returning the version bump to `develop`.

## Requirements

### Requirement: Conventional commits drive automated version bumps
The release management system SHALL use `release-please` to analyse conventional commits on `main` and determine the next semantic version. The version bump type SHALL follow the Conventional Commits specification: `feat` → minor, `fix` → patch, `feat!` or `BREAKING CHANGE` → major.

#### Scenario: Feature commit triggers minor version bump
- **WHEN** one or more `feat:` commits are merged to `main`
- **THEN** release-please proposes a minor version bump (e.g. 0.1.0 → 0.2.0) in the release PR

#### Scenario: Fix commit triggers patch version bump
- **WHEN** one or more `fix:` commits are merged to `main` and no `feat:` commits are present
- **THEN** release-please proposes a patch version bump (e.g. 0.1.0 → 0.1.1) in the release PR

#### Scenario: Breaking change triggers major version bump
- **WHEN** a commit with `BREAKING CHANGE` in the footer or `!` suffix is merged to `main`
- **THEN** release-please proposes a major version bump (e.g. 0.1.0 → 1.0.0) in the release PR

### Requirement: release-please opens and maintains a Release PR
After each merge to `main`, release-please SHALL open (or update) a "Release PR" that contains the proposed version bump and changelog. The release SHALL only be cut when the owner merges this PR.

#### Scenario: Release PR opened after first qualifying commit
- **WHEN** a conventional commit is merged to `main` and no open release PR exists
- **THEN** release-please opens a new PR titled `chore(release): v<version>`
- **THEN** the PR updates `package.json` version and `CHANGELOG.md`

#### Scenario: Release PR updated on subsequent commits
- **WHEN** additional conventional commits are merged to `main` before the release PR is merged
- **THEN** release-please updates the existing release PR with the new cumulative version and changelog entries

#### Scenario: Release cut on release PR merge
- **WHEN** the owner merges the release PR into `main`
- **THEN** release-please creates a git tag `v<version>`
- **THEN** release-please creates a GitHub Release with auto-generated release notes from `CHANGELOG.md`

### Requirement: Each release produces a GitHub Release with notes
Every version tag SHALL have a corresponding GitHub Release. The release notes SHALL be generated from the conventional commit history since the previous tag and SHALL be human-readable.

#### Scenario: GitHub Release created with notes
- **WHEN** a release tag is created by release-please
- **THEN** a GitHub Release is published linked to that tag
- **THEN** the release body contains a changelog grouped by commit type (Features, Bug Fixes, etc.)
- **THEN** the release is visible in the GitHub repository's Releases page

### Requirement: package.json version is the source of truth
The `package.json` `version` field SHALL be the canonical version. release-please SHALL update this field when cutting a release. The `.release-please-manifest.json` SHALL track the current version and MUST stay in sync with `package.json`.

#### Scenario: Version field updated on release
- **WHEN** the release PR is merged
- **THEN** `package.json` `version` is updated to the new version string
- **THEN** `.release-please-manifest.json` reflects the same version

### Requirement: Backmerge PR opens automatically after every release
After release-please cuts a release (`release_created = true`), the release-please workflow SHALL automatically open a pull request merging `main` back into `develop` so the version bump commit does not cause conflicts on the next promote cycle.

#### Scenario: Backmerge PR opened after release
- **WHEN** release-please sets `release_created = true`
- **THEN** a pull request is opened with base `develop` and head `main`
- **THEN** the PR title references the released tag (e.g., `chore: backmerge release v1.2.0 to develop`)

#### Scenario: Backmerge PR not duplicated
- **WHEN** a backmerge PR from the same release already exists
- **THEN** no second PR is opened; the existing PR is left unchanged

### Requirement: release-please target-branch matches the workflow trigger branch

The `release-please` GitHub Actions workflow SHALL pass `target-branch: main` to `googleapis/release-please-action` so the action operates on the same branch the workflow's `push` trigger fires on. The `target-branch` input MUST NOT be omitted, because the action falls back to the repository's default branch when omitted, and this repository's default branch (`develop`) differs from the release branch (`main`).

#### Scenario: target-branch is set to main in the workflow

- **WHEN** `.github/workflows/release-please.yml` is loaded
- **THEN** the `googleapis/release-please-action` step's `with:` block contains `target-branch: main`

#### Scenario: release-please run on push to main operates on main

- **WHEN** a commit is pushed to `main` and the `release-please` job runs
- **THEN** the action logs report `targetBranch: main`
- **THEN** the action does not pick up release-please pull requests opened against `develop`

#### Scenario: gated deploy runs after release-please succeeds

- **WHEN** the `release-please` job sets `release_created == 'true'` on a push to `main`
- **THEN** the `deploy` job in the same workflow runs and publishes `dist/` to the `gh-pages` branch root
- **THEN** the `backmerge` job opens a PR from `main` to `develop` for the new release tag
