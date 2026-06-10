## Why

The synth's knobs, MOD wheel, and PITCH wheel can only be adjusted by pointer drag (and arrow keys on the wheels). Mouse scroll-wheel adjustment is the dominant convention for hardware-style soft-synth controls and is the fastest way to nudge a value without a click-drag. While adding it, we also correct a long-standing fidelity bug: the MOD wheel currently springs back to a 0.5 centre rest, but a real mod wheel is a free, friction-held control that holds wherever it is left and rests at the bottom (zero modulation). Only the PITCH wheel should spring back.

## What Changes

- **Knobs respond to the mouse scroll wheel.** Hovering a knob and scrolling adjusts its value — one scroll notch = one `step`, `Shift`+scroll = one `fineStep` — reusing the knob's existing step/fine-step machinery. The wheel event is consumed so the page never scrolls (no part of the UI is scrollable).
- **PITCH wheel responds to the scroll wheel as a momentary bend.** Scrolling bends the pitch and the wheel then springs back to centre, mirroring a physical spring-loaded pitch wheel. Its existing damped-harmonic spring physics are unchanged.
- **MOD wheel becomes a real (non-spring) mod wheel.** **BREAKING (behavioural):** the MOD wheel no longer springs back. It holds the position it is left at, and its rest/default moves from `0.5` to `0` (zero modulation at rest). Scrolling moves it by a step and it holds. Drag and arrow keys continue to work but no longer spring-return. The FAUST `modWheel` default changes from `0.5` to `0` to match.
- **Wheel-physics settings UI becomes PITCH-only.** Because the MOD wheel no longer has spring physics, its mass/spring/damping knobs are removed from the settings popup, leaving physics controls for the PITCH wheel only.
- **Wheel-physics persistence drops the MOD branch.** The stored shape changes from `{ mod, pitch }` to `{ pitch }`. Existing localStorage blobs carrying a `mod` object load without error (the stale field is tolerated/ignored).
- **Knobs expose ARIA slider semantics**, matching the wheels (which already do), so scroll/keyboard-adjustable knobs announce their current value.

## Capabilities

### New Capabilities

_None — this change modifies existing capabilities only._

### Modified Capabilities

- `knob`: adds scroll-wheel input and ARIA slider semantics to the knob control.
- `pitch-wheel`: adds scroll-wheel input as a momentary spring-back bend.
- `modulation`: the virtual MOD wheel becomes non-spring, holds its position, and rests at `0`; adds scroll-wheel input; FAUST `modWheel` default becomes `0`.
- `wheel-physics`: spring-back, the settings popup, and persistence apply to the PITCH wheel only; the MOD wheel is removed from the physics model and its persisted field is dropped (with backward-compatible load).

## Impact

- **Components:** `src/components/Knob.svelte` (scroll handler, ARIA), `src/components/Wheel.svelte` (spring-disable + rest-position seam, scroll handler), `src/components/WheelsPanel.svelte` (MOD non-spring wiring, PITCH-only physics popup, mod rest `0`).
- **Audio/DSP:** `faust/synth.dsp` `modWheel` hslider default `0.5` → `0`. Rebuilt FAUST WASM artifact.
- **Persistence:** `src/audio/wheelPhysicsStore.js` (drop `mod` from save/load/validate; tolerate legacy `mod` field).
- **Physics:** `src/audio/wheelPhysics.js` — `REST`/defaults remain for PITCH; no longer applied to MOD.
- **Tests:** `Knob.test.js`, `Wheel.test.js`, `WheelsPanel.test.js`, `wheelPhysicsStore.test.js`, plus any pitch-bend/mod-wheel E2E expectations that assume mod springs back or rests at `0.5`.
