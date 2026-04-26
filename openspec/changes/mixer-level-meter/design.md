## Context

The FAUST DSP runs the complete signal chain inside a single AudioWorklet. There is no JavaScript-accessible tap point mid-chain. The only way to read an internal signal value from JavaScript is via the FAUST parameter interface: `node.getParamValue(path)`. FAUST's `vbargraph` primitive is designed for exactly this — it computes a meter value within the DSP and exposes it as a readable output parameter.

The pre-filter soft clip (`ma.tanh` on `mixerOut`) is being added in `fix-engine-stability`. The level meter must measure the signal **before** the `ma.tanh` so it can show how hard the mixer is being driven into the clipper. A peak reading of > 1.0 means the tanh is actively saturating; this is the clip threshold for the LED.

The existing `AnalyserNode` taps the post-VCA, post-master output — it cannot be reused for pre-filter metering.

## Goals / Non-Goals

**Goals:**
- Read pre-filter mixer peak level from the DSP in real time
- Display an 8-segment LED strip in the Mixer panel with clip indication
- Latch the clip indicator for ~1.5 seconds after a peak above threshold
- Require no changes to the Web Audio graph topology

**Non-Goals:**
- RMS metering (peak is sufficient for clip detection)
- Per-source (per-oscillator) level meters
- A stereo meter (the DSP is mono)
- Metering of any other signal point (post-filter, post-VCA, etc.)

## Decisions

**FAUST `vbargraph` for pre-filter level — primary approach, with bargraph spike fallback**

`vbargraph("mixerPeak [unit:linear]", 0, 4, abs(mixerOut))` exposes the instantaneous absolute value of the pre-tanh mixer output. The ceiling of 4 matches the theoretical maximum (all four sources at unity). `node.getParamValue('/synth/mixerPeak')` reads it from JavaScript. If the `@grame/faustwasm` binding does not surface bargraph values via `getParamValue`, fall back to `hgroup`/`vgroup` parameter exposure or spike an alternative approach before committing to implementation.

**Clip threshold at 1.0 (linear)**

Values above 1.0 mean the `ma.tanh` added in `fix-engine-stability` is actively saturating. This is the musically meaningful clip point. Values 0.85–1.0 indicate the signal is approaching the saturation zone.

**LED segment mapping (8 segments, linear scale 0–1.5)**

```
Segment  Range        Colour
1–4      0.0 – 0.5    green
5–6      0.5 – 0.85   yellow
7        0.85 – 1.0   orange
8 (CLIP) > 1.0        red (latches 1.5 s)
```

The meter ceiling is 1.5 rather than the DSP maximum of 4 — values above 1.5 are heavily saturated and visually indistinguishable. Capping at 1.5 gives more resolution in the useful range.

**Polling in `LevelMeter.svelte` via `requestAnimationFrame`**

The component calls the provided `getPeak` function on every animation frame while mounted. `requestAnimationFrame` naturally rate-limits to the display refresh rate (~60fps), which is more than sufficient for a level meter and avoids setting up a separate timer. The component stops polling when unmounted (`onDestroy`).

**`getMixerPeak()` in engine.js**

A thin wrapper: `return node ? node.getParamValue(PARAM_PREFIX + 'mixerPeak') : 0`. Returns 0 when the engine is off so the meter shows silence rather than an error.

**LevelMeter rendered as a vertical column of `<div>` elements**

Simple CSS-driven segments. No SVG needed. Each segment is a fixed-height div; active segments are coloured, inactive are dark. The clip segment (top) uses a separate class with red colouring and stays lit via a boolean flag reset by a `setTimeout`.

**Placement in Mixer.svelte — vertical column alongside the knobs**

The mixer panel currently stacks knobs vertically in `.mixer-col`. The `LevelMeter` is added as a sibling column to the right of the knobs, aligned vertically to span the full height of the mixer controls. This mirrors the layout of a hardware mixer channel strip.

## Risks / Trade-offs

- [bargraph read access unconfirmed] `node.getParamValue` for FAUST bargraph values has not been validated against `@grame/faustwasm`. → Spike this first (task 1.1) before writing any UI code. If it fails, the DSP approach needs to change.
- [WASM rebuild dependency] This change requires `fix-engine-stability` to have already rebuilt the WASM (since both touch `synth.dsp`). If sequenced incorrectly, DSP changes will conflict. → Implement after `fix-engine-stability` is merged, or coordinate DSP edits carefully.
- [requestAnimationFrame when tab is backgrounded] `rAF` pauses in background tabs, so the meter stops updating when the user switches tabs. → Acceptable; the meter is a visual aid, not a safety mechanism.
