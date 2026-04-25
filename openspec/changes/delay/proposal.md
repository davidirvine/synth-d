## Why

The synthesizer has no time-based repeat effect. A digital delay gives sounds rhythmic echo and depth — a staple of both classic synthesizer patches and modern sound design — complementing the shimmer reverb already in progress.

## What Changes

- Add a delay DSP stage to `faust/synth.dsp` post-master-volume (after `masterVol`, before the reverb stage) using `de.fdelay` from the FAUST standard library, so delay repeats feed into the reverb
- Add `delayOn`, `delayTime`, `delayFeedback`, and `delayMix` parameters to the FAUST parameter set; `delayOn` bypasses the stage entirely when 0
- Replace the standalone `Reverb.svelte` with a combined `Effects.svelte` panel that hosts both the delay and reverb controls under a single "EFFECTS" panel label — "DELAY" sub-label on top, a divider line, "REVERB" sub-label below — matching the "LOUDNESS CONTOUR" label style used in `AmpEnv.svelte`
- Expose `delayTime`, `delayFeedback`, and `delayMix` via the MIDI CC learn system

## Capabilities

### New Capabilities

- `delay`: Feedback delay inserted post-VCA, with an on/off bypass toggle and time (10 ms–1 s), feedback (0–0.9), and mix (0–1) controls exposed as MIDI-learnable knobs

### Modified Capabilities

- `dsp-engine`: Signal chain gains a delay stage between master volume and the reverb stage; `delayOn`, `delayTime`, `delayFeedback`, and `delayMix` are added to the parameter contract

## Impact

- `faust/synth.dsp`: new delay parameters and processing stage inserted between master volume and the shimmer reverb stage
- `src/components/Effects.svelte` + `src/components/Effects.test.js`: combined effects panel replacing `Reverb.svelte`
- `src/App.svelte`: `<Reverb>` replaced with `<Effects>`; `KNOB_PARAMS` extended with `delayTime`, `delayFeedback`, `delayMix`
