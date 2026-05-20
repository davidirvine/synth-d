## Why

Six source-of-truth specs fail `openspec validate --specs`, so the spec suite is not green and a future `openspec archive` that rebuilds any of them can abort (as just happened with `commit-review-cycle`'s missing `## Purpose`). Two distinct defects, both structural — no capability behaviour is wrong, only the spec files are malformed:

- **Leftover delta header (4 specs):** `pr-previews`, `readme-live-link`, `synth-title-link`, and `version-display` begin with a raw `## ADDED Requirements` header. A prior archive/sync wrote the delta operator into the source-of-truth file instead of canonical spec structure, so each lacks a `# Title` and `## Purpose` and OpenSpec cannot parse its requirements at all.
- **Superseded tombstones (2 specs):** `clip-led` (replaced by `level-led`) and `sem-filter` (replaced by `ladder-filter`) are fully retired — their components are deleted — but `clip-led`'s `## Requirements` section contains zero requirements and `sem-filter`'s `### Migration Notes` heading is mis-parsed as a requirement with no scenario.

## What Changes

- **Category A — normalize the 4 delta-header specs to canonical format:** add the `# <Title>` heading and a `## Purpose` section, and rename `## ADDED Requirements` → `## Requirements`. The requirement bodies and scenarios are unchanged — this is a wrapper repair only.
- **Category B — make the 2 tombstones valid:** give `clip-led` and `sem-filter` a single well-formed `### Requirement:` (with a scenario) that documents the capability as retired and points to its replacement (`level-led` / `ladder-filter`). For `sem-filter`, demote the `### Migration Notes` heading so it is no longer parsed as a requirement (fold its content under the tombstone requirement or as plain prose).
- **Verification:** `openspec validate --specs` reports all specs valid (0 failed).
- These are direct edits to `openspec/specs/*/spec.md`. No `CLAUDE.md`, `STACK.md`, or runtime code change. No behavioural/requirement-semantics change to any capability.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `clip-led`: currently a tombstone whose `## Requirements` section holds zero requirements (invalid). Add a single retirement requirement (with a scenario) recording supersession by `level-led`. (delta)
- `sem-filter`: currently a tombstone whose `### Migration Notes` heading mis-parses as a requirement with no scenario (invalid). Replace it with a single retirement requirement (with a scenario) recording supersession by `ladder-filter`. (delta)

> The four category-A specs (`pr-previews`, `readme-live-link`, `synth-title-link`, `version-display`) are **not** listed as modified capabilities and carry **no delta**: their requirements do not change, and no delta operation can add the `# Title`/`## Purpose` wrapper they are missing (the archive rebuild requires `## Purpose` to already exist — see design.md). They are repaired by direct edit to the source-of-truth file in the apply phase.

## Impact

- `openspec/specs/pr-previews/spec.md`, `openspec/specs/readme-live-link/spec.md`, `openspec/specs/synth-title-link/spec.md`, `openspec/specs/version-display/spec.md` — normalized to canonical spec structure (title + purpose + `## Requirements`).
- `openspec/specs/clip-led/spec.md`, `openspec/specs/sem-filter/spec.md` — tombstone requirement added / mis-parsed heading fixed so they validate.
- No change to `CLAUDE.md`, `STACK.md`, `.githooks/`, `.roborev.toml`, `scripts/`, or any runtime code.
