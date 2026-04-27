## Context

Five independent bugs and polish items are grouped into one branch to reduce workflow overhead. The fixes span the Faust DSP layer (`faust/synth.dsp`), the JS audio engine (`src/audio/engine.js`), and four Svelte UI components. None of the fixes shares a dependency with another, so they can be implemented in any order within the branch.

The codebase uses `@grame/faustwasm` to compile `synth.dsp` to WebAssembly at build time (`npm run faust:build`) and loads the resulting `dsp-module.wasm` + `dsp-meta.json` at runtime via `FaustMonoDspGenerator.createNode`. The AudioWorklet processor reads `sampleRate` from the `AudioWorkletGlobalScope` and passes it to `instanceInit` — meaning `ma.SR` in the Faust DSP resolves to the **runtime** AudioContext sample rate, not a compile-time constant.

## Goals / Non-Goals

**Goals:**
- Pink noise produces audible output when selected in the Mixer
- D/R lock is on by default; reset() also returns it to on
- Delay time range is 0.01–2.0 s across DSP, UI, and MIDI CC scaling
- AudioContext is locked to 48 kHz so `maxDelayLen = 96000` safely covers the 2-second maximum
- Oscillator waveshape button rows are horizontally centred within the panel
- All knob value labels have a stable minimum width; no layout reflow when displayed value changes width

**Non-Goals:**
- Changing the delay algorithm, feedback model, or any other delay parameter
- Altering any other envelope parameter defaults beyond D/R lock
- Per-knob overrides of the value label width (the fix is global)
- Making sample rate configurable by the user

## Decisions

### D1 — Lock AudioContext to 48 kHz
`engine.js` creates `new AudioContext()` with no options, leaving the browser to pick the sample rate from the OS audio device. With `maxDelayLen = 96000` and a new maximum of 2 seconds, 96 kHz contexts would only have 1 second of buffer — half the needed range.

**Decision**: Pass `{ sampleRate: 48000 }` to the `AudioContext` constructor.

*Alternatives considered*: Use `int(2.0 * ma.SR)` in the DSP for the buffer size — rejected because `de.fdelay`'s first argument must be a compile-time constant in Faust; `ma.SR` is not compile-time. Using a static `192000` would work but wastes memory and obscures the relationship between buffer size and sample rate.

### D2 — Global `.knob-value` min-width in Knob.svelte
A scoped workaround already exists in `Effects.svelte` for the reverb LPF knob. The filter contour amount knob has the same problem. Rather than adding a second scoped override, add `min-width`, `display: inline-block`, and `text-align: center` directly to `.knob-value` in `Knob.svelte` and remove the now-redundant `Effects.svelte` override.

*Alternatives considered*: CSS container queries or `ch`-based width — over-engineered; a simple `em`-based `min-width` matches the existing pattern.

### D3 — Pink noise investigation first
The `noiseType` parameter is not in App.svelte's defaults map or CC registry (unlike every continuous parameter). The Mixer component manages it as internal state and fires `onchange` when the user clicks, which routes to `setParam`. Whether this is the root cause of the silent pink noise requires confirming during implementation by checking the Faust parameter path and verifying `setParam('noiseType', 1)` reaches the DSP. No architectural change is assumed until the root cause is known.

### D4 — D/R lock reset value
The Amp Envelope `reset()` function is called when the synth powers off. Changing the reset value to `1` (locked) alongside the `$state(1)` initialisation ensures that power-cycle always returns the knob to the intended default.

## Risks / Trade-offs

- **48 kHz lock may not match device hardware rate** → Browsers resample transparently; audible quality impact is negligible at 48 kHz. Safari and Chrome both support `{ sampleRate: 48000 }` on `AudioContext`.
- **Global `.knob-value` min-width may clip very short labels on small knobs** → The value is set to match the widest expected formatted string for typical parameter ranges; visual regression testing will catch any clipping.
- **Pink noise root cause unknown** → If the fix is deeper than a routing issue (e.g., a Faust library bug with `no.pink_noise`), the task may expand. The task is written to allow for investigation time before committing to a specific fix.

## Open Questions

- What formatted string width should `.knob-value` `min-width` be set to? The existing Effects.svelte fix uses `5.5em`; a consistent value across all knobs needs visual verification during implementation.
