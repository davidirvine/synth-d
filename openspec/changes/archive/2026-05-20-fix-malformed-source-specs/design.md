## Context

`openspec validate --specs` reports 6 of 46 specs invalid. All six are malformed source-of-truth files, not wrong capabilities:

- `pr-previews`, `readme-live-link`, `synth-title-link`, `version-display` start with `## ADDED Requirements` — the delta operator was written into the canonical file by a prior archive. OpenSpec parses 0 requirements from them (verified: `openspec show <name> --json` returns no requirements; the raw `### Requirement:`/`#### Scenario:` content is present but unreachable because the file lacks `# Title` and `## Purpose`).
- `clip-led` has `# Clip LED` + `## Purpose` + `## Requirements` whose only body is `_No active requirements. See level-led spec._` (0 requirements → fails "at least one requirement").
- `sem-filter` has `# SEM Filter` + `## Purpose` + `## Requirements` with prose and a `### Migration Notes` heading; the `###` makes OpenSpec read "Migration Notes" as a requirement with no scenario (→ fails "every requirement has a scenario").

The validator requires every spec to have both `## Purpose` and `## Requirements`, and every requirement to have at least one `#### Scenario:`. This is the same class of defect just fixed in-place for `commit-review-cycle` (missing `## Purpose`) during the `fix-workflow-kernel-friction` archive.

## Goals / Non-Goals

**Goals:**

- Make `openspec validate --specs` green (0 failed) by repairing the 6 files to canonical structure.
- Preserve every existing requirement and scenario verbatim for the 4 category-A specs.
- Leave the 2 superseded capabilities documented as valid tombstones pointing to their replacements.

**Non-Goals:**

- No behavioural/requirement change to any capability. Category A is a wrapper repair; category B documents an already-decided supersession.
- No deletion of the superseded capabilities (keeping the tombstone preserves the historical pointer; deleting is a larger inventory decision — see Decisions).
- No `CLAUDE.md`/`STACK.md`/runtime change.

## Decisions

**Hybrid: delta-driven for the two tombstones, direct file repair for the four category-A specs.** OpenSpec requires every change to carry at least one delta (`openspec validate` rejects a zero-delta change), and `## Purpose` cannot be supplied by a delta — the archive rebuild validates the result and requires `## Purpose` to already exist in the main file (confirmed when `commit-review-cycle`'s rebuild aborted for a missing Purpose). This splits the work:

- **Category B (`clip-led`, `sem-filter`) → real deltas.** Each is genuinely gaining a requirement (a retirement/tombstone requirement, replacing an empty or mis-parsed section), so each gets a `specs/<cap>/spec.md` delta. To keep `openspec validate --specs` green on the branch (not only after archive) the apply phase also writes the same tombstone requirement directly into the main file. The delta uses `## MODIFIED Requirements` with the identical requirement: `openspec archive` rebuilds from the **post-merge `main`**, which by then already contains the tombstone requirement (written in the apply phase and merged), so the `MODIFIED` op finds its match and the rebuild is idempotent. It is `MODIFIED` rather than `ADDED` precisely because, at the moment archive runs, the requirement already exists in the source-of-truth file — an `ADDED` op would double-insert it. Task 3.3 verifies this rebuild at archive time and halts (rather than forcing) if the match is absent, which would mean the apply-phase edit never reached `main`.
- **Category A (4 specs) → direct edit, no delta.** Their requirements do not change and no delta op can add the missing `# Title`/`## Purpose`, so they are normalized in place in the apply phase (the same pattern used for `commit-review-cycle`'s Purpose). Correctness is proven by `openspec validate --specs` going green and by diffing that each requirement body is byte-identical apart from the added wrapper and the `## ADDED Requirements` → `## Requirements` rename.

Alternative — force all six through deltas — rejected: the category-A mains parse to 0 requirements (nothing for a `MODIFIED` delta to match) and the rebuild would still fail without a pre-existing Purpose. Alternative — carry zero deltas — rejected: `openspec validate` forbids it.

**Category A — minimal wrapper repair, content untouched.** For each of the 4 specs: prepend `# <Title>` and a one-paragraph `## Purpose` derived from the capability's existing requirements, then rename `## ADDED Requirements` → `## Requirements`. Titles: `# PR Previews`, `# README Live Link`, `# Synth Title Link`, `# Version Display`. The requirement and scenario blocks are moved under `## Requirements` unchanged.

**Category B — valid tombstones, not deletion.** Give `clip-led` and `sem-filter` one `### Requirement:` that states the capability is retired and superseded (by `level-led` / `ladder-filter`) plus a `#### Scenario:` asserting the replacement spec is authoritative. For `sem-filter`, the existing `### Migration Notes` heading is demoted to plain prose / bullets under the tombstone requirement so it is no longer parsed as a requirement. Keeping a tombstone (rather than removing the spec) preserves the supersession pointer that other docs and archived changes may reference. Alternative — delete the two spec files — rejected for this change: removing capabilities from the inventory is a separate, larger decision; tombstoning is the minimal validate-passing fix.

## Risks / Trade-offs

- **Direct spec edits without deltas could look like a discipline violation** → Documented here and provable: category-A requirement bodies are unchanged (verifiable by diff), and the only acceptance criterion is `openspec validate --specs` = 0 failed. The malformed files cannot be repaired through the delta pipeline anyway.
- **A future archive could re-introduce a delta header** → Out of scope here; this change fixes the current corrupted files. Follow-up (separate change): investigate why a prior `openspec archive` wrote `## ADDED Requirements` into source-of-truth files instead of canonical structure, and harden the sync so it cannot recur. Tracked as a non-goal of this change so it is not silently forgotten.
- **Tombstones keep retired capabilities in the inventory** → Accepted; they are clearly marked superseded and point to the live spec, which is more discoverable than a silent deletion.
