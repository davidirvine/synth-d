## ADDED Requirements

### Requirement: Version label is shown beneath the SYNTH-D title
A version label SHALL appear directly below the SYNTH-D title in the header. Its text style SHALL match the "filter contour" sub-label in `Filter.svelte`: `font-size: 9px`, `color: #666`, `text-transform: uppercase`, `letter-spacing: 0.1em`.

#### Scenario: Version label on main branch
- **WHEN** the app is built from the `main` branch
- **THEN** the version label displays `v<major>.<minor>.<patch>` (e.g., `v1.1.0`) with no branch name (visually uppercased via CSS `text-transform: uppercase`; assertions should target the raw lowercase value)

#### Scenario: Version label on a non-main branch
- **WHEN** the app is built from any branch other than `main`
- **THEN** the version label displays `v<major>.<minor>.<patch> (<branch-name>)` (e.g., `v1.1.0 (feature/links-version-ui)`) (visually uppercased via CSS; assertions should target the raw lowercase value)

#### Scenario: Version and branch are injected at build time
- **WHEN** the Vite build runs
- **THEN** `__APP_VERSION__` is set to the `version` field from `package.json` and `__GIT_BRANCH__` is set to the current git branch (or `GITHUB_REF_NAME` if set), with a fallback of `'unknown'`
