## 1. Finish trunk-drift cleanup in live config

- [x] 1.1 Change `.stax.toml` from `trunk = "develop"` to `trunk = "main"`; commit (`fix(stax): point trunk at main`).
- [x] 1.2 Update the two `.husky/pre-push` permission patterns in `.claude/settings.local.json` from `.husky/pre-push` to `.githooks/pre-push` (anticipating step 3.1's directory move); commit (`fix(claude): retarget hook-edit permissions at .githooks`). NOTE: file is gitignored and lives only in the main repo; updated in place — no commit possible.
- [x] 1.3 Smoke-verify: run `stax status` (no trunk errors) and confirm `.claude/settings.local.json` parses as valid JSON.

## 2. Finish trunk-drift cleanup in the two stale specs

- [x] 2.1 In `openspec/specs/conventional-commits/spec.md`, apply the delta from `specs/conventional-commits/spec.md`: replace the obsolete "Promote PR title encodes the highest-priority commit type" requirement and its four scenarios with the new "Squash-merged PR title drives the release version bump" requirement; update the "All commits MUST follow Conventional Commits format" description and the "CLAUDE.md documents the requirement" scenario to reference the squash-merged PR title instead of the promote workflow.
- [x] 2.2 Fix the `conventional-commits` Purpose prose (line ~5): replace the `develop→main` promote-PR framing with the trunk-based squash-merge framing (direct edit; archive does not migrate Purpose).
- [x] 2.3 Fix the `release-management` Purpose prose (line ~5): remove the "and a backmerge PR returning the version bump to `develop`" clause; the requirements are already correct, so make no requirement-level change.
- [x] 2.4 Run `openspec validate split-claude-md-drop-husky` and confirm it still passes with the conventional-commits delta included.
- [x] 2.5 Lint and format both touched specs: `npx prettier --write openspec/specs/conventional-commits/spec.md openspec/specs/release-management/spec.md`.
- [x] 2.6 Commit (`fix(specs): finish develop→main migration in conventional-commits and release-management`).

## 3. Split CLAUDE.md into kernel + STACK.md

- [x] 3.1 Create `STACK.md` at the repo root with the preamble identifying it as project-specific stack rules imported by `CLAUDE.md`, then carve in the following sections moved verbatim out of `CLAUDE.md`: the Linting and Formatting table, the Build Configuration section (faustwasm minification gotcha), and the specific test commands now living at the completion gate.
- [x] 3.2 Move the "audio verification" bullet from `CLAUDE.md`'s Feature-level verification list into `STACK.md`; restructure `STACK.md`'s "Feature-level verification" subsection so it lists the stack-specific checks that compose with `CLAUDE.md`'s human-approval gate.
- [x] 3.3 In `CLAUDE.md`, remove the sections moved to `STACK.md`; replace the specific test commands inside "Implementation Completion" with a stack-agnostic reference ("see STACK.md for project-specific test commands"); keep the rest of the file structure intact.
- [x] 3.4 Append `## Project-specific rules` as the final section of `CLAUDE.md` with the body being exactly `@./STACK.md`.
- [x] 3.5 Add a one-line preamble at the top of `CLAUDE.md` stating that stack-specific rules belong in `STACK.md`.
- [x] 3.6 Lint and format both files: `npx prettier --write CLAUDE.md STACK.md`.
- [x] 3.7 Smoke-verify: open `CLAUDE.md` and confirm `@./STACK.md` is the final line of content; open `STACK.md` and confirm all three migrated sections are present.
- [x] 3.8 Commit (`refactor(docs): split CLAUDE.md into kernel + STACK.md`).

## 4. Move hooks from .husky/ to .githooks/

- [x] 4.1 Create `.githooks/` and copy `.husky/{pre-commit,post-commit,post-rewrite,pre-push}` into it preserving executable bits (`cp -p`). Verify mode bits with `ls -l .githooks/`.
- [x] 4.2 In `.githooks/pre-push`, delete the comment line that references the dead `ci-develop.yml` workflow; replace with a comment pointing at `ci-main.yml` instead.
- [x] 4.3 Delete the `.husky/` directory entirely.
- [x] 4.4 Commit the directory move (`refactor(hooks): move .husky/ to .githooks/ and drop ci-develop.yml ref`).

## 5. Replace husky with the postinstall hook-activation script

- [x] 5.1 Create `scripts/install-hooks.sh` matching the shape from `design.md` Decision 3: idempotent, no-op when not in a git work tree, logs once to stderr when it sets `core.hooksPath`. Make it executable.
- [x] 5.2 Update `package.json`: remove `husky` from `devDependencies`; remove any `prepare: "husky"` script; add `"postinstall": "sh scripts/install-hooks.sh"`.
- [x] 5.3 Run `npm install` to regenerate `package-lock.json` reflecting the husky removal; commit lockfile alongside `package.json`.
- [x] 5.4 Verify activation end-to-end: `git config --unset core.hooksPath` then `rm -rf node_modules && npm install` then `git config --get core.hooksPath` returns `.githooks`. Re-run `npm install` and confirm the second run does not re-log activation (idempotency).
- [x] 5.5 Verify hook firing: make a trivial commit and confirm `roborev` queues a review (post-commit fires); run `git push --dry-run` against origin and confirm the pre-push script runs the CI parity checks.
- [x] 5.6 Commit (`refactor(hooks): drop husky in favor of .githooks/ + postinstall activation`).

## 6. Update STACK.md hook-path references

- [x] 6.1 In `STACK.md`'s Feature-level verification subsection, update the `.husky/pre-push` path reference to `.githooks/pre-push`.
- [x] 6.2 Grep the entire repo for any remaining `.husky` references in tracked, non-archive files: `grep -rn "\.husky" --include="*.md" --include="*.json" --include="*.toml" --include="*.yml" .` — verify only expected matches remain (the only acceptable matches are archived openspec changes).
- [x] 6.3 Lint and format: `npx prettier --write STACK.md`.
- [x] 6.4 Commit (`docs(stack): update hook-path references to .githooks/`).

## 7. End-of-implementation gate

- [x] 7.1 Run `npx vitest run` — verify pass.
- [x] 7.2 Run `npx stryker run` — verify mutation score ≥ 85%.
- [x] 7.3 Run `npx playwright test` — verify pass.
- [x] 7.4 Run `roborev status` to confirm the daemon is healthy. If it is not running, halt and report to the human; do not skip the review gate.
- [x] 7.5 Run `roborev refine --max-iterations 3` to resolve all open review findings on the branch.
- [x] 7.6 Present refine results and any remaining findings to the human; wait for explicit human approval before proceeding to PR.
- [x] 7.7 On approval, push and open the PR with `stax ss --yes --no-prompt`. PR title must use conventional-commit `fix:` prefix (per `design.md` Decision 6) and a concise description.
