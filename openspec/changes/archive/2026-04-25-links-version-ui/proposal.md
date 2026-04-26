## Why

The app has no visible identity link or version indicator, and the README lacks documentation on how the project is deployed and how branches relate to each other. This change adds discoverability (click the title → GitHub repo), traceability (version label in the UI), and developer orientation (branching + deployment docs in README).

## What Changes

- `App.svelte`: make the SYNTH-D title a clickable link that opens `https://github.com/davidirvine/synth-d` in a new tab
- `App.svelte`: add a version label directly beneath the SYNTH-D title, styled identically to the "filter contour" sub-label (9 px, `#666`, uppercase, `letter-spacing: 0.1em`); shows `vX.Y.Z` on `main`, `vX.Y.Z (branch-name)` on any other branch
- `vite.config.js`: inject `__APP_VERSION__` (from `package.json`) and `__GIT_BRANCH__` (from `git rev-parse --abbrev-ref HEAD`) as build-time constants via Vite `define`
- `README.md`: remove the ASCII architecture diagram
- `README.md`: add a centered link to the live synth (`https://davidirvine.github.io/synth-d/`) at the top of the page
- `README.md`: add a **Branching & Deployment** section documenting the branch model and CI/CD pipeline

## Capabilities

### New Capabilities

- `synth-title-link`: SYNTH-D header label is a hyperlink to the GitHub repository
- `version-display`: build-time version + branch label rendered beneath the title in the header
- `readme-live-link`: centered link to the deployed synth at the top of README
- `readme-branching-docs`: branching strategy and deployment pipeline documented in README

### Modified Capabilities

## Impact

- `src/App.svelte`: header markup and styles change; new build-time constants consumed
- `vite.config.js`: adds `define` block with version and branch constants; imports `child_process` and `package.json`
- `README.md`: removes ~40 lines of ASCII diagram; adds live link and branching/deployment section
- No changes to DSP, audio engine, MIDI, or test infrastructure
