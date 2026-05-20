## MODIFIED Requirements

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
