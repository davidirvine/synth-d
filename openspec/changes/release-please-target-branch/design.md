## Context

`release-please.yml` runs `googleapis/release-please-action@v4` on every push to `main`. The action consults `release-please-config.json` and `.release-please-manifest.json` to decide what release work to perform. Neither file specifies `target-branch`, and the workflow does not pass `target-branch` as an input. When `target-branch` is unset, the action uses the repository's default branch as the target. This repository's default branch is `develop`, not `main`.

Result: every push to `main` causes the action to operate against `develop`, find an already-merged release-please PR there (#15, "release subtractive-synth 1.1.0"), and fail with `Not Found` while attempting to create a release for it. The job sets `release_created = false`, so the gated `deploy` and `backmerge` jobs never run. Production has been stuck at the build that landed before PR #50 (2026-04-29). The reverb send-architecture changes from PR #55 are present on `main` but were only published to `gh-pages` via a manual `workflow_dispatch` of `deploy.yml` in this session.

PR #54 introduced this regression when it migrated the deploy step out of `deploy.yml` (now `workflow_dispatch` only — emergency escape hatch) into the gated `deploy` job inside `release-please.yml`. That migration is sound; the missing piece is the `target-branch` input.

## Goals / Non-Goals

**Goals:**

- Make `release-please.yml` succeed on push to `main` so the gated `deploy` and `backmerge` jobs run.
- Codify the correct configuration in the `release-management` spec so the constraint cannot quietly drift again.

**Non-Goals:**

- Changing the repository's default branch.
- Restructuring the deploy/release pipeline beyond this fix.
- Updating other specs (e.g., `cd-pipeline`) whose language was made stale by PR #54 — that is a separate concern.
- Re-running the failed release-please attempts; once the next promote PR merges, release-please will pick up the full backlog of conventional commits since the last release tag.

## Decisions

**Decision 1: Set `target-branch` explicitly in the workflow's `with:` block, not in `release-please-config.json`.**

The `googleapis/release-please-action@v4` accepts `target-branch` as either a workflow input or a config field. Putting it in the workflow keeps it co-located with the trigger (`on: push: branches: [main]`), so anyone editing the trigger sees the target alongside it. Putting it in `release-please-config.json` would split the trigger-vs-target relationship across two files and make this exact regression easier to repeat.

**Decision 2: Add a normative requirement to `release-management` spec, not just fix the YAML.**

A one-line workflow edit fixes the symptom but leaves no test or constraint that prevents the same drift the next time someone restructures the release workflow. Adding a `### Requirement: release-please target-branch matches the workflow trigger branch` to `release-management` codifies the invariant and gives reviewers something concrete to check.

**Alternatives considered:**

- _Change the repository default branch to `main`._ Rejected: develop-as-default is intentional in this repo's stacked-PR/promote workflow. Changing it has cross-cutting consequences far beyond this bug.
- _Pass `target-branch` via `${{ github.ref_name }}` for "automatic" matching._ Rejected: the workflow only fires on `main`, so a literal `main` is clearer and prevents accidental cross-branch behavior if the trigger is ever expanded.

## Risks / Trade-offs

- _Backlog of release-please-eligible commits piles up before the fix lands._ → No mitigation needed: release-please is designed to compute the cumulative bump from all conventional commits since the last tag, so the first successful run after this fix will produce one combined Release PR covering the full backlog.
- _Backmerge PR conflicts after the first successful release._ → Standard conflict resolution; the existing `backmerge` job already opens a PR for human review rather than auto-merging.

## Migration Plan

1. Land the workflow edit on a `bugfix/release-please-target-branch` branch via the standard worktree workflow.
2. Open a PR from `bugfix/release-please-target-branch` → `develop`, get it through CI and roborev, merge to `develop`.
3. Open the next promote PR from `develop` → `main` (this brings the fix to `main`).
4. Verify on the post-merge `release-please.yml` run that the action logs show `targetBranch: main`, `release_created: true`, and that the gated `deploy` and `backmerge` jobs run.
5. If anything fails, the manual `workflow_dispatch` of `deploy.yml` remains available as an escape hatch.

## Open Questions

- _None._
