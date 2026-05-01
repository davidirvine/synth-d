## Why

The release pipeline is broken: the Release PR never appears, `release_created` is never true, the backmerge PR never opens, and deploy fires on every push to `main` instead of only after the version bump. The root cause is that squash-merging the promote PR collapses all conventional commits into a single `chore: promote develop to main` commit — release-please never sees a releasable commit type and takes no action. Fixing this requires both correcting how releasable commits reach `main` and restructuring the deploy trigger so it only fires after a version bump.

## What Changes

- **`promote.yml`**: Inspect commits in develop that are not yet in main, detect the highest-priority conventional commit type (`feat` > `fix` > `chore`), and set the PR title accordingly (e.g. `feat: promote develop to main`). Also handle the case where the promotion PR already exists by updating its title to reflect any newly pushed commits.
- **`release-please.yml`**: Add `deploy` and `backmerge` as separate jobs that `need: release-please` and run only `if: release_created == 'true'`. Move all build and gh-pages deploy steps from `deploy.yml` into the `deploy` job here.
- **`deploy.yml`**: Remove the `push: branches: main` trigger. Convert to `workflow_dispatch`-only so it can be run manually if needed but no longer fires on every main push.
- **`CLAUDE.md`**: Add a mandatory conventional commits section to the Committing Changes rules. Explain that commit type is used by the promote workflow to determine the version bump — making it clear this is a functional requirement, not a style preference.

## Capabilities

### New Capabilities

- `conventional-commits`: Commits on feature branches MUST follow Conventional Commits format. The promote workflow reads commit types to derive the promote PR title, which becomes the squash commit message on `main` that release-please parses for the version bump type.

### Modified Capabilities

- `cd-pipeline`: Deployment MUST only occur after a release is cut (`release_created = true`), not on every push to `main`. The current requirement "merging to main triggers deployment" must change to "cutting a release triggers deployment".
- `release-management`: The promote PR title MUST encode the highest-priority conventional commit type present in the develop→main diff so that squash merges produce releasable commits visible to release-please.

## Impact

- `.github/workflows/promote.yml` — rewritten
- `.github/workflows/release-please.yml` — deploy and backmerge jobs added
- `.github/workflows/deploy.yml` — push trigger removed, workflow_dispatch added
- `CLAUDE.md` — conventional commits requirement added
- No changes to application code, tests, or build configuration
