# Local Git Hooks

## Purpose

Repository git hooks are managed as version-controlled scripts under `.githooks/`, activated via `core.hooksPath` by an idempotent postinstall script. This replaces the prior `husky`-based setup, removes the husky dependency, and lets roborev-managed hooks coexist in the same directory. This capability defines where hooks live, how they are activated, and how they interoperate with roborev.

## Requirements

### Requirement: Git hooks live in .githooks/ at the repo root

All repository git hooks SHALL be tracked-in-git files under the `.githooks/` directory at the repository root. The directory SHALL contain at least the hooks the workflow requires: `pre-commit`, `post-commit`, `post-rewrite`, and `pre-push`. Each hook file SHALL be executable (Unix mode bit set). The `.husky/` directory SHALL NOT exist in the repository.

#### Scenario: Hook files are version-controlled

- **WHEN** a contributor clones the repository
- **THEN** the working tree contains `.githooks/pre-commit`, `.githooks/post-commit`, `.githooks/post-rewrite`, and `.githooks/pre-push`
- **THEN** each file is marked executable by git
- **THEN** there is no `.husky/` directory present

#### Scenario: Hook script contents are identical to the prior husky-managed hooks

- **WHEN** the workflow runs the pre-push hook
- **THEN** the same checks execute as ran under `.husky/pre-push` previously (eslint, prettier --check, conditional faust:build, vitest, playwright)
- **THEN** no stale references to `ci-develop.yml` or any other dead workflow file remain in hook comments

### Requirement: core.hooksPath is configured to .githooks via a postinstall script

The repository SHALL contain a hook-activation script at `scripts/install-hooks.sh` that sets `git config core.hooksPath` to `.githooks` when run from a git work tree. The script SHALL be idempotent (re-running it produces no change) and SHALL be a safe no-op when invoked outside a git work tree (such as in a tarball install or a CI container without a git directory). The `package.json` `scripts.postinstall` field SHALL invoke this script so that running `npm install` activates hooks automatically. The repository SHALL NOT declare `husky` as a dependency in `package.json`.

#### Scenario: Fresh clone activates hooks via npm install

- **WHEN** a contributor clones the repository and runs `npm install`
- **THEN** `postinstall` executes `scripts/install-hooks.sh`
- **THEN** `git config --get core.hooksPath` returns `.githooks`
- **THEN** a subsequent `git commit` fires `.githooks/post-commit` (queueing the roborev review)
- **THEN** a subsequent `git push` fires `.githooks/pre-push` (running the CI parity checks)

#### Scenario: Re-running npm install is safe

- **WHEN** `npm install` is run a second time after `core.hooksPath` is already set to `.githooks`
- **THEN** the postinstall script detects the existing setting and makes no change
- **THEN** the install completes with no error

#### Scenario: postinstall is a no-op without a git work tree

- **WHEN** `npm install` runs in an environment that has no `.git` directory and `git rev-parse --git-dir` fails (e.g., a tarball install, a container without git state)
- **THEN** `scripts/install-hooks.sh` exits cleanly without attempting to set `core.hooksPath`
- **THEN** the install completes with no error

#### Scenario: husky is absent

- **WHEN** `package.json` and `package-lock.json` are inspected
- **THEN** neither file declares `husky` as a dependency
- **THEN** no `prepare: "husky"` (or similar husky-invoking) script appears in `package.json`

### Requirement: roborev-managed hooks coexist with the local hooks directory

`roborev init` writes the `post-commit` and `post-rewrite` hooks into the directory referenced by `core.hooksPath`. After this migration, that directory SHALL be `.githooks/`, and the roborev-managed hook scripts SHALL be version-controlled inside `.githooks/` alongside the other hooks. Re-running `roborev init` SHALL be safe — it MAY overwrite the existing files with its current canonical content, and that is acceptable.

#### Scenario: roborev hooks are present in .githooks/

- **WHEN** the repository is inspected after this change lands
- **THEN** `.githooks/post-commit` exists and contains the roborev post-commit hook script
- **THEN** `.githooks/post-rewrite` exists and contains the roborev post-rewrite hook script

#### Scenario: Re-running roborev init is non-destructive in spirit

- **WHEN** a contributor runs `roborev init` after this change has landed
- **THEN** the hooks under `.githooks/` may be regenerated from roborev's current canonical templates
- **THEN** no separate husky-managed copy is created
