## Why

Five small independent bugs and polish issues have accumulated across the DSP and UI layers. None is individually complex, but each produces a noticeable regression or inconsistency; grouping them into one branch keeps the change log clean and reduces overhead.

## What Changes

- **Pink noise silent** *(investigated — no code change required)*: The `noiseType` parameter path `/synth/noiseType` is correctly routed through `setParam` to the DSP node; `no.pink_noise` compiles and plays correctly. Pink noise was verified to work as intended. No fix is needed.
- **D/R lock defaults to off**: The Decay/Release lock switch in the Amp Envelope initialises to off. It should default to on so that decay and release move together out of the box.
- **Max delay time doubled**: The delay time maximum is 1 second. Doubling it to 2 seconds requires updating the DSP hslider range, the UI knob max, and the App.svelte CC scaling registry. The AudioContext must also be explicitly locked to 48 kHz so that the existing `maxDelayLen = 96000` buffer (2 × 48 000 samples) is guaranteed to cover the full 2-second range at runtime.
- **Oscillator waveshape switches not centred**: The three `.wave-row` button groups in the Oscillator panel sit left-aligned. They should be centred within the panel column.
- **Filter contour amount label causes layout reflow**: The knob value label below the filter contour amount knob changes width as its text changes, causing surrounding elements to shift. A global `min-width` fix on `.knob-value` in `Knob.svelte` (mirroring the scoped fix already applied to the reverb LPF knob in `Effects.svelte`) will stabilise all knob value labels. The scoped override in `Effects.svelte` will be removed as redundant.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mixer`: Pink noise selection produces audible output (verified working — no change required).
- `dsp-engine`: AudioContext must be created at exactly 48 kHz; `setParam` correctly routes `noiseType` to the DSP node (verified — no change required).
- `delay`: Delay time range extended from 0.01–1.0 s to 0.01–2.0 s.
- `ad-envelope`: D/R lock initialises to on (locked) rather than off.
- `knob`: Value label must have a stable fixed minimum width to prevent layout reflow on value change.

## Impact

- `faust/synth.dsp`: `delayTime` hslider max `1.0` → `2.0`
- `src/audio/engine.js`: `AudioContext` constructor gains `{ sampleRate: 48000 }`
- `src/App.svelte`: `delayTime` CC registry max `1.0` → `2.0`
- `src/components/Effects.svelte`: `delayTime` knob `max={1.0}` → `max={2.0}`; remove scoped `.knob-value` min-width override
- `src/components/AmpEnv.svelte`: `drLock` initial state and reset value `0` → `1`
- `src/components/Oscillator.svelte`: `.wave-row` gains `justify-content: center`
- `src/components/Knob.svelte`: `.knob-value` gains `min-width`, `display: inline-block`, `text-align: center`
- No new dependencies
- No breaking changes
