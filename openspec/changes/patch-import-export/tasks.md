## 1. File format module — export & serialization

- [x] 1.1 Create `src/patches/file.js` with a `FILE_FORMAT_VERSION` constant set to `1` and a `serializePatch({ name, version, params })` function that returns the versioned file object `{ fileFormat, name, version, params }`.
- [x] 1.2 Add a `patchFilename(name)` helper that derives a filesystem-safe `.json` download filename from a patch name (replace/strip unsafe characters).
- [x] 1.3 Add unit tests in `src/patches/file.test.js` for `serializePatch` (shape, `fileFormat` present and distinct from patch `version`, no performance/controller fields) and `patchFilename` (unsafe-character sanitization, `.json` suffix).

## 2. Import — structural validation

- [ ] 2.1 Add `parsePatchFile(text)` to `src/patches/file.js` that rejects input above a fixed byte ceiling (~1 MB) before parsing, then parses JSON and rejects unparseable input with a human-readable reason (result object, not a throw — match the `{ ok, error }` house style in `storage.js`).
- [ ] 2.2 Add hand-rolled structural validation: top-level is an object, `fileFormat` is present and equals a recognized version (currently only `1`), `name` is a string, `params` is an object, parameter values are numbers — rejecting with a human-readable reason on any failure. An empty `params` object is accepted.
- [ ] 2.3 Add unit tests covering oversized input, unparseable JSON, non-object top level, missing/unrecognized `fileFormat` (including a higher-than-current version), non-string `name`, non-object `params`, and non-number param values — each asserting rejection with a reason; plus an empty-`params` file asserting acceptance.

## 3. Import — value coercion

- [ ] 3.1 Define a `DISCRETE_DOMAINS` table in the import module (NOT in `PARAM_SCHEMA`) giving each switch param its valid integer domain, mirroring the synth's authoritative values (sources: `faust/synth.dsp` `nentry` defs and the panel controls). Enumerate exactly these entries: `osc1Wave`/`osc2Wave`/`osc3Wave` → `0..5`; `osc1Range`/`osc2Range`/`osc3Range` → `-2..2`; `osc3LfoMode`, `noiseType`, `drLock`, `modToOsc1`, `modToOsc2`, `modToFilter`, `glideOn`, `delayOn`, `delayModOn`, `reverbOn` → `0..1`. Omit `keyTrack` (it carries `min`/`max` in `PARAM_SCHEMA` and uses those bounds).
- [ ] 3.2 Implement `coerceParams(params)` reading `PARAM_SCHEMA`/`PARAM_NAMES` and `DISCRETE_DOMAINS`, branching on the `PARAM_SCHEMA` `kind` field: clamp `kind: 'knob'` params to `[min, max]`; for `kind: 'switch'` params, derive the domain from `PARAM_SCHEMA` `min`/`max` when present (e.g. `keyTrack`) else from `DISCRETE_DOMAINS`, keep the value only if it is an integer within that domain, else fall back to `default`; drop unknown / non-finite params.
- [ ] 3.3 Add unit tests for knob clamping (above max, below min), switch in-domain preservation, switch default-fallback (non-integer and out-of-range), `keyTrack` coercion via its schema bounds, and dropping of unknown and non-finite params (including that a `kind: 'controller'` param such as `modWheel` is dropped, since it is absent from `PARAM_NAMES`).
- [ ] 3.4 Add a drift test that parses the discrete `nentry(...)` min/max definitions from `faust/synth.dsp` (the authoritative DSP source) and asserts each `DISCRETE_DOMAINS` entry matches, so changing a waveform/range count in the DSP without updating the import table fails a test (the drift risk the design calls out). Read the DSP file as text — do NOT import component-local constants like `WAVEFORMS` from `.svelte` files, which are not exported. Assert in BOTH directions: every switch param in `PARAM_NAMES` has coverage (either `min`/`max` in `PARAM_SCHEMA`, e.g. `keyTrack`, or a `DISCRETE_DOMAINS` entry), and every `DISCRETE_DOMAINS` entry corresponds to a real switch param — so a newly added switch with no coercion coverage fails the test.

## 4. Import — name normalization & collision resolution

- [ ] 4.1 Implement `uniquePatchName(name, existingNames)` that normalizes via the existing `validateName` gate, then auto-suffixes with an incrementing integer on collision, truncating the base (never the suffix) when `base + " N"` would exceed `MAX_NAME_LENGTH`.
- [ ] 4.2 Add unit tests for normalization (mixed-case/untrimmed → upper, trimmed, capped), auto-suffix on collision (`NAME` → `NAME 2`), incrementing past taken suffixes, and base-truncation when the suffix would overflow the cap.

## 5. Import — atomic commit pipeline

- [ ] 5.1 Implement `importPatch(text)` composing parse → structural-validate → coerce → unique-name (reading the current names via `listPatches()` internally) fully in memory; on success it performs the single terminal `savePatch()` write and returns the committed patch, on rejection it writes nothing and returns the reason. This function owns the `savePatch()` call; the Svelte handler (task 7.3) only invokes it. (Collision logic stays unit-testable via the pure `uniquePatchName(name, existingNames)` helper from task 4.1.)
- [ ] 5.2 Add unit tests asserting atomicity: a file rejected at any stage results in zero added/removed/changed stored patches, and a valid file commits exactly once and appears in the list. Seed any preexisting patches via `savePatch()` with a `localStorage.clear()` in `beforeEach`, matching the established setup pattern in `PatchControl.test.js`.

## 6. JSON Schema reference document

- [ ] 6.1 Author the canonical JSON Schema document for the patch file format under `src/patches/` (reference documentation only; not loaded at runtime).
- [ ] 6.2 Add a test that validates fixtures against both the JSON Schema document and the hand-rolled validator, asserting they agree (guards against drift). Fixtures MUST cover the valid case plus at least one example per structural rejection reason: missing/unrecognized `fileFormat`, non-string `name`, non-object `params`, and non-number param value. The test MAY add a JSON Schema validator (e.g. `ajv`) as a **devDependency** — the no-runtime-dependency constraint does not apply to the test toolchain.

## 7. Patch manager UI — footer action bar

- [ ] 7.1 Add a footer action bar below the save row in `src/components/PatchControl.svelte` with Export and Import controls, leaving the per-row load/rename/delete controls untouched and reusing existing control/panel theme tokens. Apply appropriate ARIA (accessible button labels; the disabled Export reflects its state, matching the component's existing accessibility conventions).
- [ ] 7.2 Wire Export to serialize the active patch and trigger a Blob download named via `patchFilename`, mutating no stored or active-patch state; disable the Export control when there is no active patch.
- [ ] 7.3 Wire Import to a hidden `<input type="file" accept=".json">`, read the file (handling `FileReader` errors as rejections), call `importPatch(text)`, and surface the success patch name or the rejection reason via the existing status/error line; reset `input.value = ''` after each attempt so re-selecting the same file fires `change`; ensure Import is available while powered off.
- [ ] 7.4 Add component tests in `src/components/PatchControl.test.js` (following the existing mocking pattern in that file) for footer rendering, Export disabled with no active patch, Import available while powered off, export download wiring, import success (patch appears), import rejection (reason shown, no patch added), a file-read error surfacing a reason, re-importing the same file triggering the handler a second time (the `input.value` reset), and the Export control communicating its disabled state accessibly (native `disabled`/`aria-disabled`) when no patch is active.

## 8. End-to-end & verification

- [ ] 8.1 Extend `e2e/patches.spec.js` with an export→import round-trip covering a name collision auto-suffix.
- [ ] 8.2 Add an E2E rejection scenario: importing an invalid (e.g. non-JSON) file surfaces the rejection reason in the popover and adds no patch.
