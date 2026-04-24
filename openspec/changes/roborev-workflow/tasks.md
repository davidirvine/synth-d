## 1. Install and Configure roborev

- [ ] 1.1 Verify roborev is installed (`roborev version`); if not, install via `brew install roborev-dev/tap/roborev` or curl installer
- [ ] 1.2 Run `roborev init` in the repository root to install post-commit and post-rewrite git hooks
- [ ] 1.3 Verify hooks exist at `.git/hooks/post-commit` and `.git/hooks/post-rewrite`
- [ ] 1.4 Create `.roborev.toml` at the repository root with `agent = "claude-code"`, `post_commit_review = true`, and `auto_close_passing_reviews = true`
- [ ] 1.5 Run `npx prettier --write .roborev.toml` to format the config file

## 2. Verify stax is Ready

- [ ] 2.1 Verify stax is installed (`stax --version`); if not, install it
- [ ] 2.2 Confirm the stax Claude Code skill is available and loaded

## 3. Update CLAUDE.md — Commit Cadence

- [ ] 3.1 Update the "Committing changes" section in `CLAUDE.md` to state that commits are made after every individual task step (not after section completion)
- [ ] 3.2 Run `npx prettier --write CLAUDE.md`

## 4. Update CLAUDE.md — Section Completion Gate

- [ ] 4.1 Update the "Section Completion" table in `CLAUDE.md` to add the roborev requirement: all sections require all roborev reviews to pass (via `roborev refine`) in addition to existing test suite gates
- [ ] 4.2 Add a note that `roborev status` must be verified before running `roborev refine` at a section boundary
- [ ] 4.3 Run `npx prettier --write CLAUDE.md`

## 5. Update CLAUDE.md — Stacked PR Workflow

- [ ] 5.1 Add a new "Stacked PRs" section to `CLAUDE.md` describing the section boundary workflow: refine → human checkpoint → squash → stax PR
- [ ] 5.2 Specify that one stacked PR is created per section (all 1.x tasks = one PR, all 2.x = one PR, etc.)
- [ ] 5.3 Specify that all git interactions use stax
- [ ] 5.4 Run `npx prettier --write CLAUDE.md`

## 6. Update CLAUDE.md — Branching Rules

- [ ] 6.1 Update the "Branching" section in `CLAUDE.md` to include `bugfix/<change-name>` as a valid branch prefix alongside `feature/<change-name>`
- [ ] 6.2 Add a rule that the human must be prompted for change type (feature or bugfix) before any branch is created, so the correct prefix is applied
- [ ] 6.3 Run `npx prettier --write CLAUDE.md`

## 7. Verify the Workflow End-to-End

- [ ] 7.1 Make a test commit and verify the roborev post-commit hook fires (check `roborev tui` for a queued review)
- [ ] 7.2 Verify `roborev status` reports the daemon as healthy
- [ ] 7.3 Confirm `roborev refine --help` is available and lists expected flags
