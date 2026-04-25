## 1. Install and Configure roborev

- [x] 1.1 Verify roborev is installed (`roborev version`); if not, install via `brew install roborev-dev/tap/roborev` or curl installer
- [x] 1.2 Run `roborev init` to generate hook scripts in `.git/hooks/post-commit` and `.git/hooks/post-rewrite`
- [x] 1.3a Copy the generated hook content from `.git/hooks/post-commit` → `.husky/post-commit` and `.git/hooks/post-rewrite` → `.husky/post-rewrite`; run `chmod +x .husky/post-commit .husky/post-rewrite`; verify both `.husky/` files are non-empty before proceeding
- [x] 1.3b Only after confirming both `.husky/` files are correct and non-empty, delete `.git/hooks/post-commit` and `.git/hooks/post-rewrite`
- [x] 1.4 Create `.roborev.toml` at the repository root with `agent = "claude-code"`, `post_commit_review = "commit"`, and `auto_close_passing_reviews = true`
- [x] 1.5 Install prettier-plugin-toml as a dev dependency (`npm install -D prettier-plugin-toml`) and add `"prettier-plugin-toml"` to the plugins array in `.prettierrc`
- [x] 1.6 Run `npx prettier --write .roborev.toml` to format the config file

- [x] 1.7 Commit all new and modified files from section 1: `.husky/post-commit`, `.husky/post-rewrite`, `.roborev.toml`, `.prettierrc`, `package.json`, `package-lock.json`

## 2. Verify stax is Ready

- [x] 2.1 Verify stax is installed (`stax --version`); if not, install it
- [x] 2.2 Confirm the stax Claude Code skill is available and loaded
- [x] 2.3 Create or update `.stax.toml` at the repo root with `trunk = "develop"` to configure develop as the trunk branch; verify with `stax ls` that the stack is rooted under develop

## 3. Update CLAUDE.md — Commit Cadence

- [x] 3.1 Update the "Committing changes" section in `CLAUDE.md` to state that commits are made after every individual task step (not after section completion)
- [x] 3.2 Run `npx prettier --write CLAUDE.md`

## 4. Update CLAUDE.md — Section Completion Gate

- [x] 4.1 Update the "Section Completion" table in `CLAUDE.md` to add the roborev requirement: all sections require all roborev reviews to pass (via `roborev refine --max-iterations 3`) in addition to existing test suite gates
- [x] 4.2 Add a note that `roborev status` must be verified before running `roborev refine` at a section boundary, and document what to do if the 3-iteration limit is exhausted (present remaining findings to human; human decides whether to retry, fix manually, or override)
- [x] 4.3 Add a `*.toml` row to the "Linting and Formatting" table in `CLAUDE.md`: command is `npx prettier --write <file>`
- [x] 4.4 Run `npx prettier --write CLAUDE.md`

## 5. Update CLAUDE.md — Stacked PR Workflow

- [x] 5.1 Add a new "Stacked PRs" section to `CLAUDE.md` describing the section boundary workflow: `roborev refine --max-iterations 3` → human checkpoint → squash all section commits with `git rebase -i` → `stax ss --yes --no-prompt` to push and create the stacked PR
- [x] 5.2 Specify that one stacked PR is created per section (all 1.x tasks = one PR, all 2.x = one PR, etc.)
- [x] 5.3 Specify that all git interactions use stax
- [x] 5.4 Add a "PR Feedback" subsection to `CLAUDE.md` documenting the lightweight path: response commits trigger post-commit review (no refine), human reviews findings directly, squash+force-push (`git rebase -i` to squash + `stax ss --yes --no-prompt` to push), then `stax sync --restack` to sync trunk and restack all downstream section branches
- [x] 5.5 Run `npx prettier --write CLAUDE.md`

## 6. Update CLAUDE.md — Branching Rules and Worktree Workflow

- [x] 6.1 Update the "Branching" section in `CLAUDE.md` to include `bugfix/<change-name>` as a valid branch prefix alongside `feature/<change-name>`
- [x] 6.2 Add a rule that the human must be prompted for change type (feature or bugfix) before any branch is created, so the correct prefix is applied
- [x] 6.3 Add a "Worktree Workflow" rule to `CLAUDE.md`: the `develop` branch is reserved for OpenSpec and tooling work; all change implementation happens in an isolated worktree created by `/opsx-apply-wt`; once in the worktree, `/opsx:apply` kicks off implementation
- [x] 6.4 Run `npx prettier --write CLAUDE.md`
- [x] 6.5 Commit `CLAUDE.md` with all changes from sections 3–6

## 7. Update opsx-apply-wt Command and Script

- [x] 7.1 Update `.claude/commands/opsx-apply-wt.md` to prompt the user for change type (feature or bugfix) before creating the branch, and pass the chosen prefix to the script
- [x] 7.2 Update `scripts/opsx-apply-worktree.sh` to accept an optional second argument `<prefix>` (default: `feature`): change the arg guard from `[[ $# -ne 1 ]]` to `[[ $# -lt 1 || $# -gt 2 ]]`; construct `BRANCH="${PREFIX}/${CHANGE_NAME}"`; replace the `git worktree add -b $BRANCH` call with `stax create $CHANGE_NAME --prefix "${PREFIX}/"` (creates branch with stax tracking while on develop) followed by `git worktree add $WORKTREE_PATH $BRANCH` (attaches the worktree to the stax-created branch)
- [x] 7.3 Update the conflict-detection and error messages in `scripts/opsx-apply-worktree.sh` to reference the dynamic branch name rather than the hardcoded `feature/` prefix
- [x] 7.3b Run `npx vitest run` and confirm all tests pass before committing
- [x] 7.4 Commit `.claude/commands/opsx-apply-wt.md` and `scripts/opsx-apply-worktree.sh`

## 8. Verify the Workflow End-to-End

- [x] 8.1 Make a test commit and verify the roborev post-commit hook fires (check `roborev tui` for a queued review)
- [x] 8.2 Verify `roborev status` reports the daemon as healthy
- [x] 8.3 Confirm `roborev refine --help` is available and lists expected flags
- [ ] 8.4 Run `/opsx-apply-wt` on a test change and verify the change-type prompt appears, the correct branch prefix is used, and `stax ls` shows the new branch tracked under `develop`
