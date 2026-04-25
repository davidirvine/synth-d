## Why

The synthesizer signal chain currently has no spatial or time-based effects. Adding a shimmer reverb — modeled after the Lexicon 224 plate reverb with a pitch shifter in the feedback path, in the spirit of the Vongon UltraSheer — gives sounds the lush, ethereal quality that classic hardware is known for and that cannot be achieved with ordinary synthesis parameters.

## What Changes

- Add a custom shimmer reverb DSP stage to `faust/synth.dsp` between the ladder filter and the VCA, implementing a plate-style diffusion network with a granular pitch shifter (octave up) feeding back into the reverb input
- Add `reverbOn`, `reverbMix`, `reverbDecay`, and `reverbShimmer` parameters to the FAUST parameter set; `reverbOn` bypasses the reverb stage entirely when 0
- Add a `Reverb.svelte` UI component with an on/off toggle button and three knobs (mix, decay, shimmer) in the same style as existing panels
- Expose `reverbMix`, `reverbDecay`, and `reverbShimmer` via the MIDI CC learn system
- Mount the Reverb panel in `App.svelte` in the `filter-output-grid`, between the Filter and Amp Env panels

## Capabilities

### New Capabilities

- `reverb`: Lexicon 224-style plate reverb with pitch-shifted feedback (shimmer) inserted between the filter and VCA, with an on/off bypass switch and mix, decay, and shimmer knobs; mix/decay/shimmer are MIDI-learnable

### Modified Capabilities

- `dsp-engine`: The signal chain changes from `filteredSig → VCA` to `filteredSig → reverb → VCA`; `reverbOn`, `reverbMix`, `reverbDecay`, and `reverbShimmer` are added to the parameter contract

## Impact

- `faust/synth.dsp`: new reverb parameters and shimmer reverb processing stage
- `src/components/Reverb.svelte` + `src/components/Reverb.test.js`: new component
- `src/audio/midiCcMap.js`: three new CC entries
- `App.svelte`: Reverb panel mounted in the UI
