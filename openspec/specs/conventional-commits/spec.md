# Conventional Commits

## Purpose

Conventional Commits is a load-bearing convention in this repository: each feature/bugfix branch is squash-merged to `main` as a single PR, and the PR title's commit type becomes the squash commit message that release-please parses for the version bump on `main`. This capability defines the required commit message format and how the squash-merged PR title derives the release version bump.
## Requirements
### Requirement: All commits MUST follow Conventional Commits format

Every commit on a feature or bugfix branch SHALL follow the Conventional Commits specification. Per-commit types are required for review scoping and history readability — they keep each roborev review contextual and make the branch history legible — but they are NOT the release input: each feature/bugfix branch is squash-merged to `main` as a single PR, and only the PR title becomes the squash commit message on `main` that release-please parses for version bump type. Commit types in use: `feat` (minor bump), `fix` (patch bump), `chore` / `docs` / `refactor` / `test` (no bump).

#### Scenario: Feature commit format

- **WHEN** a commit introduces new user-visible functionality
- **THEN** the commit message MUST begin with `feat:` or `feat(<scope>):`

#### Scenario: Bug fix commit format

- **WHEN** a commit corrects incorrect behaviour without adding new functionality
- **THEN** the commit message MUST begin with `fix:` or `fix(<scope>):`

#### Scenario: Non-releasable commit format

- **WHEN** a commit covers tooling, documentation, refactoring, or test changes with no user-visible behaviour change
- **THEN** the commit message MUST begin with `chore:`, `docs:`, `refactor:`, or `test:`

#### Scenario: Per-commit type does not drive the release bump

- **WHEN** a feature/bugfix branch with a mix of commit types is squash-merged to `main`
- **THEN** release-please parses only the squash-merge PR title for the version bump
- **THEN** the individual per-commit types on the branch do not affect the bump

#### Scenario: CLAUDE.md documents the requirement

- **WHEN** a contributor reads the Committing Changes section of CLAUDE.md
- **THEN** the section states that every commit must follow Conventional Commits format for review scoping and readability
- **THEN** it explains that the version bump is driven by the squash-merge PR title, not by the individual per-commit types

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

