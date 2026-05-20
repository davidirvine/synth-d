## Why

A synth is only as useful as the sounds you can keep. Today every knob and switch resets to defaults on power-on and there is no way to capture, name, or recall a sound. Players who dial in a patch they like lose it the moment they power off or reload the page. We want to let users save the current sound under a name and load it back later.

## What Changes

- Add the ability to **save** the current synth sound as a named patch, **load** a saved patch back, and **delete** patches the user no longer wants.
- A patch captures the full *sound*: all continuous knob parameters plus all discrete switch/toggle parameters (oscillator waveforms and ranges, OSC3 LFO mode, key track, delay/delay-mod/reverb on-off). Performance and controller state — keyboard register, MIDI CC assignments, and the mod-wheel position — are intentionally **not** part of a patch.
- Add a **PATCH** control to the header (next to the MIDI status and power button) that opens a small popover: a list of saved patches with per-row load/delete, plus an inline name field and a SAVE button. The popover stays reachable while the synth is powered off so patches can be loaded at any time.
- Patches persist in the browser via `localStorage` named slots, so they survive a page reload. The slot name is the patch name.
- **BREAKING (internal behavior):** power-on no longer unconditionally resets to factory defaults. Power-on now applies the *active patch* (the last loaded patch, or the factory defaults if none has been loaded). This replaces the current `reset`-signal mechanism with a single central state store as the source of truth for synth parameters.

## Capabilities

### New Capabilities

- `patch-save-load`: Saving, loading, and deleting named synth patches; the patch data model and what it captures (knobs + switches, excluding performance/controller state); `localStorage` persistence with named slots; dirty tracking (live state vs. saved slot); and the header PATCH popover UI (list, load, delete-with-confirm, inline naming, save-with-overwrite-confirm, dirty marker, empty state).

### Modified Capabilities

- `power-on-reset`: Power-on now applies the **active patch** rather than always resetting to factory defaults; factory defaults become the bootstrap/initial active patch. The per-component numeric `reset`-prop signal is replaced by a central synth-parameter store that holds discrete (switch) state and continuous (knob) values, and that drives both the DSP (`setParam`) and the UI. Knob `externalValue` / spring-animation behavior is preserved — the store becomes the source feeding it.

## Impact

- **New code:** central synth-parameter store module; patch-persistence module (localStorage CRUD + validation); header `PatchControl` component + popover.
- **Modified code:** `src/App.svelte` (state ownership, power-on/off, MIDI CC routing now writing the store; header gains the patch control); panel components `Oscillator`, `Mixer`, `Filter`, `AmpEnv`, `Modulation`, `Glide`, `Effects`, and `Knob` (read/write the store instead of owning discrete state / receiving a `reset` prop); `src/audio/engine.js` interaction via a store-driven `setParam` path.
- **Tests:** component and unit tests for all the above are affected by the store refactor (significant); Stryker mutation gate (≥85%) and Playwright E2E must stay green. A new E2E covers a save → reload → load round-trip.
- **Persistence surface:** new `localStorage` keys under a `synth-d:` namespace (`synth-d:patches` index + `synth-d:patch:<name>` slots).
- **No new runtime dependencies.**
