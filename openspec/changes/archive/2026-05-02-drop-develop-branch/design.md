## Context

This project currently uses a develop/main split: feature/bugfix branches merge into `develop`, a `promote.yml` workflow opens an auto-promotion PR from `develop` → `main`, and after each release-please cut on `main`, a `backmerge` job opens a `main` → `develop` PR to bring the version-bump commit back. The pattern is designed for teams where unstable work needs to coexist with releasable code.

In practice, the backmerge has produced recurring conflicts — visible four times in recent history with the message `chore: merge main into develop, resolving conflicts in favor of develop`. The most recent backmerge listed conflicts on `src/App.test.js`, `src/audio/math.js`, `src/components/Knob.svelte`, and `openspec/changes/osc-freq-range-intervals/*`, none of which are mechanical version-file conflicts.

The root cause is the squash-merge of the promote PR. When `develop` → `main` is squash-merged, main receives a single new commit whose content matches develop's commits but whose SHA does not. On the subsequent `main` → `develop` backmerge, git sees:
- main side: one squash blob touching N files
- develop side: N original commits touching the same files

Git treats these as two independent sets of changes to the same lines, producing phantom conflicts on files whose content is literally identical on both sides.

This project has two developers (one human, one AI). The worktree-per-change workflow already provides per-feature isolation. The develop branch is doing no structural work that worktrees don't already cover — but it does add the recurring backmerge tax.

## Goals / Non-Goals

**Goals:**
- Eliminate the recurring main↔develop merge-conflict failure mode.
- Reduce CI/CD infrastructure: one CI workflow instead of two, no promote workflow, no backmerge job.
- Preserve the worktree-per-change workflow, conventional commits, release-please, gh-pages deployment, PR previews, and roborev integration unchanged.
- Keep the migration to a single substantive PR plus housekeeping, fully reversible.

**Non-Goals:**
- Switching individual feature/bugfix → main PRs from squash to merge. Feature PRs continue to use squash. The squash problem only manifested for the *cumulative* promote PR; per-feature squashes are unaffected because their commits never get re-applied via a backmerge.
- Pruning the 60+ stale `feature/*`, `bugfix/*`, `design/*`, `planing-*` branches. Natural cleanup moment, but separable and not blocking.
- Restructuring the per-section PR pattern, the worktree creation flow, the linting/formatting requirements, or the implementation-completion gate. These are orthogonal to the branching model.

## Decisions

### Decision: Drop `develop` entirely; trunk-based on `main`

**Rationale:** The develop/main split exists to buffer unstable work from releasable code. With two developers and a worktree-per-change pattern, that buffer is already provided at finer granularity (per worktree). Removing develop eliminates the entire failure mode rather than patching around it.

**Alternatives considered:**

1. *Keep develop, switch promote PR from squash to merge.* Solves the phantom-conflict problem (main and develop literally share commits after a merge-promote, so the backmerge is a fast-forward of the version-bump commit only). But preserves a second long-running branch that earns its keep on multi-team projects, not 2-developer ones. Rejected as more infrastructure than the project warrants.
2. *Keep develop, switch promote PR to rebase-merge.* Same backmerge-content reasoning as merge: rebased commits have identical content even with new SHAs, so backmerge is content-trivial. Same rejection rationale.
3. *Keep develop, skip backmerge entirely; cherry-pick the version bump.* After release-please commits to main, cherry-pick just the bump commit onto develop. Avoids the merge entirely. Workable but adds a manual or scripted step to every release and doesn't simplify the rest of the topology.

### Decision: Use a MERGE (not squash) for the final develop → main promotion

**Rationale:** Develop currently has 2 unreleased commits ahead of main (`0ead3e1`, `a9389cd`) plus 1 backmerge commit (`b9e068a`). Squashing this final promote PR would create one last phantom-conflict opportunity for any in-flight worktrees that branched off develop. Using a real merge brings those commits over with their original SHAs, so any existing worktrees can be rebased cleanly onto main with `git rebase --onto main develop <branch>`.

**Alternatives considered:**
- *Squash the final promote PR like the others.* Simpler, but perpetuates the phantom-conflict pattern for the migration itself. Rejected.
- *Cherry-pick the 2 unreleased commits onto main individually.* Avoids the merge but loses the develop-side history. The merge is fine for the one-time migration since develop is being deleted immediately after.

### Decision: OpenSpec proposal artifacts commit directly to `main`

**Rationale:** Today, `/opsx:propose` commits proposal artifacts (`openspec/changes/<name>/`) directly to develop without a PR. After the change, the equivalent is committing directly to main. Release-please ignores `chore:` commits for version bumps, so proposal commits typed `chore(openspec): propose ...` produce no spurious version bumps.

**Alternatives considered:**
- *Route proposals through their own PR (`chore/openspec-<name>` → main).* More ceremony for a 2-dev team. Rejected: the proposal artifacts are by definition pre-implementation, so a review PR adds gate without information; the human-approval gate already exists at the end of implementation.

### Decision: Migrate `ci-develop.yml`'s lint + prettier steps into `ci-main.yml`

**Rationale:** The two CI workflows are not equivalent. `ci-develop.yml` runs `npx eslint .` and `npx prettier --check .`; `ci-main.yml` does not. If `ci-develop.yml` is deleted without porting these steps, lint/prettier checks silently disappear from CI — a regression risk much larger than the change itself. Migrating those steps into `ci-main.yml` preserves the full check matrix on every PR to the new trunk.

### Decision: Default branch switch is part of the migration, not a follow-up

**Rationale:** Leaving `origin/HEAD` pointing at develop after deletion produces broken clones and confused PR-default behavior. The default branch switch must happen *before* develop is deleted (GitHub blocks deletion of the default branch). The migration sequence is therefore: cutover PR → merge → switch default branch → delete develop.

### Decision: Preserve worktree workflow

**Rationale:** The worktree-per-change pattern is the whole reason the develop branch is unnecessary in the first place. The change is solely to the *base* branch worktrees are cut from (develop → main). All other worktree mechanics — single PR per change, end-of-implementation gate, roborev integration, conventional commits — are preserved unchanged.

## Risks / Trade-offs

**[Risk] Lint/prettier checks silently disappear from CI** → Mitigated by including the migration of those steps to `ci-main.yml` in the same PR that deletes `ci-develop.yml`. Verify by inspecting `ci-main.yml` for `eslint` and `prettier --check` lines after the cutover.

**[Risk] In-flight worktrees branched from develop break after develop is deleted** → Mitigated by the migration order: rebase active worktrees onto main *before* deletion using `git rebase --onto main develop <branch>`. The prerequisite is a triage pass to identify which of the 60+ branches are still alive vs. abandoned.

**[Risk] Muscle-memory regressions — Claude or human creates branches from a non-existent develop** → Mitigated by updating CLAUDE.md, README.md, and the `opsx-apply-wt` skill in the same PR. The skill change is the load-bearing part: once the tooling defaults to main, the human and AI rely on the tooling rather than memory.

**[Risk] release-please tooling assumes a specific branch topology** → Low. release-please-config.json and the action's `target-branch: main` already point at main. The only develop-coupled bit is the backmerge job, which is being deleted explicitly. The release-please-tracking branch (`release-please--branches--develop--components--subtractive-synth`) is stale and is being deleted explicitly.

**[Trade-off] Reverting a release becomes slightly more involved if individual feature PRs ever switch from squash to merge.** Not changing here — feature PRs stay squash-merged. Documented to flag for any future workflow change.

**[Trade-off] No buffer between "in flight" and "shipped" at the branch level.** This was the original design intent of the develop/main split. The worktree pattern provides the same buffer at finer granularity (per change) without the inter-branch coordination cost.

## Migration Plan

The migration is sequenced to ensure each step is reversible and the project remains shippable throughout.

### Phase 1: Pre-migration

1. **Triage active branches.** Identify which of the 60+ existing `feature/*`, `bugfix/*`, `design/*`, `planing-*` branches are still being worked on vs. abandoned. For each active branch: confirm its base is develop and note that it will need a one-time rebase onto main after Phase 3.
2. **Snapshot the develop → main delta.** Confirm the 2 unreleased commits on develop (`0ead3e1`, `a9389cd`) are intentional and ready to ship, plus the 1 backmerge commit (`b9e068a`).

### Phase 2: Final develop → main promotion

3. **Open the final promote PR with MERGE (not squash) merge strategy.** The PR brings develop's unreleased commits onto main with their original SHAs intact. Use the GitHub UI's "Create a merge commit" option, not "Squash and merge".
4. **Merge.** Main now contains everything develop had.

### Phase 3: Cutover PR

5. **Open the cutover PR on `main` containing:**
   - Delete `.github/workflows/promote.yml`
   - Delete `.github/workflows/ci-develop.yml`
   - Edit `.github/workflows/ci-main.yml` to add `npx eslint .` and `npx prettier --check .` steps
   - Edit `.github/workflows/release-please.yml` to remove the `backmerge` job (the deploy job and release-please job remain)
   - Edit `CLAUDE.md`: rewrite Branching, Worktree Workflow, and Pull Requests sections; remove all "develop is reserved for proposals" framing
   - Edit `README.md`: rewrite Branching & Deployment section to reflect trunk-based-from-main
   - Update the `opsx-apply-wt` skill (or its base-branch configuration) to use `main` instead of `develop`
6. **Verify** the cutover PR's CI run shows lint, prettier, and tests all running on the PR-to-main check.
7. **Merge.** Main now operates trunk-based; develop is still alive but functionally orphaned.

### Phase 4: GitHub repository settings

8. **Switch GitHub default branch from develop to main** (Settings → Branches → Default branch).
9. **Add or verify branch protection rules on main** mirroring whatever protection develop had.
10. **Remove branch protection from develop** (cannot delete a protected branch).

### Phase 5: Branch deletion

11. **Delete develop locally and remotely:** `git push origin --delete develop && git branch -D develop`.
12. **Delete the stale release-please tracking branch:** `git push origin --delete release-please--branches--develop--components--subtractive-synth`.

### Phase 6: Post-migration (per-developer)

13. **Active worktrees rebase onto main:** for each active branch based on develop, run `git rebase --onto main develop <branch>` once. (After this, the develop ref is gone, so any branch still anchored to it would need recovery from reflog — but at this point the rebase is being performed *before* develop is reclaimed by gc.)
14. **Update local `origin/HEAD`:** `git remote set-head origin -a` so subsequent clones default to main.

### Rollback

If the migration goes wrong before Phase 5:
- Phase 3 cutover PR can be reverted with a single `git revert <merge-sha>` and re-merged later.
- Phase 4 default-branch switch can be reverted by switching back in GitHub Settings.

If the migration goes wrong *after* Phase 5:
- Recreate develop from main: `git branch develop main && git push -u origin develop`.
- Restore `promote.yml`, `ci-develop.yml`, and `release-please.yml`'s backmerge job from the pre-cutover commit.
- Switch the GitHub default branch back to develop.
- Inform any active worktrees that they are now out of sync; they can rebase onto develop or stay on main depending on which trunk wins.

The migration is fully reversible at every phase. The cost of rollback after Phase 5 is one commit's worth of cleanup; no history is lost.
