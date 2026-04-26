## Why

The modulation source blend (`modSrc`) hardcodes `no.noise` (white noise), so selecting pink noise in the mixer has no effect on modulation — a user who sets the noise type to pink expects consistent behaviour across both paths. This fix makes modulation noise respect the same `noiseType` selector that the mixer already uses.

## What Changes

- `faust/synth.dsp`: replace `no.noise` in `modSrc = osc3Signal * (1 - modMix) + no.noise * modMix` with `noiseSrc`, where `noiseSrc = select2(int(noiseType), no.noise, no.pink_noise)` is already computed for the mixer

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `modulation`: update the noise-source requirement so the modulation mix uses the same noise type (white or pink) as the mixer

## Impact

- `faust/synth.dsp`: one-line change to `modSrc`; `noiseSrc` is already defined above and can be referenced directly
- No UI changes, no Svelte component changes, no test-infrastructure changes
- Rebuilt WASM artifacts required after DSP edit (`npm run faust:build`)
