## Why

`release-please.yml` has been failing on every push to `main` since PR #50 (six consecutive failures, including the run for promote PR #52 which contained the reverb send-architecture changes). Because the `release-please` job sets `release_created = false`, the gated `deploy` job in the same workflow never runs and production on GitHub Pages does not update. The only escape hatch is a manual `workflow_dispatch` of `deploy.yml`, which was just used to push the reverb changes live.

Root cause: `release-please.yml` fires on `push: branches: [main]`, but `release-please-config.json` does not specify `target-branch`. The `googleapis/release-please-action@v4` action defaults to the repository's default branch when `target-branch` is omitted, and this repository's default branch is `develop`. So when `main` receives a push, the action runs but operates against `develop`, picks up the already-merged release-please PR #15 from `develop`, and fails with `Not Found` while trying to create a release for it. Failure log from run 25198273420 (PR #52):

```
❯ targetBranch: develop
✔ Creating 1 releases for pull #15
##[error]release-please failed: Not Found
```

The `release-management` spec already mandates that release-please operate on `main` — this change brings the implementation back into compliance with the existing requirement.

## What Changes

- Add `target-branch: main` to the `googleapis/release-please-action` step in `.github/workflows/release-please.yml` so the action operates on the same branch the workflow fires on, regardless of the repository's default branch.

## Capabilities

### New Capabilities

- _None._

### Modified Capabilities

- `release-management`: add an explicit requirement that the release-please workflow MUST set `target-branch` to match the branch its trigger fires on, so the action does not silently fall back to the repository's default branch when those differ.

## Impact

- **Code**: `.github/workflows/release-please.yml` (one-line addition).
- **Pipelines**: After this lands and the next promote PR merges to `main`, `release-please.yml` will produce `release_created == 'true'`, the gated `deploy` job will run and publish to `gh-pages`, and the `backmerge` job will open a PR back to `develop`. Manual `workflow_dispatch` of `deploy.yml` will no longer be required for routine releases.
- **Out of scope**: changing the repository's default branch; restructuring the deploy/release pipeline beyond this fix; updating `cd-pipeline` spec language that was made stale by PR #54.
