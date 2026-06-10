## Context

Patches are persisted as JSON envelopes (`{ name, version, params }`) in
`localStorage` by `src/patches/storage.js`. The patch manager
(`src/components/PatchControl.svelte`) is a popover with a scrollable patch list
(each row carrying load / rename / delete), a save row, and an error line. There
is no file I/O anywhere in the app, and no schema-validation dependency — the
codebase validates by hand: `validateName` normalizes names, and save/load
filter `params` against `PARAM_NAMES`, dropping unknown and non-finite values.

`src/param-schema.js` holds the authoritative `PARAM_SCHEMA`: continuous "knob"
params carry `min`/`max`/`default`; discrete "switch" params carry only a
`default` (no bounds — their valid domains live in code/comments, not the
table). This asymmetry is the central design constraint for value coercion.

Exposing patches as portable files turns the patch shape into a *public
contract*: a file can be hand-edited, produced by an older app version, or
simply malformed, and then fed back in. The design's centre of gravity is
therefore making import safe, not serializing export.

## Goals / Non-Goals

**Goals:**

- Export the active patch to a downloadable, versioned `.json` file.
- Import a single patch from a user-selected file through an atomic,
  validate-then-commit pipeline that never half-writes.
- Validate imported files structurally (hand-rolled, no new dependency) and
  coerce their values into range (clamp knobs, default-fallback switches, drop
  junk).
- Resolve name collisions non-destructively via integer auto-suffixing.
- Add Export/Import to the patch manager without disturbing the existing
  per-row controls.
- Ship a canonical JSON Schema document as reference documentation for the file
  format.

**Non-Goals:**

- **Bundle / multi-patch files.** Each file holds exactly one patch. (Considered
  and deferred; see Decisions.)
- **A runtime schema validator** (`ajv`/`zod`). Validation stays hand-rolled.
- **Modifying `PARAM_SCHEMA`.** It stays frozen and untouched. (Switch domains
  needed for coercion live in a small table inside the import module, derived
  from the existing DSP/UI sources — not added to `PARAM_SCHEMA`.)
- **File-format migration logic.** Only the current `fileFormat` version is
  accepted; older/newer versions are rejected with a reason. The version field
  exists so migration *can* be added later, not so it works now.
- **Importing performance/controller state** (keyboard register, CC maps,
  mod-wheel) — out of patch scope, as today.

## Decisions

### One patch per file, wrapped in a versioned envelope

The file is `{ fileFormat: <number>, name, version, params }`. The inner
`{ name, version, params }` is exactly the existing patch envelope, so export is
essentially "read the stored envelope (or build it from the active patch), add
`fileFormat`, serialize." `fileFormat` is a **separate** version from the patch
`version`: the on-disk contract (field layout, encoding rules) and the patch
data shape evolve for different reasons, and conflating them would force a file
bump every time the patch shape changes and vice-versa.

*Alternative considered — bundle files (`{ patches: [...] }`):* better for "back
up my whole library," but introduces merge semantics, a second schema, and more
UI. Single-patch matches the primary "save/share this sound" gesture and keeps
the schema equal to the existing envelope. Deferred, not precluded — a future
bundle format would be a new `fileFormat`/type.

### Two-layer validation: structure rejects, values coerce

Import separates **structural** validation from **value** coercion because they
have opposite postures and would otherwise contradict each other:

- **Structural gate (reject):** top-level is an object; `fileFormat` is present
  and recognized; `name` is a string; `params` is an object; values are numbers
  (`typeof === 'number'` and finite). It checks number-ness **only** — the
  integer-domain check for switches lives exclusively in the coercion layer, so
  the gate's posture stays "reject malformed shape," never "coerce values."
  Failure → reject the whole file with a human-readable reason. This is the
  trust boundary for untrusted input.
- **Value layer (coerce):** on an already-valid file, clamp knobs to
  `[min,max]`, fall back out-of-domain switches to `default`, drop
  unknown/non-finite params. This mirrors and reuses the spirit of the existing
  save/load filtering.

Stating the split explicitly resolves the apparent tension between "validate
against a schema" (strict) and "clamp values" (lenient): they operate at
different layers — shape vs. magnitude — and never fight.

### Switch coercion: import-local discrete-domain table → default fallback

Coercion branches on `PARAM_SCHEMA`'s existing `kind` discriminator
(`'knob'` vs `'switch'`) — the authoritative classification, not a reinvented
"has min/max" heuristic. Knobs clamp against their `min`/`max`. For switches the
valid domain comes from, in order of precedence:

1. `PARAM_SCHEMA`'s own `min`/`max` when the switch carries them — currently only
   `keyTrack`, which is `ccScalable` and so already has `min: 0, max: 1`
   (`param-schema.js:140`). These bounds are used directly; they are **not**
   duplicated into the import table, avoiding two sources that can drift.
2. Otherwise, a small **discrete-domain table in the import module** (not in
   `PARAM_SCHEMA`), for the switches that carry only a `default`.

This honors the "don't touch `PARAM_SCHEMA`" constraint while making "out of
domain" concrete and testable. The table's domains are not invented; they mirror
the authoritative values the synth already enforces (the FAUST
`nentry(min, max, step)` definitions in `faust/synth.dsp`, echoed by the UI
controls):

| Switch params (lacking schema bounds)                                                     | Domain          | Source                          |
| ----------------------------------------------------------------------------------------- | --------------- | ------------------------------- |
| `osc1Wave` / `osc2Wave` / `osc3Wave`                                                      | `0..5`          | `Oscillator.svelte` `WAVEFORMS` |
| `osc1Range` / `osc2Range` / `osc3Range`                                                   | `-2..2`         | `Oscillator.svelte` `stepRange` |
| `osc3LfoMode`, `noiseType`, `drLock`, `modToOsc1/2`, `modToFilter`, `glideOn`, `delayOn`, `delayModOn`, `reverbOn` | `0..1` (toggle) | respective panel toggles        |

(`keyTrack` is intentionally absent — it uses its `PARAM_SCHEMA` bounds.) A
switch value is kept only if it is an integer within its domain; anything else
(non-integer, out of range; NaN already dropped upstream) falls back to
`default` — always a safe, valid value.

*Alternative considered — defer fallback (switches as-is):* matches today's
`loadPatch`, which range-checks nothing. Rejected because import is the
untrusted-input boundary where an out-of-range switch index (e.g. `osc1Wave:
47`) could drive an invalid UI/DSP state, which is exactly what coercion should
prevent. *Alternative — enrich `PARAM_SCHEMA` with domains:* cleaner long-term
but a cross-cutting change to a frozen, widely-consumed table; deferred. The
import-local table is the minimal change that makes the contract real.

### `name` is type-checked in the structural gate; empty `params` is valid

The structural gate also requires `name` to be a **string** — a file with
`"name": 42` is rejected there with a reason, rather than slipping through to
`validateName` and producing a less clean failure. An empty or whitespace-only
string is still allowed through the structural gate and handled by
`validateName` during normalization (which rejects it with the same
`{ ok, error }` shape as a save), so the name path has one consistent rejection
contract.

An **empty `params: {}`** is structurally valid and intended: after coercion it
yields a patch carrying only factory defaults (missing params are filled from
defaults on load, exactly as today). This is a legitimate "reset-to-defaults"
patch, not an error.

Two clarifications about adjacent fields, to preempt confusion:

- **`version` is a constant schema version, not a per-save counter.** `savePatch`
  always writes `version: PATCH_VERSION` (`storage.js:165`); it does not
  auto-increment. Export therefore writes the envelope's `version` as-is, and
  import preserves a numeric `version` or falls back to `PATCH_VERSION` —
  identical to what `loadPatch` already does (`storage.js:208`). There is no
  per-patch version arithmetic to reason about.
- **Controller-kind params need no special handling.** Coercion iterates
  `PARAM_NAMES`, which deliberately excludes the sole `kind: 'controller'` param
  (`modWheel`, which is not store-backed). An imported `modWheel` is thus simply
  not iterated and is dropped as out-of-scope — consistent with the
  "no performance/controller state" non-goal, with no `'controller'` branch in
  `coerceParams`.

### File-format version starts at `1`; only the current version is accepted

`FILE_FORMAT_VERSION` is **`1`** for the initial release. The structural gate
accepts only files whose `fileFormat` equals a recognized version (currently the
single value `1`); any other value — including a future, higher version — is
rejected with a reason. This is deliberate: with no migration logic yet, it is
safer to refuse an unknown shape than to guess at it. The JSON Schema document
pins the same constant so the two cannot disagree.

### Export requires an active patch

Export acts on the active patch. "No active patch" means the patch manager's
`activePatch.name` is `null` (the state before any load or after a delete). In
that case the **Export control is disabled** rather than exporting an
unnamed/empty patch — exporting "nothing" has no useful meaning and a disabled
control communicates that directly. Import is unaffected (it never depends on
active state and stays available even while powered off).

### Import is bounded: reject oversized input

Before parsing, the import rejects input above a fixed byte ceiling (e.g. ~1 MB
— far above any real single patch, which is well under a kilobyte) with a
human-readable reason. This caps the cost of `JSON.parse` and the coercion loop
on a crafted or accidental large file, and `FileReader` errors (read aborted,
permission denied) are surfaced through the same status line as any other
rejection. Both are treated as ordinary rejections: they write nothing,
preserving atomicity.

### Hand-rolled validation, JSON Schema as documentation only

The structural checks are simple enough (object / number / known version) to
express as a handful of guards in the house style, avoiding a runtime
dependency. The canonical JSON Schema is authored as a **reference artifact**
that documents the contract for humans and external tooling; it is not loaded or
executed at runtime. A test asserts the hand-rolled validator and the schema
document agree on representative fixtures, so the doc cannot silently drift. That
drift test MAY use a JSON Schema validator (e.g. `ajv`) as a **devDependency** —
the "no new dependency" constraint applies to the runtime bundle only, not to
the test toolchain.

### Atomic = pure pipeline, single terminal write

A single-patch file makes atomicity almost free: parse → structural-validate →
normalize name → resolve collision → coerce values, all in memory, then exactly
**one** `savePatch()` call commits. Nothing touches `localStorage` until the
file is fully proven good, so a rejected import is inherently a no-op. No
rollback machinery is needed because no partial state is ever produced.

### Name normalization and collision auto-suffix

The imported name runs through the **same** `validateName` gate as save
(trim → upper-case → cap at `MAX_NAME_LENGTH`), guaranteeing imported patches
round-trip with saved ones. On collision the importer appends `" N"` (starting
at 2) and increments until free, rather than overwriting — import is
non-destructive by contract. If `base + " N"` would exceed `MAX_NAME_LENGTH`,
the **base** is truncated (never the suffix) so the unique suffix always
survives. The uniqueness check is against the current patch index from
`storage.js`.

### Module placement and reuse

New parse/validate/serialize/coerce logic lives in a small module under
`src/patches/` mirroring `storage.js` (e.g. `src/patches/file.js`), keeping the
file contract beside the storage contract and the UI thin. It reuses
`validateName`, `MAX_NAME_LENGTH`, `savePatch`, and the patch index from
`storage.js`, and reads `PARAM_SCHEMA`/`PARAM_NAMES` from `param-schema.js`. The
module is pure/testable; the Svelte component only wires Blob download and the
hidden `<input type=file>` to it.

### UI: footer action bar

A footer bar holding Export and Import sits below the save row in the popover.
The per-row controls (load / ✎ / ✕) are already at visual capacity, so they are
left untouched. Export acts on the active patch; Import is a hidden
`<input type="file" accept=".json">` triggered by the Import button, with
results (success name or rejection reason) surfaced through the existing error/
status line. Styling reuses the existing control/panel CSS custom properties.

Three browser-behaviour notes for the file input: `accept=".json"` is only an
advisory filter (a user can still pick any file — handled by the structural gate's
parse failure, not assumed away); cancelling the picker fires no `change` event
and is a natural no-op needing no "no file selected" handling; and the handler
resets `input.value = ''` after each attempt so re-selecting the **same** file
fires `change` again (otherwise a second import of an identical filename
silently does nothing). The file's MIME type is **deliberately not** sniffed —
the structural gate validates by content, so a valid `.json` served as
`text/plain` still imports; no MIME guard is added.

## Risks / Trade-offs

- **Import-local switch-domain table can drift from the DSP/UI** (e.g. a 7th
  waveform is added but the import table still says `0..5`) → Mitigation: derive
  the domains from the same authoritative values the synth enforces and cover
  each switch's bounds in unit tests; the table is small and colocated with the
  coercion code. Out-of-domain values fall back to a safe `default`, so a stale
  table fails closed, never to an invalid state.
- **Hand-rolled validator drifts from the JSON Schema doc** → Mitigation: a test
  validates shared fixtures against both, failing if they disagree.
- **Auto-suffix in a near-full library** (e.g. base collides and many suffixes
  taken) → Mitigation: increment until free; base truncation guarantees a
  fitting candidate always exists, and the search is bounded by the patch count.
- **Filesystem-unsafe patch names** (names are upper-cased free text) →
  Mitigation: sanitize the download filename (replace/strip unsafe characters),
  independent of the in-file `name`.
- **`fileFormat` version is load-bearing only later** → Accepted: only the
  current version is recognized now; the field's value is exercised by the
  "unrecognized version rejected" test so the gate is real from day one.
- **No bundle/backup-all** → Accepted as a Non-Goal; single-patch is the primary
  gesture and a bundle is an additive future `fileFormat`.
- **Cross-tab storage race** (two tabs importing at once → non-atomic
  `readIndex`/`writeIndex` in `storage.js`) → Accepted, not a regression: import
  commits through the same single `savePatch()` path as a normal save and
  inherits exactly its existing cross-tab properties. Out of scope to fix here;
  noted so it is not later misread as introduced by this change.
