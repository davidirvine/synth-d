## Why

When the synth is powered off while one or more keys are held (mouse, QWERTY, or MIDI), the amber highlight remains on those keys until the user explicitly releases them. The keyboard then misrepresents the engine state — it shows "playing" while audio is suspended and controls are inert. Powering off should leave the keyboard in a clean, fully-released visual state, mirroring the engine state.

## What Changes

- On power-off, the keyboard's `activeKeys` set is cleared so no key remains highlighted.
- Note-off side effects normally triggered by releasing the last key (gate → 0) are honored when the clear happens, so the engine and UI remain consistent for any subsequent power-on.
- Holding a QWERTY/MIDI key across a power-off → power-on cycle SHALL NOT leave a stale highlight or stuck gate from before the cycle.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `keyboard`: add a requirement that all active-key highlights are cleared and gate is released when the synth transitions to powered-off, regardless of which input source(s) populated `activeKeys`.

## Impact

- **Code**: `src/components/Keyboard.svelte` (expose a release-all entry point alongside the existing `_triggerNote` / `_releaseNote` bindings); `src/App.svelte` `handleToggle()` (call the release-all on the power-off branch, before `engine.powerOff()`).
- **Specs**: delta to `openspec/specs/keyboard/spec.md` only.
- **APIs / dependencies**: none.
- **Tests**: new component test for the release-all behavior; new scenario covering the power-off → power-on cycle with a held key.
