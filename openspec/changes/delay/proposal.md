## Why

The synthesizer has no time-based repeat effect. A digital delay gives sounds rhythmic echo and depth — a staple of both classic synthesizer patches and modern sound design — complementing the shimmer reverb already in progress.

## What Changes

- Add a delay DSP stage to `faust/synth.dsp` post-VCA (after the amplifier envelope, before master volume) using `de.sdelay` from the FAUST standard library
- Add `delayOn`, `delayTime`, `delayFeedback`, and `delayMix` parameters to the FAUST parameter set; `delayOn` bypasses the stage entirely when 0
- Add a `Delay.svelte` UI component with an on/off toggle button and three knobs (time, feedback, mix) in the same style as the Glide and Reverb panels
- Expose `delayTime`, `delayFeedback`, and `delayMix` via the MIDI CC learn system
- Mount the Delay panel in `App.svelte` after the Amp Env panel, reflecting its post-VCA position in the signal chain

## Capabilities

### New Capabilities

- `delay`: Feedback delay inserted post-VCA, with an on/off bypass toggle and time (10 ms–1 s), feedback (0–0.9), and mix (0–1) controls exposed as MIDI-learnable knobs

### Modified Capabilities

- `dsp-engine`: Signal chain gains a post-VCA delay stage; `delayOn`, `delayTime`, `delayFeedback`, and `delayMix` are added to the parameter contract

## Impact

- `faust/synth.dsp`: new delay parameters and processing stage after VCA
- `src/components/Delay.svelte` + `src/components/Delay.test.js`: new component
- `src/App.svelte`: Delay panel mounted after Amp Env; `KNOB_PARAMS` extended
- `src/audio/midiCcMap.js`: three new CC entries
