## Context

The synth UI header currently shows a plain `<span>SYNTH-D</span>` with no interactivity and no version information. The README has an ASCII architecture diagram that is large and hard to maintain, and no documentation of the branching or deployment model. Build-time constants (version, branch) are not currently injected by Vite.

## Goals / Non-Goals

**Goals:**
- Make the SYNTH-D title a clickable link to the GitHub repository
- Show a build-time version + branch label beneath the title in the header
- Add a live-synth link at the top of README
- Add branching and deployment documentation to README
- Remove the ASCII architecture diagram from README

**Non-Goals:**
- Runtime version fetching (no API calls, no fetch from package.json at runtime)
- Dark/light mode or other visual theme changes
- Changes to audio, MIDI, DSP, or test infrastructure

## Decisions

### Inject version and branch via Vite `define`

**Decision:** Use Vite's `define` config option to expose `__APP_VERSION__` and `__GIT_BRANCH__` as build-time string constants.

**Rationale:** `import.meta.env.VITE_*` variables require `.env` files or CI secrets; `define` lets us derive values programmatically in `vite.config.js` using Node's `child_process` and the `package.json` import. This is the idiomatic Vite approach for build-time constants.

**Alternatives considered:**
- `import.meta.env.VITE_VERSION` via `.env` — requires manual maintenance or extra CI step; rejected
- Fetching `/package.json` at runtime — unnecessarily couples the browser to a static file; rejected
- Hardcoding the version — breaks on every release; rejected

**Branch detection:** `git rev-parse --abbrev-ref HEAD` in a try/catch; falls back to `'unknown'` if git is unavailable (e.g., in a clean CI checkout without git history). On GitHub Actions the branch is available via `GITHUB_REF_NAME`; the try/catch is sufficient since the workflow always has git.

### Header markup: `<div>` wrapper, not an `<a>` wrapping both labels

**Decision:** Replace `<span class="title">` with a `<div class="title-block">` containing an `<a class="title">` and a `<span class="version-label">`.

**Rationale:** Wrapping both labels in a single `<a>` would make the version label part of the click target, which is semantically incorrect (the version label is informational, not a link). A flex-column wrapper with the `<a>` on top and the `<span>` below is cleaner and more accessible.

### Version label style: reuse `.sub-label` values, not the class

**Decision:** Apply the same CSS values as Filter.svelte's `.sub-label` (9 px, `#666`, uppercase, `letter-spacing: 0.1em`) directly in `App.svelte`'s scoped styles rather than sharing a global class.

**Rationale:** Svelte component styles are scoped by default. Extracting a shared global class would require a global stylesheet or a CSS custom property layer — disproportionate for two matching values. Duplication of four CSS properties is acceptable here.

### README: Mermaid diagram vs prose vs ASCII

**Decision:** Use a simple prose + table description of the branch flow, not a Mermaid diagram.

**Rationale:** Mermaid rendering depends on the GitHub Markdown renderer; it works on GitHub but may not render in other contexts. Prose with a clear table is universally readable and easier to maintain.

## Risks / Trade-offs

- **Branch detection in CI**: `git rev-parse --abbrev-ref HEAD` may return `HEAD` in detached-HEAD CI checkouts. On GitHub Actions, this happens for `push` events; `GITHUB_REF_NAME` is the reliable alternative. The deploy workflow runs on `push` to `main`, so the production build will always show `v1.1.0 (HEAD)` unless we also read `process.env.GITHUB_REF_NAME`. Mitigation: prefer `GITHUB_REF_NAME` when set, fall back to git command, fall back to `'unknown'`. Production builds on `main` will correctly show just the version number because the conditional hides the branch when it equals `main` — and `GITHUB_REF_NAME` on a `push` to `main` is `main`.

- **README link maintenance**: the live link `https://davidirvine.github.io/synth-d/` is hardcoded. If the repo or Pages URL ever changes, it requires a manual update. Acceptable — this is a stable URL tied to the repo name.

## Open Questions

None — all decisions resolved during exploration.
