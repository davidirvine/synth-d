## 1. Workflow fix

- [x] 1.1 Add `target-branch: main` to the `googleapis/release-please-action` step's `with:` block in `.github/workflows/release-please.yml`
- [x] 1.2 Run `npx prettier --write .github/workflows/release-please.yml` to satisfy the project's formatting rule

## 2. Verification

- [x] 2.1 Confirm `release-please-config.json` and `.release-please-manifest.json` are unchanged (target-branch belongs in the workflow per design Decision 1)
- [x] 2.2 Open a PR from `bugfix/release-please-target-branch` to `develop` via `stax ss --yes --no-prompt`
- [ ] 2.3 After the PR merges and the next promote PR brings the fix to `main`, verify on the post-merge `release-please.yml` run that the action logs report `targetBranch: main` and the gated `deploy` and `backmerge` jobs run
