## 1. Vite Build Constants

- [x] 1.1 In `vite.config.js`, import `execSync` from `child_process` and read `version` from `package.json`
- [x] 1.2 Add a `define` block to the Vite config that sets `__APP_VERSION__` to the package version string and `__GIT_BRANCH__` to `process.env.GITHUB_REF_NAME` if set, else the output of `git rev-parse --abbrev-ref HEAD`, else `'unknown'`
- [x] 1.3 Run `npx prettier --write vite.config.js` and verify the dev server still starts

## 2. Header — Title Link and Version Label

- [x] 2.1 In `App.svelte`, replace `<span class="title">SYNTH-D</span>` with a `<div class="title-block">` containing an `<a class="title" href="https://github.com/davidirvine/synth-d" target="_blank" rel="noopener noreferrer">SYNTH-D</a>` and a `<span class="version-label">{versionLabel}</span>`
- [x] 2.2 In the `<script>` block of `App.svelte`, derive `versionLabel`: `const branch = __GIT_BRANCH__; const versionLabel = branch === 'main' ? \`v${__APP_VERSION__}\` : \`v${__APP_VERSION__} (${branch})\``
- [x] 2.3 In `App.svelte` styles, add `.title-block` as a flex-column container, update `.title` to remove default link underline and preserve existing color/font styles, and add `.version-label` with `font-size: 9px`, `color: #666`, `text-transform: uppercase`, `letter-spacing: 0.1em`
- [x] 2.4 Run `npx eslint --fix src/App.svelte` then `npx prettier --write src/App.svelte`
- [x] 2.5 Verify in the browser: SYNTH-D opens GitHub in a new tab; version label appears beneath with correct style; label shows branch name when not on main

## 3. README — Live Link and ASCII Diagram Removal

- [x] 3.1 In `README.md`, add `<p align="center"><a href="https://davidirvine.github.io/synth-d/">▶ Live Synth</a></p>` immediately after the `# SYNTH-D` heading
- [x] 3.2 In `README.md`, remove the fenced code block containing the ASCII architecture diagram (the block between the `## Architecture` heading and the `### DSP` sub-heading)
- [x] 3.3 Run `npx prettier --write README.md`

## 4. README — Branching and Deployment Section

- [x] 4.1 In `README.md`, add a `### Branching & Deployment` sub-section within the `## Development` section documenting: branch naming (`feature/*`, `bugfix/*`), `develop` as integration branch, CI checks on PRs to `develop` (tests + lint + format), auto-promotion PR from `develop` to `main`, CI checks on PRs to `main` (tests only), production deploy to GitHub Pages on merge to `main`, PR preview deployments at `.../pr-preview/pr-<N>/`, and `release-please` release flow (tag + CHANGELOG + GitHub Release)
- [x] 4.2 Run `npx prettier --write README.md`
