## 1. Repository Configuration Files

- [ ] 1.1 Create `.github/CODEOWNERS` with `* @dirvine` to require owner review on all PRs (CODEOWNERS uses file globs only — branch restriction is enforced via GitHub Settings → Branch Protection, not CODEOWNERS)
- [ ] 1.2 Create `release-please-config.json` configuring the `node` release type targeting the repo root with `package.json` as the version file
- [ ] 1.3 Create `.release-please-manifest.json` with initial version `"0.0.0"` matching current `package.json`

## 2. CI Workflow — PRs to develop

- [ ] 2.1 Create `.github/workflows/ci-develop.yml` triggered on `pull_request` to `develop`
- [ ] 2.2 Add `permissions` block: `contents: read`
- [ ] 2.3 Add `actions/setup-node` step with `cache: 'npm'` for dependency caching
- [ ] 2.4 Add `npm ci` step
- [ ] 2.5 Add Faust WASM cache step keyed on `hashFiles('faust/synth.dsp')` covering `public/synth.wasm`, `public/synth.js`, `public/synth.json`
- [ ] 2.6 Add conditional Faust install step (`sudo apt-get install -y faust`) that runs only on cache miss
- [ ] 2.7 Add conditional `npm run faust:build` step that runs only on cache miss
- [ ] 2.8 Add Playwright browser cache step keyed on `hashFiles('node_modules/@playwright/test/package.json')` with path `~/.cache/ms-playwright` — **MUST appear after task 2.4 (`npm ci`)** because `node_modules/` does not exist at checkout; if placed before `npm ci`, `hashFiles()` returns an empty string and the cache key degenerates silently
- [ ] 2.9 Add conditional `npx playwright install --with-deps` step that runs only on cache miss
- [ ] 2.10 Add `npx vitest run` step
- [ ] 2.11 Add `npx playwright test` step
- [ ] 2.12 Add `npx eslint .` step
- [ ] 2.13 Add `npx prettier --check .` step

## 3. CI Workflow — PRs to main

- [ ] 3.1 Create `.github/workflows/ci-main.yml` triggered on `pull_request` to `main`
- [ ] 3.2 Add `permissions` block: `contents: read`
- [ ] 3.3 Add `actions/setup-node` step with `cache: 'npm'`
- [ ] 3.4 Add `npm ci` step
- [ ] 3.5 Add Faust WASM cache step keyed on `hashFiles('faust/synth.dsp')`
- [ ] 3.6 Add conditional Faust install and `npm run faust:build` steps on cache miss
- [ ] 3.7 Add Playwright browser cache step keyed on `hashFiles('node_modules/@playwright/test/package.json')` with path `~/.cache/ms-playwright` — **MUST appear after task 3.4 (`npm ci`)** for the same ordering reason as task 2.8
- [ ] 3.8 Add conditional `npx playwright install --with-deps` step on cache miss
- [ ] 3.9 Add `npx vitest run` step
- [ ] 3.10 Add `npx playwright test` step

## 4. CD Workflow — Production Deploy

- [ ] 4.1 Create `.github/workflows/deploy.yml` triggered on `push` to `main`
- [ ] 4.2 Add `permissions` block: `contents: write` (required by `peaceiris/actions-gh-pages` to push to `gh-pages`)
- [ ] 4.3 Add `actions/setup-node` step with `cache: 'npm'`
- [ ] 4.4 Add `npm ci` step
- [ ] 4.5 Add Faust WASM cache step keyed on `hashFiles('faust/synth.dsp')`
- [ ] 4.6 Add conditional Faust install and `npm run faust:build` steps on cache miss
- [ ] 4.7 Add `npm run build` step to produce `dist/`
- [ ] 4.8 Add `peaceiris/actions-gh-pages` deploy step targeting the `gh-pages` branch, deploying `dist/` to the root

## 5. PR Preview Workflow

- [ ] 5.1 Create `.github/workflows/preview.yml` triggered on `pull_request` to `main` with types `[opened, synchronize, reopened, closed]`
- [ ] 5.2 Add `permissions` block: `contents: write` and `pull-requests: write` (write required to push to `gh-pages`; pull-requests write required for `rossjrw/pr-preview-action` to post the preview URL comment)
- [ ] 5.3 Add `actions/setup-node` step with `cache: 'npm'` (skip for `closed` event)
- [ ] 5.4 Add `npm ci` step (skip for `closed` event)
- [ ] 5.5 Add Faust WASM cache step keyed on `hashFiles('faust/synth.dsp')` (skip for `closed` event)
- [ ] 5.6 Add conditional Faust install and `npm run faust:build` steps on cache miss (skip for `closed` event)
- [ ] 5.7 Add `npm run build` step (skip for `closed` event)
- [ ] 5.8 Add `rossjrw/pr-preview-action` step to deploy to `gh-pages/pr-preview/pr-<number>/` on open/sync and clean up on close

## 6. Release Management Workflow

- [ ] 6.1 Create `.github/workflows/release-please.yml` triggered on `push` to `main`
- [ ] 6.2 Add `permissions` block: `contents: write` and `pull-requests: write`
- [ ] 6.3 Add `google-github-actions/release-please-action` step using `release-please-config.json` and `.release-please-manifest.json`
- [ ] 6.4 Configure the workflow to use `RELEASE_PLEASE_TOKEN` secret (PAT with `contents: write` and `pull-requests: write` scopes) so merging the release PR triggers the deploy workflow
- [ ] 6.5 Verify that merging a release PR creates a git tag and a GitHub Release with changelog
