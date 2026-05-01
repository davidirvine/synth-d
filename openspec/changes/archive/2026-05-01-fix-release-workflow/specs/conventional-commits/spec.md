## ADDED Requirements

### Requirement: All commits MUST follow Conventional Commits format
Every commit on a feature or bugfix branch SHALL follow the Conventional Commits specification. The type prefix is load-bearing: the promote workflow reads commit types from the develop→main diff to determine the promote PR title, which becomes the squash commit message on `main` that release-please parses for version bump type. Commit types in use: `feat` (minor bump), `fix` (patch bump), `chore` / `docs` / `refactor` / `test` (no bump).

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
- **THEN** the section explicitly states the conventional commits format requirement and explains that commit type drives the version bump through the promote PR title

### Requirement: Promote PR title encodes the highest-priority commit type
The promote workflow SHALL inspect the commits in `develop` that are not present in `main`, determine the highest-priority conventional commit type (`feat` > `fix` > any other), and use that type as the prefix of the promote PR title.

#### Scenario: Promote PR title set to feat when feat commits are present
- **WHEN** the `develop..main` diff contains one or more `feat:` commits
- **THEN** the promote PR title MUST begin with `feat:`

#### Scenario: Promote PR title set to fix when only fix commits are present
- **WHEN** the `develop..main` diff contains `fix:` commits and no `feat:` commits
- **THEN** the promote PR title MUST begin with `fix:`

#### Scenario: Promote PR title set to chore when no releasable commits are present
- **WHEN** the `develop..main` diff contains no `feat:` or `fix:` commits
- **THEN** the promote PR title MUST begin with `chore:`

#### Scenario: Existing promote PR title updated on new develop push
- **WHEN** a new commit is pushed to `develop` after the promote PR already exists
- **THEN** the promote PR title is updated to reflect the current highest-priority type
