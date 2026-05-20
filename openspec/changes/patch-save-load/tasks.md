## 1. Central synth store (land green before anything else)

- [x] 1.1 Create `src/state/synth.svelte.js` exporting a runes `$state` store keyed by every in-scope param (all knob params + all switch params), seeded from the existing factory `DEFAULTS` plus switch defaults; export the param-name list and the audio-param set
- [x] 1.2 Add a single DSP subscriber (`$effect` or setter wrapper) that calls `engine.setParam(name, value)` only for audio params and only for finite values, with a guard preventing redundant/duplicate fires
- [x] 1.3 Add unit tests for the store: seeding from defaults, that only audio+finite values reach `setParam`, that non-finite/non-audio keys are skipped, and no duplicate fire on equal-value writes
- [x] 1.4 Rebind `Knob.svelte` so its `externalValue` is fed from the store; preserve the clamp + spring-animate + not-while-dragging behavior; on user change write the store (not a bare `onchange`)
- [x] 1.5 Rebind `Oscillator.svelte` to read/write osc1/2/3 wave, osc1/2/3 range, and osc3 LFO mode from the store; remove its `reset` prop and reset `$effect`
- [x] 1.6 Rebind `Filter.svelte` (key track) to the store; remove its `reset` prop and reset `$effect`
- [x] 1.7 Rebind `Effects.svelte` (delayOn, delayModOn, reverbOn) to the store; remove its `reset` prop and reset `$effect`
- [x] 1.8 Rebind `Mixer.svelte`, `AmpEnv.svelte`, `Modulation.svelte`, `Glide.svelte` to the store; remove any `reset` prop usage
- [x] 1.9 Update `App.svelte`: remove `ccExternalValues` and `resetCounter`; route knob/switch `onchange` and MIDI CC input through the store; ensure no MIDI⇄store⇄knob feedback loop (value-equality + not-while-dragging guards)
- [x] 1.10 Migrate affected component/unit tests to the store model; run `npx vitest run` until green
- [ ] 1.11 Run `npx stryker run` and restore mutation score to ≥85% for changed modules
- [ ] 1.12 Run `npx playwright test`; confirm power-on/off knob animation, discrete reset, and DSP/UI agreement still pass

## 2. Power-on applies the active patch

- [x] 2.1 Introduce an `activePatch` concept (defaults = the initial active patch) and replace `handleToggle`'s hardcoded `ccExternalValues = {...DEFAULTS}; resetCounter++` with "apply the active patch to the store"
- [x] 2.2 Preserve power-off behavior: knobs return to power-off rest positions per `knob-power-state` (store/externalValue path), no audio
- [x] 2.3 Add tests: power-on with no patch loaded applies factory defaults; power-on after a (stubbed) loaded patch applies that patch; consecutive power cycles behave consistently

## 3. Patch persistence layer

- [x] 3.1 Create `src/patches/storage.js` (or similar) with `listPatches()`, `savePatch(name, data)`, `loadPatch(name)`, `deletePatch(name)` using a `synth-d:patches` index key + `synth-d:patch:<name>` slots
- [x] 3.2 Define the patch envelope `{ name, version, params }`; `savePatch` serializes only in-scope params (exclude register, MIDI CC map, mod-wheel)
- [x] 3.3 Wrap all `localStorage` access so unavailable/quota/corrupt-JSON failures are caught and surfaced as non-fatal (never throw into audio/UI); a missing/corrupt slot reads as absent
- [x] 3.4 Add name validation: trim, reject empty/whitespace-only, cap ~40 chars; collisions are not errors (routed to overwrite by the caller)
- [x] 3.5 Add unit tests: round-trip save/list/load/delete; index stays consistent; excluded params absent from serialized data; storage-failure paths are non-fatal; validation rejects bad names

## 4. Patch UI (header popover)

- [x] 4.1 Create `src/components/PatchControl.svelte`: header trigger showing `PATCH: <name>` plus dirty `*`; styled to match `MidiStatus.svelte`; lives outside the `inert` `<main>` so it works while powered off
- [x] 4.2 Build the popover: list of saved patches with the active one marked `▸`, per-row load affordance, and an empty-state message when none exist
- [x] 4.3 Add the inline name field (prefilled with the active patch name) + SAVE; on existing-name, show an inline "Overwrite <name>?" confirm before writing
- [x] 4.4 Add per-row delete with an inline "delete? ✓ ✕" confirm (never one-click)
- [x] 4.5 Wire load: powered on → apply to store immediately; powered off → set as active patch for next power-on; loading clears dirty
- [x] 4.6 Implement dirty tracking (serialized current in-scope state vs. saved slot) and bind the `*` marker; saving/loading clears it
- [x] 4.7 Mount `PatchControl` in `App.svelte`'s header next to `MidiStatus`/`PowerButton`
- [x] 4.8 Add component tests: save (new + overwrite confirm), load (on/off), delete (confirm + cancel), name validation, empty state, dirty marker, no `window.prompt`/`confirm` used

## 5. End-to-end verification

- [x] 5.1 Add a Playwright E2E: power on → tweak params → save a named patch → reload page → load the patch → assert params restored
- [ ] 5.2 Run the full completion-gate suite (`npx vitest run`, `npx stryker run`, `npx playwright test`) and confirm all green
