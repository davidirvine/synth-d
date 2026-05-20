## Context

stax was adopted to manage stacked PRs, but the workflow evolved to one OpenSpec change → one worktree cut from `main` → one branch → one PR merged to `main`. Branches are never stacked on each other, so `restack`, `cascade`, `upstack/downstack submit`, and `sync --restack` are never used. `CLAUDE.md` already mandates "a single PR per feature/bugfix branch" and "do not create per-section PRs," but two specs (`stacked-pr-workflow`, `section-review-gate`) still describe section-level stacked PRs created via stax — a live contradiction.

stax usage today is reduced to thin wrappers:

| stax | plain equivalent |
| --- | --- |
| `stax create <name> --prefix <p>/` | `git branch <p>/<name> main` |
| `stax ss` / `stax submit --yes --no-prompt` | `git push -u origin HEAD && gh pr create --fill --base main` |
| `stax merge --yes` | `gh pr merge` |
| `stax sync` | `git switch main && git pull --ff-only && git fetch --prune` |

Constraints: this is the **template/kernel repo** — `CLAUDE.md` is the portable kernel and a future template consumer replaces `STACK.md` wholesale, so the rules must read cleanly for any project, not just synth-d. Release tooling (release-please, conventional-commit squash titles) is unaffected and must stay intact.

## Goals / Non-Goals

**Goals:**

- Remove stax from the mandated workflow; describe branch/PR operations in plain `git` + `gh`.
- Eliminate the "raw git FORBIDDEN" rule and the stax-first routing burden.
- Make the `stacked-pr-workflow` and `section-review-gate` specs match reality: single-PR-per-branch, and a single end-of-implementation review gate (no section-boundary gates).
- Keep the worktree-per-change model, the conventional-commits requirement, the roborev gates, and the single end-of-implementation gate exactly as they are.

**Non-Goals:**

- Changing the worktree-per-change architecture or branch naming (`feature/`/`bugfix/` from `main` stays).
- Changing the commit-per-task rule, roborev review flow, or release pipeline.
- Migrating any in-flight branch (current local branches are independent off `main`; nothing to restack).

## Decisions

**1. Rename the `stacked-pr-workflow` capability to `pr-workflow` rather than rewrite-in-place.**
The name "stacked-pr-workflow" becomes actively misleading once stacking is gone. OpenSpec deltas don't have a first-class rename, so the implementation will: write the delta against the existing `stacked-pr-workflow` spec (MODIFIED/REMOVED requirements), and during archive the main spec directory is renamed `openspec/specs/stacked-pr-workflow/` → `openspec/specs/pr-workflow/`. _Alternative considered_: keep the old folder name — rejected, the name is the most visible "stacked" artifact left. _Alternative_: delete and recreate as a brand-new capability — rejected, loses the requirement history that the delta cleanly carries forward.

**2. Drop the section-level stacked-PR requirement entirely, don't soften it.**
The requirement "Each section maps to one stacked PR" and the "downstream-restack PR-feedback path" describe a flow that cannot occur (single PR, no downstream). They are REMOVED, not edited. The surviving requirements: branch naming + type prompt, branches cut from `main`, single PR per branch via gh, and the PR-feedback path (response commits → human review → squash + force-push). _Alternative_: keep them as "optional" — rejected, optional-but-impossible is just clutter.

**3. PR feedback uses `git push --force-with-lease` after an interactive squash.**
`CLAUDE.md` already documents `git rebase -i` to squash; the only change is replacing the final `stax ss --yes --no-prompt` push with `git push --force-with-lease`. No downstream restack step (it never applied). _Alternative_: keep `--force` — rejected, `--force-with-lease` is the safe default and matches stax's own behavior.

**4. Branch creation in the worktree script uses `git branch <branch> main`, not `git switch -c`.**
`git worktree add <path> <branch>` requires the branch to exist but **not** be checked out anywhere. `git branch <branch> main` creates it without checkout, so the current "switch back to main" workaround disappears. _Alternative_: `git switch -c` then `git switch main` — rejected, that's exactly the dance we're removing.

**5. Remove the stax skill and `.stax.toml` outright (not archive-in-tree).**
A dormant skill in `.claude/skills/` still loads its description into every session's skill list — that's ongoing context cost for a tool we no longer use. Git history preserves it if ever needed. _Alternative_: leave it for opt-in use — rejected, an unmandated tool with a 200-line skill is the clutter this change exists to remove.

**6. `section-review-gate` is reframed around the single end-of-implementation gate and renamed.**
`CLAUDE.md` already states "There are no review or human-verification gates at section boundaries … The single review + human-verification gate runs once, at the end of the implementation." The spec contradicted this by requiring `roborev refine` at every section boundary. The "refine runs at section boundaries" requirement is REMOVED and replaced (ADDED) with "refine runs once at the end-of-implementation gate"; the human-checkpoint and daemon-verification requirements are MODIFIED to reference the end-of-implementation gate and the single per-branch PR via `gh`. The capability is renamed `section-review-gate` → `implementation-completion-gate` at archive (same mechanism as decision 1), since "section review gate" is now a misnomer. _Alternative considered_: only strip stax wording and defer the section-boundary reconciliation — rejected, it would leave the spec contradicting `CLAUDE.md` and carry a misleading name.

## Risks / Trade-offs

- **Losing the `stax ss` one-command push+PR ergonomic** → Mitigation: document the exact `git push -u origin HEAD && gh pr create --fill --base main` one-liner in `CLAUDE.md` so it's copy-pasteable; it's a single line.
- **`gh` not installed / not authenticated on a consumer's machine** → Mitigation: `gh` is already used elsewhere in the workflow (PR listing, CI checks) and was a prerequisite anyway; call it out in the rules as a required tool.
- **Spec rename via archive could orphan references** → Mitigation: grep the repo for `stacked-pr-workflow` after rename; update `README.md`/docs cross-references in the same change.
- **Stale memory notes giving future sessions wrong guidance** → Mitigation: delete `feedback_stax_git.md` and `feedback_stax_trunk_drift.md` and their index lines as an explicit task; replace with a single note recording the git+gh PR flow if useful.

## Migration Plan

1. No data/branch migration needed — current branches are independent off `main`.
2. Land this change as a normal single PR (dogfoods the new flow).
3. After merge, the stax skill and `.stax.toml` are gone; sessions pick up the new `CLAUDE.md` rules on next load.
4. Rollback: revert the PR; stax skill, `.stax.toml`, and old spec wording return from git history.

## Open Questions

- Keep a slim git/gh PR-flow memory note, or rely solely on `CLAUDE.md`? Current plan: rely on `CLAUDE.md`, delete the stax notes.
