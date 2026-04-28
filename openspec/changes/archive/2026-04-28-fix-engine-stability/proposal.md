## Why

The digital ladder filter (`ve.moog_vcf`) can produce NaN when driven with a hot mixer signal at high resonance values, silently killing the Web Audio context and requiring a page reload to recover. Separately, the power button only suspends and resumes the audio context, so a crashed context cannot be recovered by power cycling, and DSP parameter state can diverge from the UI. Both issues make the synth feel fragile and difficult to recover from when pushed into extreme settings.

## What Changes

- Add pre-filter soft clipping (`ma.tanh`) on the mixer output to replicate the analog ladder's natural input saturation and prevent NaN generation
- Cap resonance internally at 0.97 so the DSP never reaches the mathematical singularity at resonance=1.0
- Add output stage saturation driven by master volume — gain increases past 60% master vol into a `ma.tanh` clipper, replicating a pushed analog output stage
- Change power-off to full WASM teardown (`ctx.close()`, node disconnect, null all references)
- Change power-on to always perform a full WASM compile and AudioWorklet init (no `initialized` guard)
- On every power-on, reset all parameters — continuous and discrete — to their safe default values, with continuous knobs animating back to default via a spring
- Add spring animation to `Knob.svelte` for external value changes (bypassed during drag)
- Add a `reset` prop to all panel components so App.svelte can trigger a full discrete state reset on power-on

## Capabilities

### New Capabilities

- `engine-lifecycle`: Full teardown on power-off and full init on power-on, replacing suspend/resume
- `power-on-reset`: All params reset to safe defaults on every power-on, with knob spring animation
- `output-saturation`: Master volume drives a soft clipper that adds harmonic saturation above 60% volume

### Modified Capabilities

- `knob`: Adds spring animation for external value changes
- `dsp-engine`: Pre-filter soft clip and resonance safety cap added to signal chain

## Impact

- `faust/synth.dsp`: Pre-filter `ma.tanh`, resonance cap, output saturation stage
- `src/audio/engine.js`: Full teardown in `powerOff`, always-init in `powerOn`, remove `initialized` flag
- `src/App.svelte`: DEFAULTS object, post-power-on param flush, reset counter prop to all panels
- `src/components/Knob.svelte`: Spring on visual position for external value changes
- `src/components/Oscillator.svelte`, `Mixer.svelte`, `Filter.svelte`, `AmpEnv.svelte`, `Modulation.svelte`, `Glide.svelte`, `Effects.svelte`: Accept `reset` prop, restore discrete state and fire `onchange` for all params
- WASM must be recompiled after DSP changes (`npm run build:dsp` or equivalent)
