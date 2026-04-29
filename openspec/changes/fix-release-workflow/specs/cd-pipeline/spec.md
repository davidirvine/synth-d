## MODIFIED Requirements

### Requirement: Cutting a release triggers production deployment
The CD pipeline SHALL automatically build and deploy the application to GitHub Pages when a release is cut (i.e., `release_created = true` from the release-please workflow). The deployment MUST NOT fire on every push to `main`; it SHALL only fire after the version bump commit lands via the Release PR merge.

#### Scenario: Successful deployment on release cut
- **WHEN** the release-please action sets `release_created = true`
- **THEN** the deploy job triggers automatically within the same workflow run
- **THEN** `npm run faust:build` executes to produce `public/synth.wasm`, `public/synth.js`, and `public/synth.json`
- **THEN** `npm run build` executes to produce the `dist/` bundle
- **THEN** the contents of `dist/` are deployed to the `gh-pages` branch root
- **THEN** the production GitHub Pages site reflects the new versioned build

#### Scenario: No deployment on promote-PR merge
- **WHEN** the promote PR (develop→main) is merged and release-please does not set `release_created = true`
- **THEN** no deployment occurs

#### Scenario: Deployment uses cached WASM when DSP unchanged
- **WHEN** a release is cut and `faust/synth.dsp` has not changed since the last cached build
- **THEN** Faust WASM outputs are restored from cache
- **THEN** Faust is not installed and `npm run faust:build` is not re-run

#### Scenario: Deployment fails on build error
- **WHEN** `npm run build` exits non-zero during a release deployment
- **THEN** the deploy job fails and reports a failed status
- **THEN** the `gh-pages` branch is not updated
- **THEN** the previous production deployment remains live

#### Scenario: Manual deployment via workflow_dispatch
- **WHEN** an operator manually triggers `deploy.yml` via `workflow_dispatch`
- **THEN** the deploy workflow runs unconditionally and deploys the current `main` HEAD to `gh-pages`
