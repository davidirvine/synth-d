## Why

synth-d's code is already, in substance, a generic synth **chassis** (audio engine, MIDI, keyboard, patch storage, knob/wheel/scope UI) wrapped around a specific **subtractive instrument** (oscillators, SEM filter, effects, and its parameter set). The two are only *logically* separated — physically they are entangled at two points: the parameter schema is smeared across two files, and `App.svelte` mixes the generic application frame with the subtractive panel layout. This entanglement blocks reuse: a future change cannot lift the chassis into a reusable kernel preset (Phase 2, see design.md) until the seam is made explicit. This change makes that seam real, with zero behavior change, while a full test suite still backs the synth.

## What Changes

- Extract the parameter schema into a single instrument-owned module (`src/param-schema.js`): one entry per parameter, `name → { min, max, default, bipolar, kind: 'knob' | 'switch' }`. This becomes the single source of truth for what the subtractive instrument exposes.
- Make `state/synth.svelte.js` derive its defaults and `AUDIO_PARAMS`/`PARAM_NAMES` from the schema instead of holding its own `CONTINUOUS_DEFAULTS`/`SWITCH_DEFAULTS` literals.
- Make `App.svelte`'s knob metadata (`KNOB_PARAMS`, `BIPOLAR_PARAMS`, `powerOffValue`) derive from the schema instead of its own literal table.
- Split `App.svelte` into a generic **Shell** (header, power button, MIDI wiring, keyboard row, store seeding, wheel/scope plumbing) and an instrument-supplied **panel layout** (the `<panels>` grid of Oscillator/Mixer/Filter/AmpEnv/Effects/Modulation/Glide). The Shell knows nothing instrument-specific.
- Establish, as an explicit contract, that the chassis depends only on the universal engine params (`freq`, `gate`, `modWheel`, `mixerPeak`, `outputPeak`) plus whatever the instrument's schema declares — never on a hard-coded subtractive parameter.
- NOT a behavior change. The running synth must be byte-for-byte equivalent in behavior; the existing `vitest`, `stryker`, and `playwright` suites are the regression gate.

## Capabilities

### New Capabilities

- `chassis-architecture`: The synth is structured as an instrument-agnostic chassis plus an instrument layer joined by a single, explicit seam — the parameter schema. Defines the requirements that keep the chassis reusable: one instrument-owned schema module is the sole source of parameter metadata; the store and UI derive from it without duplication; the generic Shell contains no instrument-specific knowledge; and the chassis couples to the instrument only through the schema and the universal engine param contract.

### Modified Capabilities

<!-- None. This is a pure structural refactor with no spec-level behavior change.
     The user-visible behavior governed by synth-ui, engine-lifecycle, knob,
     patch-save-load, midi, etc. is unchanged and verified against existing tests. -->

## Impact

- **Code (chassis seam):** new `src/param-schema.js`; `src/state/synth.svelte.js` (defaults now derived); `src/App.svelte` (split into Shell + instrument panel layout); the knob-metadata block currently in `App.svelte`'s `<script module>`.
- **Tests:** existing `vitest` unit/component tests, `stryker` mutation (≥85%), and `playwright` E2E are the no-regression contract. The store re-exports `PARAM_DEFAULTS`/`PARAM_NAMES`/`AUDIO_PARAMS`, so their import paths are unchanged; the only import-path update is `powerOffValue` (now in the schema module) in `App.test.js`. Assertions should not change. (`KNOB_PARAMS` is module-private in `App.svelte`, and `BIPOLAR_PARAMS` has no external importers.)
- **No dependency, API, or build changes.** `vite.config.js` minification setting and the FAUST build pipeline are untouched.
- **Downstream (out of scope here):** unblocks Phase 2 `extract-workflow-kernel` — promoting the chassis into a reusable kernel preset in a new repo. Fully specified in design.md as the dependent follow-on; not implemented by this change.
