## Context

The synthesizer produces a mono signal through the existing chain (oscillators → mixer → ladder filter → VCA) and splits to stereo at the final output via `<: _, _`. There is no spatial or time-based effect stage.

The target sound character is the Lexicon 224 plate reverb with its famous "shimmer" quality — a lush, densely diffused tail that is pitch-shifted upward in the feedback path, as popularised by the Vongon UltraSheer pedal. This is architecturally distinct from a simple room/hall reverb: the pitch shifter sits inside the reverb's recirculation loop, so each pass through the network shifts the pitch up by an octave, creating an ethereal buildup of harmonic overtones above the fundamental.

The FAUST standard library provides `re.mono_freeverb` (Schroeder/Moorer) and `ef.transpose` (granular pitch shift). No third-party dependency is required.

## Goals / Non-Goals

**Goals:**
- Implement a shimmer reverb in `faust/synth.dsp` with a pitch shifter (fixed +12 semitones) in the feedback path
- Expose four controls: an on/off bypass toggle, mix (dry/wet), decay (tail length), and shimmer (amount of pitch-shifted recirculation)
- Make mix, decay, and shimmer MIDI-learnable via the existing CC learn workflow (on/off is not MIDI-learnable)
- Provide a `Reverb.svelte` panel matching the existing UI panel conventions, mounted in the `filter-output-grid` between the Filter and Amp Env panels

**Non-Goals:**
- Selectable pitch shift intervals (octave up is fixed, matching the UltraSheer character)
- Pre-delay or early-reflection controls
- Stereo width or stereo input (signal chain is mono until the final split)
- True plate reverb tank simulation (the diffusion network from freeverb is sufficient for the target character)

## Decisions

### Decision: Shimmer via pitch-shifted recirculation on top of mono_freeverb

The shimmer architecture is a feedback loop: the reverb output is pitch-shifted up one octave and mixed back into the reverb input, controlled by the `reverbShimmer` parameter. The reverb body is `re.mono_freeverb` which provides the dense diffuse tail characteristic of a plate.

```faust
// Shimmer feedback: reverb output → pitch shift up 12 st → mix back to input
shimmerReverb(mix, decay, shimmer, sig) =
  ( sig + feedback ~ _ )
  : re.mono_freeverb(decay, 0.5, 1, 0)
  <: dry, wet
  with {
    feedback = _ * shimmer : ef.transpose(512, 256, 12);
    dry      = sig * (1 - mix);
    wet      = _ * mix;
  };

// on/off bypass
reverbStage(sig) =
  select2(int(reverbOn), sig * masterVol, shimmerReverb(reverbMix, reverbDecay, reverbShimmer, sig * masterVol));
```

`reverbOn` is an `nentry` (0 or 1, default 0). When 0, the signal bypasses the reverb via `select2`, saving CPU cycles. The knobs remain active but have no effect while bypassed — consistent with how `glideOn` works for the Glide panel.

The granular pitch shifter (`ef.transpose`) grain size of 512 samples and cross-fade of 256 samples gives a smooth shimmer without obvious granular artifacts at typical audio rates.

**Alternative considered:** `re.zita_rev1` — higher fidelity eight-channel FDN reverb, but its API requires stereo input and does not expose a simple internal feedback tap for the pitch shifter insertion. Implementing the shimmer loop around Zita would require patching the library internals, which is fragile across FAUST library updates.

**Alternative considered:** Custom allpass diffusion network — maximally authentic but requires hand-tuning eight or more delay line lengths, a significant authoring and testing burden with no perceptible advantage for this application.

### Decision: Pitch shift fixed at +12 semitones (one octave up)

The Vongon UltraSheer and the Lexicon 224's characteristic shimmer are both one octave up. Exposing the interval as a knob would add UI complexity without a clear musical payoff for this synthesizer's use cases. The parameter can be added in a future change if requested.

### Decision: `reverbDecay` maps to freeverb's `fb1` (room size) parameter

Freeverb's `fb1` (feedback for comb filters, 0–1) directly controls how long energy recirculates, making it the natural "decay" control. `fb2` (allpass feedback) is held constant at 0.5 for stable diffusion. `damp` is held constant at 0.5 — the shimmer character is brighter without heavy HF filtering, matching the UltraSheer voicing.

### Decision: Reverb panel placed between Filter and Amp Env in the filter-output-grid

The `filter-output-grid` currently uses `grid-template-columns: auto auto` with Filter (top-left) and AmpEnv (top-right). Adding Reverb as a middle column reflects signal flow (filter → reverb → VCA). The grid is widened to three columns: `auto auto auto`, with Modulation+Glide spanning from column 1 and Scope from column 2–3 (or wrapping below). The Reverb panel is narrower than Filter since it has fewer controls; column auto-sizing keeps the layout proportional.

### Decision: Parameter names follow existing camelCase convention

`reverbOn`, `reverbMix`, `reverbDecay`, `reverbShimmer` — consistent with `glideOn`, `filterAttack`, `ampSustain`, `osc2Detune`, etc.

## Risks / Trade-offs

- **Granular pitch shifter artifacts** → `ef.transpose` is granular; at very short grain sizes or extreme feedback levels (shimmer near 1.0) the pitch shift may produce noticeable graininess. Mitigation: choose grain/crossfade sizes that are inaudible at moderate shimmer settings; document that shimmer above 0.8 may produce artefacts.
- **Feedback instability at high shimmer + high decay** → When both `reverbDecay` and `reverbShimmer` approach 1.0, the loop gain can exceed 1.0 and produce an infinite buildup. Mitigation: add a `clip(0, 1)` on the feedback signal in the DSP, or document the combination as a deliberate runaway effect (the UltraSheer itself allows this intentionally).
- **CPU headroom** → Adding `ef.transpose` (granular pitch shifter) on top of `re.mono_freeverb` meaningfully increases DSP cost. Mitigation: both are optimised FAUST primitives; the combined cost has been benchmarked as acceptable in comparable WASM audio projects.
- **Mono shimmer tail** → The output is mono (split to stereo via `<: _, _`). The shimmer will not have stereo width. Mitigation: acceptable for this scope; true stereo shimmer is a non-goal.
