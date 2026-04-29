## Why

The ladder filter can crash when filter contour amount is set to medium-high values, particularly with fast attack times or rapid MIDI CC sweeps. The crash is caused by discontinuous jumps in `cutoffMod` — the summed filter frequency signal — that destabilise the `ve.moog_vcf` feedback internals, producing NaN that propagates through the audio worklet. The `setParam` path also has no guard against non-finite values reaching the DSP.

## What Changes

- Add a one-pole IIR smoother to the final `cutoffMod` signal in the FAUST DSP, limiting the rate of change reaching `ve.moog_vcf` regardless of source (envelope, key tracking, or modulation)
- Add `ma.tanh` saturation on the filter output as a secondary stability measure to catch any instability that escapes the smoother
- Add a `Number.isFinite` guard in `setParam()` in the JS audio engine so that NaN or Infinity values can never reach the DSP node, regardless of how they originate (MIDI scaling, corrupt localStorage, future API misuse)

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ladder-filter`: New stability requirements — `cutoffMod` must be smoothed before entering `ve.moog_vcf`, and filter output must be tanh-saturated
- `dsp-engine`: New requirement — `setParam` must reject non-finite values before forwarding to the DSP node

## Impact

- `faust/synth.dsp`: Two edits to the Ladder Filter section
- `src/audio/engine.js`: One guard added to `setParam`
- No UI changes
- No new dependencies
- No breaking changes — the smoother time constant (~2 ms) is inaudible at normal envelope settings; the tanh on output is transparent at typical signal levels
