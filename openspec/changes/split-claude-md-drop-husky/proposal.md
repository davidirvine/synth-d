## Why

The agent-workflow process defined in this repo (spec-driven design, worktrees, conventional commits, stax-managed PRs, roborev reviews) is genuinely portable, but three pieces of debt currently couple it to this specific synth project and to a half-finished branch-model migration:

1. `.stax.toml` still declares `trunk = "develop"`, `.husky/pre-push` references a `ci-develop.yml` workflow that no longer exists, and two live specs (`conventional-commits`, `release-management`) still describe the obsolete `develop→main` promote/backmerge workflow — even though the `develop` branch was dropped on 2026-05-02 in favor of trunk-based main. The `drop-develop-branch` migration missed `conventional-commits` entirely and left both specs' Purpose prose stale.
2. `CLAUDE.md` interleaves stack-agnostic process rules (spec-first, branching, conventional commits, completion gate, stax mandate) with synth-specific rules (the svelte/js/css/faust lint table, the faustwasm minification gotcha, the vitest/stryker/playwright test commands, the audio-verification gate). A reader cannot tell which rules are universal and which are project-local.
3. Git hooks are wired through husky, which assumes a Node toolchain. Any future non-JS consumer of this workflow can't adopt the hooks without rewriting them.

This proposal finishes the trunk-drift cleanup, splits the workflow kernel from the project-specific rules via a `@./STACK.md` import, and replaces husky with plain `.githooks/` + `core.hooksPath`. It is a prerequisite to a follow-up proposal (in a new repo) that extracts the workflow as a reusable GitHub template — that extraction is **out of scope here**.

## What Changes

- Update `.stax.toml` `trunk` from `"develop"` to `"main"`.
- Remove the stale `# ... mirrors .github/workflows/ci-develop.yml` comment from the pre-push hook (the workflow is `ci-main.yml`).
- Update `.claude/settings.local.json` permission patterns that reference `.husky/pre-push` to use the new `.githooks/pre-push` path.
- Finish the trunk-drift cleanup in the two live specs the migration missed:
  - `openspec/specs/conventional-commits/spec.md`: remove the obsolete "Promote PR title encodes the highest-priority commit type" requirement, add a requirement describing the trunk-based behavior (each feature/bugfix branch squash-merges to `main`; the PR title is the conventional commit release-please parses), and correct the Purpose/description prose that still references the `develop→main` promote workflow.
  - `openspec/specs/release-management/spec.md`: correct the one stale Purpose sentence that still mentions "a backmerge PR returning the version bump to `develop`" (its requirements were already migrated by `drop-develop-branch`; only the Purpose prose is stale).
- Split `CLAUDE.md`:
  - `CLAUDE.md` retains: Spec Driven Design, Branching, Worktree Workflow, Code review with roborev, Committing Changes & Conventional Commits, Implementation Completion **structure** (the gate, not the specific test commands), Pull Requests / stax mandate.
  - New `STACK.md` (repo root, sibling to `CLAUDE.md`) holds: the Linting and Formatting table, the Build Configuration / faustwasm minification section, the specific test commands at the completion gate (`npx vitest run`, `npx stryker run`, `npx playwright test`), and the "audio verification" bullet under Feature-level verification.
  - `CLAUDE.md` ends with a `## Project-specific rules` section containing `@./STACK.md` so Claude Code inlines `STACK.md`'s content at load time. Behavior for current contributors is unchanged.
- Move git hooks from `.husky/` to `.githooks/`:
  - Move `pre-commit`, `post-commit`, `post-rewrite`, `pre-push` preserving contents and executable bit (minus the stale ci-develop.yml comment removed above).
  - Add a `postinstall` script in `package.json` that runs `git config core.hooksPath .githooks` (idempotent; guarded to be a no-op when `.git` is absent, so CI installs don't fail).
  - Remove `husky` from `package.json` devDependencies and remove any `prepare: "husky"` script.
  - Update `package-lock.json` to reflect the removal.
  - Delete the `.husky/` directory.
- Update any hook-path references inside `STACK.md`'s Feature-level verification text from `.husky/pre-push` to `.githooks/pre-push`.

**Explicitly out of scope (deferred to separate proposals):**

- Creating the template repo itself.
- Migrating any in-repo Claude skills to user-global.
- Changes to product code under `src/` or `faust/`.
- CI workflow changes beyond the pre-push comment fix.

## Capabilities

### New Capabilities

- `workflow-kernel-structure`: Defines the convention that `CLAUDE.md` contains only stack-agnostic process rules, project-specific rules live in `STACK.md` at the repo root, and `CLAUDE.md` composes them via an `@./STACK.md` import so a Claude Code session loads both as one effective ruleset.
- `local-git-hooks`: Defines that git hooks live in `.githooks/`, are activated for every clone via a `postinstall` script that sets `core.hooksPath`, and that the repository carries no dependency on husky or any other JS-toolchain-tied hook framework.

### Modified Capabilities

- `conventional-commits`: The obsolete `develop→main` promote-PR model is removed and replaced with the trunk-based model where each feature/bugfix branch squash-merges to `main` and its PR title is the conventional commit release-please parses for the version bump.

The other trunk-drift fixes (`.stax.toml`, pre-push comment, settings.local.json hook paths, and `release-management`'s Purpose sentence) correct stale config and prose without changing any spec's stated requirements. `release-management`'s requirements were already migrated by `drop-develop-branch`, so it is not a Modified Capability — only its Purpose prose needs a direct edit. Existing specs (`commit-review-cycle`, `stacked-pr-workflow`, `ci-pipeline`) do not describe husky as a mechanism, so the husky→`.githooks/` move is also a mechanism change with no requirement delta.

## Impact

- **Config files:** `.stax.toml`, `.husky/pre-push` (deleted), `.claude/settings.local.json`.
- **Specs:** `openspec/specs/conventional-commits/spec.md` (requirement delta + Purpose prose), `openspec/specs/release-management/spec.md` (Purpose prose only).
- **Workflow docs:** `CLAUDE.md` (shrinks), new `STACK.md` at repo root.
- **Build/dependency:** `package.json` (husky removed, postinstall added), `package-lock.json`.
- **Filesystem layout:** `.husky/` deleted, `.githooks/` created with four hooks.
- **Contributor onboarding:** Anyone with a fresh clone must run `npm install` once for hooks to activate (was already required for husky; mechanism changes, requirement does not).
- **No runtime impact** on the application (`src/`, `faust/`, `public/`, `dist/`).
- **No CI workflow file changes** beyond fixing the stale comment in the pre-push hook.
- **Behaviorally identical hooks:** the same scripts run on the same events; only their on-disk location and activation mechanism change.
