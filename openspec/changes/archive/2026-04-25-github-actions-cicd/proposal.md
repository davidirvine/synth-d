## Why

The project has no CI/CD pipeline. Deployments to GitHub Pages are manual, there are no automated quality gates on PRs, and there is no versioning or release tracking. This change introduces a complete, automated pipeline so that quality is enforced continuously and every deployment to production is traceable and documented.

## What Changes

- Add GitHub Actions workflow for PRs targeting `develop`: runs tests, lint, and formatting checks
- Add GitHub Actions workflow for PRs targeting `main`: runs tests
- Add GitHub Actions deployment workflow: builds Faust WASM + Vite bundle and deploys to GitHub Pages on merge to `main`
- Add PR preview deployments for PRs targeting `main` via `rossjrw/pr-preview-action`
- Add `release-please` workflow for automated semantic versioning, changelog generation, and GitHub Releases
- Add `.github/CODEOWNERS` to restrict merges to `main` to the repo owner
- Add `release-please-config.json` and `.release-please-manifest.json`
- Configure build caching: `node_modules` keyed on `package-lock.json`, Faust WASM outputs keyed on `faust/synth.dsp`
- Faust compiler installed via `apt-get` on cache miss only

## Capabilities

### New Capabilities

- `ci-pipeline`: Automated quality checks on PRs — tests, lint, and formatting enforced before merge
- `cd-pipeline`: Automated production deployment to GitHub Pages triggered by merge to `main`
- `pr-previews`: Per-PR preview deployments to GitHub Pages subdirectories
- `release-management`: Semantic versioning, git tags, and GitHub Releases via `release-please`

### Modified Capabilities

## Impact

- New files: `.github/workflows/` (5 workflow files), `.github/CODEOWNERS`, `release-please-config.json`, `.release-please-manifest.json`
- No changes to application source code
- GitHub repository settings must have branch protection rules enabled on `develop` and `main`, and GitHub Pages must be configured to serve from the `gh-pages` branch
- Adds `release-please` GitHub App or PAT dependency for the release workflow
- Faust compiler (`faust` apt package) required on CI runner for WASM builds
