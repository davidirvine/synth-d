## Why

The current reverb uses a shimmer effect (pitch-shifted octave-up feedback) as one of its three controls, which suits a narrow range of sounds but is not a generally useful reverb for everyday synthesis work. Replacing shimmer with tone (damping) and pre-delay gives the reverb the standard controls needed for placing sounds in a convincing space, and the log decay taper makes the control more musically responsive across its full range.

## What Changes

- **Remove**: `reverbShimmer` parameter from DSP, UI, MIDI registry, and tests
- **Add**: `reverbTone` — external lowpass filter on the wet reverb signal (1kHz–16kHz, log scale, default 16kHz)
- **Add**: `reverbPreDelay` — delay line before the reverb diffusion body (0–100ms, linear, default 0ms)
- **Change**: `reverbDecay` knob switches to log scale (range 0.01–1) for more musical response at short decay times
- **Change**: freeverb internal `damp` parameter fixed at `0` (was `0.5`) so the external tone control has full range without fighting internal damping
- **Change**: shimmer feedback loop (`~` recirculation) removed; reverb signal chain becomes a straight linear path

## Capabilities

### New Capabilities

- `reverb`: Reverb DSP stage and UI panel with controls: on/off toggle, mix, tone, decay, and pre-delay

### Modified Capabilities

<!-- No existing spec-level capabilities are changing — the prior reverb spec lived inside the archived change and is superseded by the new capability above. -->

## Impact

- `faust/synth.dsp`: reverb section rewritten
- `src/components/Effects.svelte`: shimmer knob removed, tone and pre-delay knobs added, decay knob scale changed to log
- `src/App.svelte`: `reverbShimmer` removed from KNOB_PARAMS; `reverbTone` and `reverbPreDelay` added
- `src/lib/midiCcMap.js`: same parameter registry changes
- `src/components/Effects.test.js`: updated to reflect new params
- `src/App.test.js`: updated to reflect new params
