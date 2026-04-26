## Why

The mixer has no visual feedback about signal level, making it impossible to tell when the combined oscillator output is hot enough to drive the pre-filter soft clipper. Players need to see in real time when the mixer is clipping so they can make informed decisions about oscillator levels rather than discovering instability by ear.

## What Changes

- Add a `vbargraph` to `faust/synth.dsp` exposing the pre-filter mixer peak level as a readable DSP parameter
- Add a `getMixerPeak()` function to `src/audio/engine.js` that polls the bargraph value
- Add a new `LevelMeter` Svelte component rendering an LED strip with clip indicator
- Embed the `LevelMeter` in `src/components/Mixer.svelte`

## Capabilities

### New Capabilities

- `mixer-level-meter`: An LED level meter in the mixer panel showing pre-filter signal level with a latching clip indicator

### Modified Capabilities

- `dsp-engine`: A `vbargraph` is added to the DSP to expose pre-filter mixer peak level as a readable parameter
- `mixer`: The mixer panel gains a visual level meter component

## Impact

- `faust/synth.dsp`: Add `vbargraph` measuring `abs(mixerOut)` before the filter; WASM must be rebuilt
- `src/audio/engine.js`: Add `getMixerPeak()` function reading the bargraph via `node.getParamValue`
- `src/components/LevelMeter.svelte`: New component (LED strip, clip latch)
- `src/components/LevelMeter.test.js`: New test file
- `src/components/Mixer.svelte`: Import and embed `LevelMeter`, pass polling function
