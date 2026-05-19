## Context

The workflow defined in `CLAUDE.md` plus the `.claude/{commands,skills}/` directories is the value the operator wants to make portable. Today that workflow has three sources of friction that obstruct portability:

- **Trunk drift.** The repository migrated to trunk-based main on 2026-05-02 (`drop-develop-branch` change archived). That migration updated most specs and tooling but missed several spots: `.stax.toml` (still `trunk = "develop"`), the `.husky/pre-push` comment (still references the dead `ci-develop.yml` workflow), `.claude/settings.local.json` permission patterns, the entire `conventional-commits` spec (the migration never created a delta for it, so it still describes the obsolete `develop→main` promote PR), and the Purpose prose of `release-management` (the archive applies requirement deltas but not Purpose edits, so the "backmerge to develop" sentence survived even though the Backmerge requirement was correctly removed). These misses don't break runtime behavior today, but they will surface as bugs the moment someone follows `.stax.toml`, the pre-push hook, or those specs as a source of truth.
- **Kernel/stack entanglement.** `CLAUDE.md` reads as one document but contains two distinct kinds of rules: process rules that apply to any Claude-Code project (spec-first, branching, worktrees, conventional commits, stax-only PRs, completion gate, roborev) and stack-specific rules that apply only to this Svelte/Vite/FAUST synth (lint table, faustwasm minification gotcha, vitest/stryker/playwright test commands, audio-verification gate). A future template repo needs the first set and only the first set.
- **JS-toolchain coupling.** Hooks are wired via husky, which installs through a `prepare` script during `npm install`. That coupling is invisible while the only consumer is this Node project, but it blocks any future Python/Rust/Go consumer of the workflow.

Constraints that shape the solution:

- **Behavior preservation for current contributors.** A developer on `bugfix/split-claude-md-drop-husky` after this lands should see no change in day-to-day commands. The same hooks fire on the same events; `CLAUDE.md` still effectively reads the same rules.
- **Claude Code @-import semantics.** Claude Code resolves `@<relative-path>` references in `CLAUDE.md` by inlining the referenced file's content into the loaded context. That is the lever we use to split CLAUDE.md without splitting the LLM-visible ruleset.
- **roborev hook installation is separate from husky.** `roborev init` installs the `post-commit` and `post-rewrite` hooks via its own mechanism (referenced in `commit-review-cycle/spec.md`). Husky is used here only as the wrapper that pins `core.hooksPath` to `.husky/`. Removing husky therefore must preserve roborev's hooks while introducing our own activation step.

## Goals / Non-Goals

**Goals:**

- Finish the trunk-drift cleanup everywhere the `drop-develop-branch` migration missed: `.stax.toml`, the pre-push hook, `.claude/settings.local.json`, and the two stale specs (`conventional-commits`, `release-management`) — so every live source of truth agrees on trunk-based main.
- Make `CLAUDE.md` a stack-agnostic workflow kernel that is, on its own, a copy-paste-ready starting point for any future Claude-Code project, while keeping the LLM-visible ruleset identical via `@./STACK.md`.
- Remove the husky dependency so the hook activation mechanism is just `git config core.hooksPath .githooks`, which works for any project regardless of language toolchain.
- Keep the contributor flow on this repo unchanged: one `npm install` after clone, then every commit/push runs the same hooks as before.

**Non-Goals:**

- Creating, scaffolding, or testing a template repository. That is a follow-up proposal in a different repo.
- Migrating skills from `.claude/skills/` to user-global. That's a separate cost/benefit question.
- Touching product code under `src/`, `faust/`, `public/`, or any non-workflow CI yml.

## Decisions

### Decision 1: Split via `@./STACK.md` import, not by maintaining two parallel documents

`CLAUDE.md` will end with a `## Project-specific rules` section whose body is exactly `@./STACK.md`. Claude Code inlines the import at load time, so the LLM still sees one continuous ruleset; the on-disk layout is the only thing that changes.

**Alternatives considered:**

- *Single CLAUDE.md with marked sections.* Easier to read at a glance, but extraction to a template means hand-editing every time the boundary moves. The marker erodes.
- *`.claude/stack/{lint,tests,build}.md` with multiple imports.* Over-modularized for the current size. Three imports for three short sections is fragmentation without benefit.
- *Project-specific rules embedded inline with HTML comments delimiting kernel vs stack.* Same erosion problem as marked sections, plus harder to author.

The import wins because the file boundary is what the future template-extraction step needs anyway, and Claude Code's `@`-resolution makes the split free from the LLM's perspective.

### Decision 2: `STACK.md` at the repo root, not under `.claude/`

It lives next to `CLAUDE.md` so the relationship is obvious and `CLAUDE.md` can import it with a clean relative path. `.claude/` is for Claude-Code-mechanism files (skills, commands, settings); `STACK.md` is a project-rules document at the same level as `CLAUDE.md`.

### Decision 3: Hooks live in `.githooks/`, activated via a `postinstall` script

Switch from husky to plain `.githooks/` plus `git config core.hooksPath .githooks`. Activation happens through a `postinstall` script in `package.json` that runs the config command idempotently. The script must be a no-op when `.git` is absent (CI containers without a git work tree, tarball installs) and when `core.hooksPath` is already set to `.githooks/`.

**Why a `postinstall` script rather than asking contributors to run a setup step manually?** Manual setup is a contributor footgun; husky exists precisely because manual hook installation is forgotten. We keep the same one-step activation but drop the husky dependency.

**Why not `lefthook` or `pre-commit`?** They reintroduce a dependency (lefthook is a Go binary; pre-commit is Python) and a config language for hooks we already write as plain shell. The whole point of this change is to make the hooks stack-neutral. A plain `.githooks/` directory wins.

**Activation script shape:**

```sh
#!/usr/bin/env sh
# package.json: "postinstall": "sh scripts/install-hooks.sh"
if [ -d .git ] || git rev-parse --git-dir >/dev/null 2>&1; then
  current=$(git config --get core.hooksPath || true)
  if [ "$current" != ".githooks" ]; then
    git config core.hooksPath .githooks
  fi
fi
```

The script lives at `scripts/install-hooks.sh` for symmetry with the existing `scripts/opsx-*-worktree.sh` family. Inline-in-`package.json` was considered and rejected: shell escaping into JSON makes the guard logic illegible.

### Decision 4: `package.json`'s `postinstall` runs even though `husky` is the only thing it replaces

Some lifecycle-aware setups skip `postinstall` in CI (e.g., `npm ci --ignore-scripts`). The script must therefore be safe to skip — meaning a CI job that bypasses `postinstall` still passes its tests because the hooks are not consulted by CI (CI runs the same checks directly via the workflow yml). Contributor workstations always run scripts on `npm install`, so they get hooks; CI never relies on hooks, so opting out is fine.

### Decision 5: roborev's hooks coexist with our own `.githooks/`

`roborev init` writes the `post-commit` and `post-rewrite` hooks into whatever directory `core.hooksPath` points to. After the migration, that directory is `.githooks/`. We commit the roborev-managed hook scripts into the repo (they are already in `.husky/`), so they version-control alongside the rest. If `roborev init` is re-run later, it will overwrite our copies — that is acceptable and intentional.

### Decision 6: The trunk-drift fixes are bundled with the kernel/husky work, not split into a separate proposal

The user could ask for three separate proposals. We choose one because:

- All three changes are small and mechanical (each is line-edits or file moves).
- All three are pre-extraction debts that need to clear before the template proposal can start cleanly.
- The same end-of-implementation gate (tests + roborev + human approval) runs once across the whole set, so bundling halves the gate overhead.
- The PR is squash-merged with a single conventional-commit type. We choose `fix` (the trunk-drift is the user-visible piece; the kernel/husky moves are structural and warrant patch-level versioning, not minor).

### Decision 7: Permission patterns in `.claude/settings.local.json` get updated, not deleted

The two patterns (`Bash(chmod +x .husky/pre-push)`, `Bash(sh -n .husky/pre-push)`) become `.githooks/pre-push`. They are kept because future hook editing sessions will still want chmod and `sh -n` capability without an extra prompt.

### Decision 8: The two stale specs are handled differently because the migration left them in different states

The `drop-develop-branch` migration touched these two specs unevenly, so the fixes differ:

- **`conventional-commits`** was never given a delta by that migration. Its requirement "Promote PR title encodes the highest-priority commit type" describes a workflow that no longer exists (there is no promote PR; feature/bugfix branches squash-merge straight to `main`). This gets a real delta spec: REMOVE the promote-PR requirement, ADD a "Squash-merged PR title drives the release version bump" requirement that states the trunk-based behavior, and MODIFY the "All commits MUST follow Conventional Commits format" requirement so its description and the CLAUDE.md-documents scenario stop referencing the promote workflow.
- **`release-management`** already had its requirements migrated correctly (the Backmerge requirement was REMOVED and target-branch MODIFIED in 2026-05-02). The only stale artifact is one Purpose sentence: "...and a backmerge PR returning the version bump to `develop`." Since OpenSpec's archive applies requirement deltas but does not edit a spec's Purpose prose, there is no requirement-level delta to write — the fix is a direct one-line edit to the main spec's Purpose. Forcing a no-op MODIFIED delta just to carry a prose change would be noise.

**Why edit a main spec's Purpose directly rather than through a delta?** Because the archive process structurally cannot fix Purpose drift — that is precisely why `release-management`'s Purpose was left stale by an otherwise-correct migration. The Purpose line of `conventional-commits` is fixed the same way (direct edit), in addition to its requirement delta. This is the only available mechanism, and it matches how Purpose prose is maintained in this repo.

## Risks / Trade-offs

- **[Risk] A contributor on a long-lived branch from before this change rebases onto main, runs `npm install`, and ends up with both `.husky/` (from their working tree state) and `.githooks/` active.** → **Mitigation:** the migration step removes `.husky/` entirely; on rebase, git will delete `.husky/` from the working tree as part of resolving the merge. As a belt-and-braces step, the `postinstall` script explicitly sets `core.hooksPath` to `.githooks/`, overriding any prior value.
- **[Risk] A contributor runs `npm ci --ignore-scripts` (CI default for some orgs) and ends up with no hooks active locally.** → **Mitigation:** acceptable. CI doesn't rely on hooks, and the contributor will notice on first commit because `roborev` won't queue reviews; one-time fix is `git config core.hooksPath .githooks`. Document in `STACK.md`.
- **[Risk] `STACK.md` and `CLAUDE.md` drift over time — someone adds a stack-specific rule directly to `CLAUDE.md`.** → **Mitigation:** the kernel/stack boundary is now load-bearing for the template extraction. CLAUDE.md will gain a one-line preamble stating "stack-specific rules belong in STACK.md." Beyond that, code review catches drift.
- **[Risk] Claude Code's `@./STACK.md` resolution changes or is removed in a future version.** → **Mitigation:** unlikely (it's a documented core feature), but if it happens the fallback is concatenating STACK.md into CLAUDE.md and removing the import. The mechanism is reversible in one commit.
- **[Trade-off] We add a `postinstall` script, which is mildly disliked in some Node communities for security reasons.** → A single in-repo shell script is auditable and doesn't pull from the network. The benefit (no manual hook setup) outweighs the perception cost.
- **[Risk] Editing `conventional-commits`/`release-management` Purpose prose directly could be undone if a future change regenerates those specs from deltas.** → **Mitigation:** archive does not regenerate Purpose from deltas (that is the very reason the drift exists), so a direct edit is stable. Any future requirement delta on these specs leaves the Purpose untouched.
- **[Trade-off] Folding the two spec fixes into this change widens its surface beyond the originally-scoped "live config files."** → The root cause is identical (incomplete `develop→main` migration) and the edits are small and mechanical, so bundling avoids a second gate cycle and a near-duplicate follow-up proposal. The change name (`split-claude-md-drop-husky`) under-describes this thread, but the trunk-drift cleanup was already part of the proposal's scope, so the spec fixes are a consistent extension rather than a new direction.

## Migration Plan

There is no production deployment in this proposal — the change is local to the repo. Local migration steps for a contributor pulling this branch:

1. `git pull` the branch.
2. `npm install` runs `postinstall`, which sets `core.hooksPath` to `.githooks/`.
3. Confirm with `git config --get core.hooksPath` → expect `.githooks`.
4. Make a no-op commit to verify `post-commit` fires roborev.
5. Run a local `git push --dry-run` to verify the pre-push hook still runs the CI parity checks.

Rollback: revert the PR; `core.hooksPath` will then point to a nonexistent `.githooks/` after the directory is deleted, so a follow-up `git config --unset core.hooksPath` plus re-installing husky restores the prior state. Low-effort rollback because the hooks themselves are unchanged in content.

## Open Questions

- **Should the `postinstall` script log when it sets `core.hooksPath`?** Lean: yes, one line to stderr so contributors notice the first time. Will resolve during implementation.
- **Does `STACK.md` need a preamble explaining its relationship to `CLAUDE.md`?** Lean: yes, one or two sentences at the top stating "This file is project-specific stack rules for the synth-d project. Imported from `CLAUDE.md` via `@./STACK.md`." Helps a future template consumer understand what to replace.
