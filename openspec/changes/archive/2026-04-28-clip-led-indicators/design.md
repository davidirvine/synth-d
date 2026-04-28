## Context

Two `ma.tanh` stages exist in the signal chain where saturation is meaningful to the player:

1. Pre-filter: `filteredSig = mixerOut : ma.tanh : ve.moog_vcf(...)` — clipping here drives filter saturation
2. Master output: `masterOut = vcaOut * (masterVol / 0.6) : ma.tanh` — clipping here limits the final output level

The `mixer-level-meter` change already implemented an 8-segment LED strip for the first point. The `getMixerPeak()` function, `setOutputParamHandler` wiring, and FAUST `vbargraph` for `mixerPeak` are all in place. This change replaces the visual component and adds the second indicator.

Panel structure reference:

```
Mixer.svelte                    AmpEnv.svelte
┌─────────────────────┐         ┌─────────────────────┐
│ MIXER             ● │         │ OUTPUT            ● │
├─────────────────────┤         ├─────────────────────┤
│ osc1 [knob]         │         │     [volume]        │
│ osc2 [knob]         │         │ ── loudness ── [d/r] │
│ osc3 [knob]         │         │ [a][d][s][r]        │
│ noise [knob][w][p]  │         └─────────────────────┘
└─────────────────────┘
```

`Mixer.svelte` already has a `.panel-header` flex row. `AmpEnv.svelte` currently has a bare `<span class="panel-label">output</span>` that must be promoted to a `.panel-header` row.

## Goals / Non-Goals

**Goals:**

- Single LED per panel: dim red at rest, bright red when peak > 1.0, 1.5 s latch
- Identical visual behaviour and component API for both indicators
- Reuse all existing mixer peak infrastructure; add parallel output peak infrastructure
- Remove the 8-segment `LevelMeter` component entirely

**Non-Goals:**

- RMS metering, dB display, or multi-segment level indication
- Metering at any other point in the signal chain
- Making the clip threshold configurable

## Decisions

### Decision 1: `ClipLed.svelte` props mirror `LevelMeter.svelte`

`ClipLed` accepts `getPeak: () => number` and `powered: boolean`. Same contract, drop-in replacement in `Mixer.svelte`. `AmpEnv.svelte` adds these as new props with safe defaults (`getPeak = () => 0`, `powered = false`).

### Decision 2: LED colours

```
State    Colour    Hex
dark     dim red   #4a1010
clip     bright    #ff3333
```

Dim red reads as "this LED exists and could fire" without drawing attention. Bright red is unambiguous. Both colours sit within the existing dark-panel aesthetic (`#1c1c1c` background).

The LED is rendered as a small filled circle (8×8 px) using a single `<div>` with `border-radius: 50%`. No SVG needed.

### Decision 3: Latch via `setTimeout`, cleared and rescheduled on each new clip event

```
rAF callback:
  peak = getPeak()
  if peak > 1.0:
    clipLit = true
    clearTimeout(latchHandle)
    latchHandle = setTimeout(() => clipLit = false, 1500)
```

Rescheduling on every clip event means a sustained clip keeps the LED lit continuously. A single transient latches for exactly 1.5 s from the last clip frame.

### Decision 4: Output peak — new FAUST `vbargraph` on pre-master-tanh signal

The pre-master-tanh intermediate value is `vcaOut * (masterVol / 0.6)`. Using `attach`:

```faust
outputPeak = abs(vcaOut * (masterVol / 0.6))
           : vbargraph("outputPeak [unit:linear]", 0, 2);
masterOut  = attach(vcaOut * (masterVol / 0.6), outputPeak) : ma.tanh;
```

Ceiling of 2 gives headroom for display; clip threshold in JS is still 1.0. The `attach` primitive prevents dead-code elimination — same pattern as `mixerPeak`.

`getOutputPeak()` in `engine.js` follows the identical module-variable pattern as `getMixerPeak()`. Both handlers are registered in a single `setOutputParamHandler` call (the handler receives path and value for both bargraphs).

### Decision 5: `setOutputParamHandler` handles both bargraphs in one callback

The existing handler registered for `mixerPeak` is extended to also capture `outputPeak`:

```javascript
node.setOutputParamHandler((path, value) => {
  if (path === PARAM_PREFIX + 'mixerPeak')  mixerPeakValue  = value
  if (path === PARAM_PREFIX + 'outputPeak') outputPeakValue = value
})
```

Only one `setOutputParamHandler` call is permitted per node; adding a second would overwrite the first.

### Decision 6: `LevelMeter.svelte` and `LevelMeter.test.js` are deleted

No deprecation shim. `Mixer.svelte` imports `ClipLed` directly. The test coverage moves to `ClipLed.test.js`.

## Risks / Trade-offs

- **WASM rebuild required** — the output vbargraph adds to `synth.dsp`; existing filter-stability-safeguards changes may conflict if both touch the same lines. Coordinate DSP edits or implement after those changes land.
- **rAF pauses in background tabs** — meter stops when tab is hidden; acceptable for a visual aid.
- **`attach` expression duplicates the multiply** — `vcaOut * (masterVol / 0.6)` is written twice. FAUST's CSE should fold this, but if not, the duplication is inert (both branches produce identical values).

## Migration Plan

Backward-compatible. `getMixerPeak()` API is unchanged. `getOutputPeak()` is a new export. `LevelMeter` deletion is internal. No localStorage, no saved state, no user-visible param names changed.
