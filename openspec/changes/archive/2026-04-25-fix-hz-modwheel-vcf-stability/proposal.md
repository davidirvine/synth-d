## Why

Three small but observable correctness bugs: the Hz display rounds sub-10 Hz values to whole numbers so the log knob appears frozen at low settings; the mod wheel initialises out of sync between Svelte state and the FAUST DSP, causing a silent jump on first movement; and audio-rate noise on the cutoff modulation path periodically destabilises `ve.moog_vcf`, producing pops or runaway resonance.

## What Changes

- `src/lib/math.js` — `formatValue`: replace `Math.round` with `toFixed(1)` (or equivalent) for values below 10 Hz so sub-10 Hz readings display as "0.1 Hz" rather than "0 Hz"
- `faust/synth.dsp` + Svelte state initialisation — align the mod wheel `hslider` default and the Svelte store initial value to `0.5` so they agree at power-on without requiring a first movement
- `faust/synth.dsp` — insert a one-pole smoother on `filterModHz` before it enters the cutoff sum to eliminate audio-rate transients that destabilise `ve.moog_vcf`

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `knob`: add Hz-range display precision requirement — sub-10 Hz values SHALL show one decimal place
- `ladder-filter`: add cutoff-input stability requirement — modulation Hz signal SHALL be smoothed before entering the cutoff sum
- `midi`: add power-on sync requirement — mod wheel initial value SHALL be identical in Svelte state and the FAUST DSP at startup

## Impact

- `src/lib/math.js`: one-line change in `formatValue`
- `faust/synth.dsp`: add smoother expression on `filterModHz`; update mod wheel `hslider` default from current value to `0.5`
- Svelte state / store initialisation file (wherever mod wheel default is set): update initial value to `0.5`
- WASM rebuild required after DSP edits (`npm run faust:build`)
- No new dependencies; no breaking API changes
