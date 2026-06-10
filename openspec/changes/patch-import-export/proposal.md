## Why

Patches today live only in the browser's `localStorage` — they cannot leave the
machine that created them. Users have no way to back up their sounds, move them
to another browser or device, or share a patch with someone else. Because a
patch is already a small JSON envelope, exposing it as a portable `.json` file
is a natural, high-value extension; the real work is making imported files safe
to trust and fitting the controls into an already-dense patch manager.

## What Changes

- **Export the active patch** to a downloadable `.json` file from the patch
  manager. The file is a versioned, self-describing contract that wraps the
  existing patch envelope.
- **Import a single patch** from a user-selected `.json` file. Import is a
  hardened, **atomic** validate-then-commit pipeline: an untrusted file is fully
  proven good in memory before a single write touches `localStorage`, so a bad
  file changes nothing.
- **Two-layer validation of imported files**:
  - a hand-rolled **structural** gate (shape/types/file-format version) that
    rejects malformed files with a human-readable reason, and
  - a **value** layer that coerces in-range — clamping continuous parameters to
    their bounds and falling back to defaults for out-of-domain switches.
- **Non-destructive import**: an imported patch whose name collides with an
  existing one is **auto-suffixed** with an integer rather than overwriting.
- **A canonical JSON Schema document** describing the file format, authored as a
  reference artifact (validation remains hand-rolled — no new runtime
  dependency).
- **A footer action bar** in the patch manager popover holding the Export and
  Import controls, leaving the existing per-row controls untouched.

## Capabilities

### New Capabilities

- `patch-import-export`: Exporting the active patch to a portable, versioned
  `.json` file and importing a single patch from such a file, including the
  structural-then-value validation pipeline, atomic non-destructive commit,
  name normalization with collision auto-suffixing, and the patch-manager UI
  that exposes these actions.

### Modified Capabilities

<!-- None. This change reuses patch-save-load's existing primitives
     (validateName, savePatch, the param scope) without altering their
     requirements. -->

## Impact

- **New code**: a parse/validate/serialize module under `src/patches/`
  (mirroring `storage.js`), plus a JSON Schema document describing the file
  format.
- **Modified UI**: `src/components/PatchControl.svelte` gains a footer action
  bar and a hidden file input; per-row load/rename/delete controls are
  unchanged.
- **Reused, unchanged**: `savePatch` / `validateName` / `MAX_NAME_LENGTH` from
  `src/patches/storage.js`, and the `PARAM_SCHEMA` bounds/defaults from
  `src/param-schema.js` (read-only — **not** modified).
- **No new dependencies**: validation is hand-rolled in the existing house
  style; no `ajv`/`zod`.
- **Tests**: new unit tests for the import/export module and UI; possible
  extension of `e2e/patches.spec.js`.
