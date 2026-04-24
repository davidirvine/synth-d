## Why

The synth is currently a minimal single-oscillator instrument with an Oberheim SEM-style filter and one-shot AD envelopes — capable but tonally thin and lacking the expressive range of a classic monosynth. Rebuilding the architecture around the Moog Model D signal chain (three-oscillator bank, 24 dB ladder filter, full ADSR envelopes, mixer, modulation routing, and glide) transforms it into a recognisable classic monosynth character with the depth to cover basses, leads, pads, and sound design.

## What Changes

- **Oscillator bank**: single oscillator replaced by three independent oscillators (OSC 1, OSC 2, OSC 3), each with six waveforms (triangle, reverse sawtooth, sawtooth, square, wide pulse, narrow pulse), per-oscillator octave range, and detune on OSC 2 and OSC 3 (bipolar knobs); noise source moves out of the oscillator into the mixer
- **Mixer**: new panel with independent level knobs for OSC 1, OSC 2, OSC 3, and noise; noise source switchable between white and pink
- **Ladder filter** — **BREAKING**: SEM state variable filter (LP/BP/HP crossfade) replaced entirely by a Moog 24 dB/octave transistor ladder lowpass filter; filter mode knob removed; keyboard tracking added as a continuous knob; filter env amount is positive-only (0 → opens filter)
- **ADSR envelopes**: both filter and amp envelopes expanded from AD to full ADSR (sustain + release stages); amp envelope gains a decay/release lock switch
- **Modulation**: OSC 3 gains an LFO range toggle (sub-audio; excluded from mixer when active); modulation section added with mix knob (OSC 3 ↔ noise), three independent routing switches (→ OSC 1 pitch, → OSC 2 pitch, → filter cutoff), and a virtual mod wheel (also driven by MIDI CC 1)
- **Glide**: portamento added with on/off toggle and rate knob

## Capabilities

### New Capabilities

- `mixer`: per-source level controls (OSC 1, OSC 2, OSC 3, noise) with white/pink noise selector feeding the filter input
- `ladder-filter`: Moog 24 dB/octave transistor ladder lowpass filter with resonance, keyboard tracking, and ADSR filter contour
- `modulation`: OSC 3 LFO mode, modulation mix (OSC 3 ↔ noise), three independent routing switches (OSC 1 pitch / OSC 2 pitch / filter cutoff), virtual mod wheel synced to MIDI CC 1
- `glide`: monophonic portamento with on/off toggle and rate knob

### Modified Capabilities

- `oscillator`: single oscillator → three-oscillator bank; waveform set changes from sine/saw/square/triangle/noise to triangle/reverse-saw/sawtooth/square/wide-pulse/narrow-pulse per oscillator; OSC 2 and OSC 3 gain bipolar detune knobs; noise source removed (moved to mixer)
- `ad-envelope`: **BREAKING** expanded to full ADSR (sustain + release); amp envelope gains decay/release lock switch; capability renamed conceptually to `adsr-envelope` though the spec file will be updated in place
- `sem-filter`: **BREAKING** removed entirely; spec superseded by `ladder-filter`
- `dsp-engine`: complete DSP parameter set overhaul to match the Model D signal chain
- `synth-ui`: oscillator panel redesigned for three-osc bank; filter panel updated for ladder filter (mode knob removed, key track added); filter env and amp env panels gain sustain/release knobs; new mixer, modulation, and glide panels added

## Impact

- `faust/synth.dsp` — complete rewrite of oscillator, filter, and envelope sections; new mixer, modulation, and glide DSP
- `src/components/Oscillator.svelte` — redesigned for three-osc bank
- `src/components/Mixer.svelte` — new component
- `src/components/Filter.svelte` — mode knob removed, key track knob added
- `src/components/FilterEnv.svelte` — sustain + release knobs added
- `src/components/AmpEnv.svelte` — sustain + release knobs added, D/R lock switch added
- `src/components/Modulation.svelte` — new component (mod mix, routing switches, virtual mod wheel)
- `src/components/Glide.svelte` — new component
- `src/App.svelte` — KNOB_PARAMS registry updated; new panels wired in
- `src/audio/engine.js` — no structural changes expected
