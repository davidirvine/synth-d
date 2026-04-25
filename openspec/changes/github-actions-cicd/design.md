## Context

The project is a Svelte 5 / Vite application with a Faust DSP engine compiled to WASM. There are no GitHub Actions workflows today. The project uses conventional commits, vitest for unit/component tests, Playwright for e2e tests, ESLint and Prettier for code quality, and Stryker for mutation testing. The `develop` branch is the integration branch; `main` is production. All implementation branches are squash-merged.

## Goals / Non-Goals

**Goals:**
- Automated quality gate on every PR to `develop` (tests including Playwright e2e + lint + format)
- Automated quality gate on every PR to `main` (tests only)
- Automated production deployment to GitHub Pages on merge to `main`
- Per-PR preview deployments for PRs targeting `main`
- Semantic versioning and GitHub Releases via `release-please`
- Branch protection enforced via CODEOWNERS (owner-only merges to `main`)
- Fast CI via dependency caching (`node_modules` + Faust WASM outputs)

**Non-Goals:**
- Stryker mutation testing in CI (too slow for PR gates; run locally)
- Staging environment separate from PR previews
- Docker or containerised builds
- Automated merging or auto-approve bots

## Decisions

### D1 — Faust WASM: build from source with caching

**Choice:** Install Faust via `apt-get install faust` on `ubuntu-latest` and cache `public/synth.wasm`, `public/synth.js`, and `public/synth.json` keyed on `hashFiles('faust/synth.dsp')`.

**Rationale:** Keeps the WASM reproducible and tied to the DSP source. The cache means the expensive install+compile step only runs when `synth.dsp` actually changes — typically rare relative to UI work. On cache hit the step is skipped entirely.

**Alternatives considered:**
- *Commit the WASM* — simpler CI but risks silent drift between source and binary; rejected.
- *Conditional workflow triggered on DSP changes only* — cleaner separation but adds workflow complexity and risks stale WASM in some build paths; rejected.

**Faust version:** `apt-get install faust` installs the version Ubuntu ships. No version pin is applied. If WASM output ever diverges from local builds, the fix is to pin to a specific Faust release binary from GitHub.

### D2 — Preview deployments: PR-scoped only

**Choice:** Use `rossjrw/pr-preview-action` to deploy previews to `gh-pages/pr-preview/pr-<number>/` for PRs targeting `main`.

**Rationale:** PR previews cover the real review use case. Every-branch previews would accumulate stale directories and are noisy. The action handles deploy-on-open and cleanup-on-close automatically.

**Alternatives considered:**
- *Every-branch previews* — more coverage but operational overhead; rejected for now.
- *Third-party hosting (Netlify/Vercel)* — native branch preview support but adds an external service dependency; rejected in favour of keeping everything in GitHub.

### D3 — Versioning: release-please with release PR

**Choice:** Use `google-github-actions/release-please-action` configured for a Node.js package. On each merge to `main`, release-please opens or updates a "Release PR" that bumps `package.json` version and updates `CHANGELOG.md`. Merging that PR cuts the release (tag + GitHub Release).

**Rationale:** Gives the owner a human gate before a version is published. Conventional commit history drives the version bump automatically. The release PR is a natural review checkpoint.

**Alternatives considered:**
- *semantic-release* — fully automated, no human gate; rejected because the owner wants control over when versions land.

### D4 — Workflow split: separate files per concern

**Choice:** Five separate workflow files rather than one monolithic workflow.

| File | Trigger | Purpose |
|---|---|---|
| `ci-develop.yml` | PR to `develop` | Tests (vitest + Playwright) + lint + format |
| `ci-main.yml` | PR to `main` | Tests (vitest + Playwright) |
| `deploy.yml` | Push to `main` (all commits, including release-please) | Build + deploy to Pages |
| `preview.yml` | PR to `main` opened/synchronised/reopened/closed | PR preview deploy/cleanup |
| `release-please.yml` | Push to `main` | Release PR management |

**Rationale:** Single-responsibility workflows are easier to read, debug, and selectively re-run. A failure in preview deploy doesn't block the release workflow.

**Note on deploy + release-please interaction:** `deploy.yml` fires on every push to `main`, including the version-bump commit that release-please creates when the release PR is merged. This is intentional — the production deploy will include the updated `package.json` version, so the deployed build's version number matches the release tag. The cost is one extra deploy per release (~1–2 min), which is acceptable.

### D5 — Caching strategy

- `node_modules`: use `actions/setup-node` with `cache: 'npm'` — caches the npm cache directory and always runs `npm ci` (fast on hit, correct on miss, avoids stale native binaries)
- Faust outputs: `actions/cache` keyed on `hashFiles('faust/synth.dsp')`, paths `public/synth.wasm`, `public/synth.js`, `public/synth.json`
- Playwright browsers: `actions/cache` keyed on `hashFiles('node_modules/@playwright/test/package.json')` with path `~/.cache/ms-playwright`; only an actual Playwright version upgrade busts the cache; `npx playwright install --with-deps` runs only on cache miss. **Ordering constraint:** this cache step must run after `npm ci` — `node_modules/` does not exist at checkout, so `hashFiles()` returns an empty string if evaluated before `npm ci` completes, silently degenerating the cache key
- Vite build output (`dist/`) is not cached — it's always rebuilt from source on deployment runs.

### D6 — GitHub Pages source: `gh-pages` branch

**Choice:** Deploy from a dedicated `gh-pages` branch using `peaceiris/actions-gh-pages`.

**Rationale:** Keeps build artifacts off `main`. The `gh-pages` branch holds the production build at root and PR previews in subdirectories. The repo must be configured in GitHub Settings → Pages → Source: `gh-pages` branch, root folder.

## Risks / Trade-offs

- **Faust apt version drift** → If the Ubuntu-packaged Faust diverges from the local version, WASM output may differ silently. Mitigation: monitor for audio regressions after runner OS upgrades; pin to a GitHub release binary if drift occurs.
- **`gh-pages` branch accumulation** → PR preview directories are cleaned up by the action on PR close, but force-pushes to `gh-pages` for production deploys could interfere. Mitigation: `rossjrw/pr-preview-action` is designed to coexist with `peaceiris/actions-gh-pages` — it commits to subdirectories, not the root.
- **Preview deployments limited to same-repo PRs** → The `pull_request` trigger provides a read-only `GITHUB_TOKEN` for PRs from forks, so `contents: write` is ineffective and preview deploys will silently fail for fork-originated PRs. This is acceptable for a private single-owner repo. If fork support is ever needed, `pull_request_target` would be required, which carries significant security implications and must be carefully managed.
- **release-please PAT requirement** → The default `GITHUB_TOKEN` cannot trigger downstream workflows (a limitation of GitHub Actions). The release-please workflow may need a PAT with `contents: write` and `pull-requests: write` scopes if the deploy workflow must fire on release PR merges. Mitigation: create a PAT and store as a repository secret (`RELEASE_PLEASE_TOKEN`).
- **Playwright on CI** → Playwright requires browser binaries. The `ubuntu-latest` runner needs `npx playwright install --with-deps`. This adds ~30–60s per run. Mitigation: cache Playwright browsers keyed on Playwright version.

## Migration Plan

1. Create all workflow files and config files on the feature branch
2. Merge to `develop` via the normal stacked PR flow
3. In GitHub Settings: enable branch protection on `develop` (require status checks) and `main` (require status checks + restrict merge to owner)
4. Configure Pages: set source to `gh-pages` branch
5. ~~Create `RELEASE_PLEASE_TOKEN` secret in repo settings~~ **Done.**
6. Merge first PR to `main` to validate the full deploy pipeline end-to-end

## Open Questions

~~Does the GitHub repo have a PAT available for release-please, or should the initial implementation use `GITHUB_TOKEN` and accept the downstream trigger limitation?~~ **Resolved:** A PAT will be created and stored as `RELEASE_PLEASE_TOKEN`.

~~Should `ci-develop.yml` also run Playwright (e2e), or only vitest (unit/component)?~~ **Resolved:** Playwright runs on develop PRs.
