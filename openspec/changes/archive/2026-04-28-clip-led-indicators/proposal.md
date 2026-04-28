## Why

The existing `mixer-level-meter` change implemented an 8-segment LED strip showing pre-filter drive level. The real need is narrower and more immediate: knowing whether the `ma.tanh` soft clipper is saturating at two points in the signal chain — the mixer output (pre-filter) and the master output (post-VCA, post-master volume). A single clip LED per location conveys this at a glance without the visual complexity of a multi-segment meter. The LED has a dim red "dark" state so it reads as a hardware indicator that is present but not triggered, rather than appearing absent.

## What Changes

- Replace `LevelMeter.svelte` (8-segment strip) and its test file with a new `ClipLed.svelte` component: a single circular LED, dim red when below threshold, bright red when clipping, latching for 1.5 s
- Update `Mixer.svelte` to use `ClipLed` in place of `LevelMeter` — the `getPeak` / `getMixerPeak` / vbargraph wiring is unchanged
- Add a second FAUST `vbargraph` measuring the pre-master-tanh signal (`vcaOut × masterVol / 0.6`) and expose it via a new `getOutputPeak()` function in `engine.js`
- Update `AmpEnv.svelte` (the "output" panel) to wrap its label in a `panel-header` flex row and embed a `ClipLed` right-aligned, mirroring the mixer panel layout

## Capabilities

### New Capabilities

- `clip-led`: A reusable single-LED clip indicator component rendered in a panel label row, dark when below threshold, bright red with 1.5 s latch when above threshold

### Modified Capabilities

- `mixer`: The mixer panel's level meter changes from an 8-segment strip to a single `ClipLed`
- `dsp-engine`: A second `vbargraph` is added to expose pre-master-tanh peak level as a readable output parameter

## Impact

- `src/components/LevelMeter.svelte`: Deleted (replaced by `ClipLed.svelte`)
- `src/components/LevelMeter.test.js`: Deleted
- `src/components/ClipLed.svelte`: New component
- `src/components/ClipLed.test.js`: New test file
- `src/components/Mixer.svelte`: Import changed from `LevelMeter` to `ClipLed`; no structural change
- `src/components/AmpEnv.svelte`: Label promoted to `panel-header` row; `ClipLed` added; new `getOutputPeak` and `powered` props
- `faust/synth.dsp`: New `outputPeak` vbargraph; WASM rebuild required
- `src/audio/engine.js`: New `getOutputPeak()` export
- `src/App.svelte`: Pass `getOutputPeak` and `powered` to `AmpEnv`
- No new dependencies
- No breaking changes to any existing param names or API surface
