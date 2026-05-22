## Why

Today there is a single on-screen wheel (mod only), drawn as a filled rectangle that holds wherever it is dragged. Hardware Moog-style synths have two spring-loaded wheels — PITCH and MOD — that return to a neutral center when released, with a tactile, mass-laden feel. We want to bring that physical behavior on-screen: two cursor-style wheels that spring back to 50%, with the spring "feel" tunable per wheel.

## What Changes

- Replace the single mod `WheelPanel` with a `WheelsPanel` containing two wheels, **MOD** and **PITCH**, each with a horizontally-centered label above its track. Remove the standalone "WHEEL" label.
- Replace the filled-rectangle value indicator with a **cursor**: a full-width horizontal line, color `#c87941`, 4px thick (2× the knob indicator's 2px), positioned vertically by value.
- Both wheels rest at **50%** and, on release, **spring back to 50%** via a damped harmonic oscillator (tunable mass, spring strength, damping) — underdamped by default so the cursor overshoots, decelerates, and reverses before settling.
- During spring-back the synth parameter follows the cursor every animation frame, so the wobble back to center is **audible**.
- Add an on-screen **PITCH wheel** that bends `freq` ±2 semitones (50% = no bend), reusing the existing MIDI pitch-bend signal path.
- **BREAKING (behavior):** the MOD wheel no longer holds an arbitrary modulation depth — it rests at and springs back to 0.5, so releasing returns modulation depth to half rather than leaving it where set.
- Add a **gear button** (top-left of the wheels component) opening a popup to edit per-wheel physics (mass, spring strength, damping) via **knobs** (reusing `Knob.svelte`), with a reset-to-defaults action. Physics values persist to `localStorage`.
- Make each wheel an independently focusable `role="slider"` with a visible focus ring; arrow keys drive the focused wheel and spring home on keyup.

## Capabilities

### New Capabilities
- `pitch-wheel`: on-screen PITCH wheel that bends oscillator frequency ±2 semitones around a 50% no-bend rest position, spring-loaded back to center.
- `wheel-physics`: the spring-back physics model (mass / spring strength / damping per wheel), the gear-button settings popup using knobs, and localStorage persistence of physics parameters.

### Modified Capabilities
- `modulation`: the virtual mod wheel rests at and springs back to 0.5 on release (modulation depth follows the spring in real time) instead of holding its dragged position; value is shown as a cursor line rather than a fill.
- `synth-ui`: the wheels panel presents two labeled wheels (MOD, PITCH) with cursor indicators, a gear/settings button, and per-wheel focus rings, replacing the single "WHEEL"-labeled fill slider.

## Impact

- **Components:** `src/components/WheelPanel.svelte` is replaced by a `WheelsPanel` container plus a reusable `Wheel` child and a physics-settings popup; `Knob.svelte` is reused inside the popup.
- **App wiring:** `src/App.svelte` — the keyboard-row mount (line ~449), the existing `modWheelExternal`/`onModWheelChange` path, and the MIDI pitch-bend handler (`onPitchBend`, line ~147) gain an on-screen counterpart for the PITCH wheel.
- **Persistence:** new `localStorage` key `synth-d:wheel-physics`, following the existing `synth-d:` namespace + validate-on-load pattern (`src/patches/storage.js`, `src/audio/midiCcMap.js`).
- **DSP:** no new FAUST parameters required — PITCH reuses the `freq` bend path, MOD reuses `modWheel`.
