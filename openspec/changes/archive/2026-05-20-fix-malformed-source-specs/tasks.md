## 1. Category A — normalize the 4 delta-header specs

For each: prepend the `# <Title>` heading and the `## Purpose` paragraph below, rename `## ADDED Requirements` → `## Requirements`, and leave every `### Requirement:`/`#### Scenario:` body unchanged. Run prettier and confirm `openspec validate <name> --specs` passes for that spec.

- [x] 1.1 `openspec/specs/pr-previews/spec.md` — `# PR Previews`; Purpose: "Defines the automatic preview-deployment workflow for pull requests targeting `main` — when a preview build is deployed, the stable URL it is served at, and its lifecycle." Then validate `pr-previews`.
- [x] 1.2 `openspec/specs/readme-live-link/spec.md` — `# README Live Link`; Purpose: "Defines the centered live-demo link shown at the top of the README, immediately after the title, pointing to the deployed synth." Then validate `readme-live-link`.
- [x] 1.3 `openspec/specs/synth-title-link/spec.md` — `# Synth Title Link`; Purpose: "Defines the SYNTH-D header title being rendered as a hyperlink to the project's GitHub repository, without changing its visual appearance." Then validate `synth-title-link`.
- [x] 1.4 `openspec/specs/version-display/spec.md` — `# Version Display`; Purpose: "Defines the version label shown beneath the SYNTH-D title, including its build-time version/branch injection and its text styling." Then validate `version-display`.

## 2. Category B — make the 2 superseded tombstones valid

- [x] 2.1 `openspec/specs/clip-led/spec.md`: replace the `## Requirements` body (currently the italic line `_No active requirements. See level-led spec._`) with the `### Requirement: Clip LED capability is retired` requirement and its scenario, copied exactly from this change's `specs/clip-led/spec.md` delta (so the archive `MODIFIED` sync is idempotent). Run prettier and validate `clip-led`.
- [x] 2.2 `openspec/specs/sem-filter/spec.md`: replace the prose `## Requirements` body and the mis-parsed `### Migration Notes` heading with the `### Requirement: SEM filter capability is retired` requirement, its scenario, and the migration-notes bullet list, copied exactly from this change's `specs/sem-filter/spec.md` delta (no stray `###` heading). Run prettier and validate `sem-filter`.

## 3. Verification

- [x] 3.1 Run `openspec validate --specs` and confirm 0 failed (all 46 specs valid).
- [x] 3.2 Confirm category-A requirement bodies are unchanged: for each of the 4 specs, `git diff main -- <file>` shows only the added `# Title`/`## Purpose` and the `## ADDED Requirements` → `## Requirements` rename — no edits to `### Requirement:`/`#### Scenario:` text.
- [x] 3.3 At archive time (the `/opsx-archive-wt` step, after merge): confirm `openspec archive` rebuilds `clip-led` and `sem-filter` cleanly. The `MODIFIED` deltas match because the apply-phase edits (task 2) put the tombstone requirements into the source-of-truth files before merge, so the post-merge `main` the rebuild reads already contains the matching requirement. If the rebuild reports no requirement to modify, the task-2 edits did not reach `main` — halt and investigate rather than forcing.
