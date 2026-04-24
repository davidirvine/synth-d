## Context

The synth currently uses: a single FAUST oscillator selected from five waveforms via `ba.selectn`; a SEM-style SVF (`fi.lowpass`/`fi.highpass` crossfade) for the filter; one-shot AD envelopes (`en.ar`); and a flat panel layout in five Svelte components. Every parameter in the FAUST DSP maps 1:1 to a knob in the UI.

This change replaces the DSP core and all audio-side components. The engine, keyboard, MIDI, and power infrastructure are untouched.

## Goals / Non-Goals

**Goals:**
- Three independent oscillators with six waveforms each and detune on OSC 2 / OSC 3
- Mixer with per-source levels and white/pink noise
- Moog 24 dB ladder filter (LP only) replacing the SEM SVF
- Full ADSR envelopes on both filter and amp contours
- Glide with toggle + rate
- Modulation routing: OSC 3 (or noise) → OSC 1/2 pitch and/or filter cutoff, scaled by mod wheel (CC 1 + virtual on-screen control)
- OSC 3 LFO mode (sub-audio range, gated out of the mixer)
- Keyboard tracking on filter cutoff

**Non-Goals:**
- Oscillator sync (not present on stock Model D; deferred)
- Pulse-width modulation (fixed waveform set, no PWM)
- External audio input
- Polyphony
- Velocity sensitivity

## Decisions

### D1 — Ladder filter: use `ve.moog_vcf` from FAUST stdlib

`ve.moog_vcf(res, fr, x)` is a virtual-analogue 4-pole Moog model already in the FAUST standard library. It produces the correct 24 dB/oct slope, saturates naturally under high resonance, and reaches self-oscillation. The alternative (custom ladder implementation) adds code with no audible benefit given the stdlib quality.

Resonance maps 0–1 from the UI knob directly. At values approaching 1 the filter self-oscillates; no artificial cap is imposed — this is intentional Model D behaviour.

**Mitigation for loud self-oscillation**: the master volume knob is already present; no DSP-level limiting added.

### D2 — Three oscillators, parallel waveform generation

Each oscillator generates all six waveforms simultaneously and selects one with `ba.selectn(6, waveIndex)`, matching the existing single-oscillator pattern. This means 18 running oscillators (6 × 3), which is acceptable in a browser AudioWorklet. Lazy generation (only compute the selected waveform) would require conditional FAUST code that is harder to maintain.

Waveforms per oscillator (index 0–5): triangle, reverse-sawtooth (`-os.sawtooth`), sawtooth, square, wide pulse (`os.pulsetrain(f, 0.67)`), narrow pulse (`os.pulsetrain(f, 0.1)`).

OSC 2 and OSC 3 apply detune as a cents offset: `detunedFreq = baseFreq * pow(2, detuneCents / 1200)`.

### D3 — OSC 3 LFO: DSP-level mixer gating

When `osc3LfoMode = 1`, OSC 3 frequency is driven by `osc3LfoRate` (0.1–20 Hz) instead of the transposed keyboard frequency. The OSC 3 mixer level is multiplied by `(1 - osc3LfoMode)` in the DSP, forcing it to zero in the audio path regardless of the level knob. This keeps the UI knob state intact while removing the sub-audio content from the mix cleanly.

### D4 — Modulation routing: additive pitch deviation in semitones

The modulation signal is a crossfade between the OSC 3 output and white noise, scaled by the mod wheel value (0–1):

```
modSource = osc3Out * (1 - modMix) + noiseOut * modMix
modSignal = modSource * modWheel * modDepth
```

Pitch modulation is applied as a multiplicative frequency factor:
`oscFreq = baseFreq * pow(2, modSignal / 12)`

Filter modulation adds directly to the cutoff in Hz (same mechanism as the existing filter envelope). Three independent boolean parameters (`modToOsc1`, `modToOsc2`, `modToFilter`) gate each destination. This is the simplest FAUST representation and maps naturally to three toggle switches in the UI.

`modDepth` is a fixed internal constant (2 semitones at mod wheel = 1.0) rather than a user-facing knob, matching the Model D's fixed modulation depth.

### D5 — ADSR envelopes: `en.adsr` from FAUST stdlib

Both filter and amp contours replace `en.ar(a, d)` with `en.adsr(a, d, s, r, gate)`. Sustain (0–1 normalised) and release (0.001–8 s) are added as new parameters.

The amp envelope D/R lock switch is implemented in the FAUST DSP: when `drLock = 1`, the release parameter receives the same value as decay (`ampRelease = select2(drLock, ampRelease, ampDecay)`). The UI switch simply sends `drLock` as a parameter.

### D6 — Glide: `ba.portamento` with on/off gating

`ba.portamento(time, x)` from the FAUST stdlib performs exponential frequency smoothing. Glide is gated by a `glideOn` boolean: when off, portamento time is forced to 0 so frequency changes are instantaneous.

```
glideTime = glideOn * glideRate
slidFreq  = freq : ba.portamento(glideTime)
```

### D7 — Keyboard tracking: additive Hz offset from C4 reference

Keyboard tracking adds a portion of `(freq - 261.63)` to the cutoff, where 261.63 Hz is C4 (the traditional reference pitch). `keyTrack = 1.0` means one semitone of freq deviation produces one semitone of cutoff shift:

```
cutoffMod = cutoff + keyTrack * (freq - 261.63)
```

This is a linear approximation, accurate enough across the playable range.

### D8 — Filter envelope amount: positive-only, 0–10 000 Hz

The filter contour amount knob spans 0 to +10 000 Hz only. Negative envelope amounts (filter closes on key press) are not included. This matches the original Model D behaviour. The bipolar knob prop is not used here; the standard arc-from-start is correct.

### D9 — New Svelte components

Four new/redesigned components with standard `onchange` + `midiState` + `onknobcontextmenu` props:

| Component | Panel |
|---|---|
| `Oscillator.svelte` | redesigned — three-osc bank |
| `Mixer.svelte` | new — OSC 1/2/3 levels + noise |
| `Modulation.svelte` | new — mod mix, routing switches, virtual mod wheel |
| `Glide.svelte` | new — toggle + rate knob |

`Filter.svelte`, `FilterEnv.svelte`, and `AmpEnv.svelte` receive additive changes only (new knobs, removed knobs, new switches). No existing component is deleted.

## Risks / Trade-offs

- **Loud self-oscillation** → not limited in DSP; players must use master volume. Acceptable for a faithful Model D.
- **18 simultaneous oscillators** → heavier CPU than single-osc. Acceptable in desktop browsers; mobile may struggle. No mitigation planned; revisit if profiling shows issues.
- **DSP recompile required** → changing `faust/synth.dsp` requires rebuilding `public/synth.wasm` and `public/synth.json`. The `faust:build` npm script handles this; it must be run and both output files committed before the UI changes can be tested.
- **All existing MIDI CC mappings invalidated** → the parameter namespace changes completely. Any saved `MidiCcMap` state in a user's browser will map to wrong or missing parameters. Acceptable given no persistence layer exists yet.

## Migration Plan

1. Rewrite `faust/synth.dsp` with the new signal chain
2. Run `npm run faust:build` — produces `public/synth.wasm` + `public/synth.json`
3. Update `src/App.svelte` KNOB_PARAMS registry to match new parameter names
4. Implement/update Svelte components section by section
5. Wire new components into `App.svelte`
6. No rollback complexity — the WASM and UI are versioned together in the same commit

## Open Questions

None. All key decisions settled during design exploration.
