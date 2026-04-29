## 1. Update promote.yml with smart title logic

- [x] 1.1 Rewrite `promote.yml` to detect the highest-priority conventional commit type (`feat` > `fix` > `chore`) from the `develop..main` diff and store it in a shell variable
- [x] 1.2 Use the detected type to set the PR title (`<type>: promote develop to main`) when creating the promotion PR with `gh pr create`
- [x] 1.3 When `gh pr create` exits non-zero (PR already exists), call `gh pr edit --title` to update the existing PR title to the current highest-priority type
- [x] 1.4 Validate: push a `feat:` commit to `develop` and confirm the promotion PR title begins with `feat:`

## 2. Restructure release-please.yml

- [x] 2.1 Add `outputs` to the `release-please` job exposing `release_created` and `tag_name` from `steps.release.outputs`
- [x] 2.2 Add a `deploy` job with `needs: release-please` and `if: needs.release-please.outputs.release_created == 'true'`; move all build steps (setup-node, npm ci, Faust cache restore, faust:build, npm run build) and the `peaceiris/actions-gh-pages` step into this job
- [x] 2.3 Add a `backmerge` job with `needs: release-please` and `if: needs.release-please.outputs.release_created == 'true'`; move the `gh pr create` backmerge step from the existing `release-please` job into this new job
- [x] 2.4 Remove the inline backmerge `gh pr create` step from the `release-please` job now that it lives in its own job

## 3. Update deploy.yml

- [x] 3.1 Replace the `push: branches: [main]` trigger with `workflow_dispatch:` (no inputs needed)
- [x] 3.2 Verify the rest of the deploy job (checkout, setup-node, npm ci, Faust cache, build, peaceiris deploy) is unchanged and valid for manual dispatch

## 4. Update CLAUDE.md

- [x] 4.1 Add a "Conventional Commits" subsection to the Committing Changes section; specify the required types (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`) and explain that commit type drives the version bump through the promote PR title (functional requirement, not style)

## 5. Verification

- [x] 5.1 Run `npx prettier --write CLAUDE.md` and confirm no formatting errors
- [x] 5.2 Confirm all three workflow files are valid YAML (`python3 -c "import yaml; yaml.safe_load(open('.github/workflows/promote.yml'))"` etc.)
- [x] 5.3 Manually trigger the updated `promote.yml` by pushing a no-op commit to `develop` and confirm the promotion PR title reflects the correct type
