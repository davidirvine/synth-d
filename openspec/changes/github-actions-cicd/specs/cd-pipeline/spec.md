## ADDED Requirements

### Requirement: Merging to main triggers production deployment
The CD pipeline SHALL automatically build and deploy the application to GitHub Pages when a commit is pushed to `main`. The deployment MUST use the squash-merged commit, not a separate deploy branch.

#### Scenario: Successful deployment on merge to main
- **WHEN** a pull request is squash-merged into `main`
- **THEN** the deploy workflow triggers automatically
- **THEN** `npm run faust:build` executes to produce `public/synth.wasm`, `public/synth.js`, and `public/synth.json`
- **THEN** `npm run build` executes to produce the `dist/` bundle
- **THEN** the contents of `dist/` are deployed to the `gh-pages` branch root
- **THEN** the production GitHub Pages site reflects the new build

#### Scenario: Deployment uses cached WASM when DSP unchanged
- **WHEN** a PR is merged to `main` and `faust/synth.dsp` has not changed
- **THEN** Faust WASM outputs are restored from cache
- **THEN** Faust is not installed and `npm run faust:build` is not re-run

#### Scenario: Deployment fails on build error
- **WHEN** `npm run build` exits non-zero
- **THEN** the deploy workflow fails and reports a failed status
- **THEN** the `gh-pages` branch is not updated
- **THEN** the previous production deployment remains live

### Requirement: Production is served from the gh-pages branch
The `gh-pages` branch SHALL be the source for GitHub Pages. The production build SHALL be deployed to the root of that branch. Preview deployments SHALL be deployed to subdirectories and MUST NOT overwrite the production root.

#### Scenario: Production root is separate from previews
- **WHEN** a production deployment completes
- **THEN** `dist/` contents are at the root of `gh-pages`
- **THEN** PR preview subdirectories (e.g. `pr-preview/pr-42/`) are not affected
