## MODIFIED Requirements

### Requirement: All commits MUST follow Conventional Commits format
Every commit on a feature or bugfix branch SHALL follow the Conventional Commits specification. The type prefix is load-bearing: each feature/bugfix branch is squash-merged to `main` as a single PR, and the PR title becomes the squash commit message on `main` that release-please parses for version bump type. Commit types in use: `feat` (minor bump), `fix` (patch bump), `chore` / `docs` / `refactor` / `test` (no bump).

#### Scenario: Feature commit format
- **WHEN** a commit introduces new user-visible functionality
- **THEN** the commit message MUST begin with `feat:` or `feat(<scope>):`

#### Scenario: Bug fix commit format
- **WHEN** a commit corrects incorrect behaviour without adding new functionality
- **THEN** the commit message MUST begin with `fix:` or `fix(<scope>):`

#### Scenario: Non-releasable commit format
- **WHEN** a commit covers tooling, documentation, refactoring, or test changes with no user-visible behaviour change
- **THEN** the commit message MUST begin with `chore:`, `docs:`, `refactor:`, or `test:`

#### Scenario: CLAUDE.md documents the requirement
- **WHEN** a contributor reads the Committing Changes section of CLAUDE.md
- **THEN** the section explicitly states the conventional commits format requirement and explains that commit type drives the version bump through the squash-merged PR title

## REMOVED Requirements

### Requirement: Promote PR title encodes the highest-priority commit type
**Reason:** The `develop→main` promote workflow was eliminated by the `drop-develop-branch` migration (2026-05-02). There is no promote PR and no `develop..main` diff to inspect; feature/bugfix branches squash-merge directly to `main`.
**Migration:** The PR title of each feature/bugfix branch is authored as a Conventional Commit and becomes the squash commit on `main` that release-please parses. See the added "Squash-merged PR title drives the release version bump" requirement.

## ADDED Requirements

### Requirement: Squash-merged PR title drives the release version bump
Each feature/bugfix branch SHALL be squash-merged to `main` as a single PR. The PR title MUST be a valid Conventional Commit, and it becomes the squash commit message on `main` that release-please parses to determine the version bump. The PR author SHALL set the title's type to reflect the highest-impact change on the branch, in priority order `feat` > `fix` > `chore`/`docs`/`refactor`/`test`.

#### Scenario: Feature PR title triggers minor bump
- **WHEN** a branch's PR title begins with `feat:` or `feat(<scope>):`
- **THEN** the squash commit on `main` begins with `feat:`
- **THEN** release-please proposes a minor version bump

#### Scenario: Fix PR title triggers patch bump
- **WHEN** a branch's PR title begins with `fix:` and the branch contains no feature work
- **THEN** the squash commit on `main` begins with `fix:`
- **THEN** release-please proposes a patch version bump

#### Scenario: Non-releasable PR title triggers no bump
- **WHEN** a branch's PR title begins with `chore:`, `docs:`, `refactor:`, or `test:`
- **THEN** the squash commit on `main` carries that type
- **THEN** release-please proposes no version bump
