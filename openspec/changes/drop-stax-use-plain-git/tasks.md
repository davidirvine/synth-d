## 1. Rewrite workflow rules in CLAUDE.md

- [x] 1.1 Rewrite the **Pull Requests** section: replace the "All branch creation, rebase, sync, and PR submission MUST use stax … Raw git commands … are FORBIDDEN" mandate with a plain `git` + `gh` workflow; document the one-liner `git push -u origin HEAD && gh pr create --fill --base main` for opening the PR; note `gh` as a required tool
- [x] 1.2 Update the **PR Feedback** subsection: response commits → human review → `git rebase -i` squash → `git push --force-with-lease` (remove `stax ss` and any restack step)
- [x] 1.3 Update the **Worktree Workflow** section so no step references stax
- [x] 1.4 Grep `CLAUDE.md` and `STACK.md` for any remaining `stax` reference and remove it; confirm `STACK.md` has none

## 2. Simplify the worktree script and command

- [x] 2.1 Edit `scripts/opsx-apply-worktree.sh`: replace `stax create "$CHANGE_NAME" --prefix "$PREFIX/"` + the switch-back-to-main block with `git branch "$BRANCH" main` (creates the branch without checking it out), keeping the existing `git worktree add` step
- [x] 2.2 Update `.claude/commands/opsx-apply-wt.md` step 3 to describe `git branch` instead of `stax create`
- [x] 2.3 Dry-run the script logic (or run it for a throwaway change name and tear down the worktree) to confirm the worktree attaches on the correct branch from `main`

## 3. Remove stax tooling

- [x] 3.1 Remove the `.claude/skills/stax/` directory (SKILL.md, README.md, references/)
- [x] 3.2 Remove `.stax.toml`
- [x] 3.3 Grep the repo for `stax` outside `openspec/changes/archive/` and `CHANGELOG.md`; resolve any remaining references (README/docs)

## 4. Update specs to match the delta

> **Deferred to archive (human decision, 2026-05-20).** Per design.md decisions 1 & 6 and the proposal, the delta is merged into the source-of-truth specs and the capability directories are renamed at archive time via `/opsx:archive` — not during implementation. Pre-applying now would double-apply the deltas at archive and break `openspec validate --strict`. These tasks are completed during the archive step:
>
> - 4.1 `openspec/specs/stacked-pr-workflow/` → `openspec/specs/pr-workflow/` (title "PR Workflow"); apply the `stacked-pr-workflow` delta.
> - 4.2 `openspec/specs/section-review-gate/` → `openspec/specs/implementation-completion-gate/`; apply the `section-review-gate` delta.
> - 4.3 After archive, grep `openspec/specs/` (excluding archive) for `stax`/`stacked`/`section-review-gate` and fix any cross-references to the renamed capabilities.

- [ ] 4.1 Apply the `stacked-pr-workflow` delta to `openspec/specs/stacked-pr-workflow/spec.md` (remove section-stacked-PR + stax requirements, add plain-git/gh + single-PR requirements, modify the feedback-path and post-rewrite requirements) and rename the spec directory to `openspec/specs/pr-workflow/`, updating the spec title to "PR Workflow"
- [ ] 4.2 Apply the `section-review-gate` delta to `openspec/specs/section-review-gate/spec.md` (remove "refine runs at section boundaries", add "refine runs once at the end-of-implementation gate", modify the human-checkpoint and daemon-verification requirements) and rename the spec directory to `openspec/specs/implementation-completion-gate/`, updating the spec title accordingly
- [ ] 4.3 Grep `openspec/specs/` (excluding archive) for `stax`/`stacked`/`section-review-gate` and confirm only intended references remain; update any cross-reference to the renamed `pr-workflow` and `implementation-completion-gate` capabilities

## 5. Clean up memory notes

- [ ] 5.1 Delete `feedback_stax_git.md` and `feedback_stax_trunk_drift.md` from the auto-memory directory
- [ ] 5.2 Remove their index lines from `MEMORY.md`

## 6. Verify

- [ ] 6.1 Run `openspec validate drop-stax-use-plain-git --strict` and confirm it passes
- [ ] 6.2 Confirm the full repo grep for `stax` returns only archived changes / CHANGELOG history
- [ ] 6.3 Confirm `npx vitest run`, lint/format on edited files, and that no application code changed (chore-only)
