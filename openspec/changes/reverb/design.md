## Context

The synthesizer produces a mono signal through the existing chain (oscillators → mixer → ladder filter → VCA → master volume) and splits to stereo at the final output via `<: _, _`. There is no spatial or time-based effect stage. The reverb is inserted after the master volume, so the amp envelope and output level both apply to the dry signal before it enters the reverb; this is the classic send-effect placement where the reverb operates on the fully-shaped, level-adjusted signal.

The target sound character is the Lexicon 224 plate reverb with its famous "shimmer" quality — a lush, densely diffused tail that is pitch-shifted upward in the feedback path, as popularised by the Vongon UltraSheer pedal. This is architecturally distinct from a simple room/hall reverb: the pitch shifter sits inside the reverb's recirculation loop, so each pass through the network shifts the pitch up by an octave, creating an ethereal buildup of harmonic overtones above the fundamental.

The FAUST standard library provides `re.mono_freeverb` (Schroeder/Moorer) and `ef.transpose` (granular pitch shift). No third-party dependency is required.

## Goals / Non-Goals

**Goals:**

- Implement a shimmer reverb in `faust/synth.dsp` with a pitch shifter (fixed +12 semitones) in the feedback path
- Expose four controls: an on/off bypass toggle, mix (dry/wet), decay (tail length), and shimmer (amount of pitch-shifted recirculation)
- Make mix, decay, and shimmer MIDI-learnable via the existing CC learn workflow (on/off is not MIDI-learnable)
- Provide a `Reverb.svelte` panel matching the existing UI panel conventions, mounted in the `filter-output-grid` to the right of the Amp Env/output panel

**Non-Goals:**

- Selectable pitch shift intervals (octave up is fixed, matching the UltraSheer character)
- Pre-delay or early-reflection controls
- Stereo width or stereo input (signal chain is mono until the final split)
- True plate reverb tank simulation (the diffusion network from freeverb is sufficient for the target character)

## Decisions

### Decision: Shimmer via pitch-shifted recirculation on top of mono_freeverb

The shimmer architecture is a feedback loop: the reverb output is pitch-shifted up one octave and mixed back into the reverb input, controlled by the `reverbShimmer` parameter. The reverb body is `re.mono_freeverb` which provides the dense diffuse tail characteristic of a plate.

```faust
// shimmerWet: freeverb body with optional pitch-shifted recirculation.
// Architecture: output = freeverb(input + prev_output * shimmer : transpose)
// The ~ operator feeds the scaled/shifted output back into the freeverb input.
// With shimmer=0: output = freeverb(input) — basic reverb, no pitch content.
// With shimmer>0: each recirculation pass adds octave-up harmonic buildup.
shimmerWet = (+ : re.mono_freeverb(reverbDecay, 0.5, 0.5, 0))
           ~ (_ * reverbShimmer : ef.transpose(512, 256, 12) : (_, -1) : max : (_, 1) : min);

// Signal chain: VCA and master volume first, then reverb as the final stage
vcaOut     = filteredSig * ampEnvOut;
masterOut  = vcaOut * masterVol;
shimmerOut = masterOut <: (_ * (1 - reverbMix), shimmerWet * reverbMix) :> _;
process    = select2(int(reverbOn), masterOut, shimmerOut) <: _, _;
```

`reverbOn` is an `nentry` (0 or 1, default 0). When 0, the signal bypasses the reverb via `select2`, saving CPU cycles. The knobs remain active but have no effect while bypassed — consistent with how `glideOn` works for the Glide panel.

`A ~ B` is FAUST's feedback operator: `A`'s output passes through `B`, and `B`'s output feeds back to `A`'s last input (with 1 sample delay). Here `A = (+ : freeverb)` has 2 inputs and 1 output; `B = (_ * shimmer : transpose : clip)` has 1 input and 1 output. The result has `2 − 1 = 1` external input. This architecture ensures freeverb is always excited by the external signal (giving reverb at any shimmer setting), while the feedback path adds the pitch-shifted recirculation only when `reverbShimmer > 0`. The earlier `+~(freeverb : (_ * shimmer : ...))` idiom was incorrect: it placed the shimmer scale before the feedback injection, meaning shimmer=0 silenced the entire reverb.

`(_, -1) : max : (_, 1) : min` symmetrically bounds the shimmer feedback to prevent infinite buildup; `ba.clip` is not available in FAUST 2.85.5 so the equivalent primitive form is used.

Note: `masterVol` is applied before the reverb stage. The reverb operates on the already-shaped, level-adjusted signal; both the amp envelope and master volume are upstream of the effect.

The granular pitch shifter (`ef.transpose`) grain size of 512 samples and cross-fade of 256 samples gives a smooth shimmer without obvious granular artifacts at typical audio rates.

**Alternative considered:** `re.zita_rev1` — higher fidelity eight-channel FDN reverb, but its API requires stereo input and does not expose a simple internal feedback tap for the pitch shifter insertion. Implementing the shimmer loop around Zita would require patching the library internals, which is fragile across FAUST library updates.

**Alternative considered:** Custom allpass diffusion network — maximally authentic but requires hand-tuning eight or more delay line lengths, a significant authoring and testing burden with no perceptible advantage for this application.

### Decision: Pitch shift fixed at +12 semitones (one octave up)

The Vongon UltraSheer and the Lexicon 224's characteristic shimmer are both one octave up. Exposing the interval as a knob would add UI complexity without a clear musical payoff for this synthesizer's use cases. The parameter can be added in a future change if requested.

### Decision: `reverbDecay` maps to freeverb's `fb1` (room size) parameter

Freeverb's `fb1` (feedback for comb filters, 0–1) directly controls how long energy recirculates, making it the natural "decay" control. `fb2` (allpass feedback) is held constant at 0.5 for stable diffusion. `damp` is held constant at 0.5 (moderate HF absorption) — the shimmer character is brighter without maximum damping; `damp = 1` would be fully muffled and contradicts the UltraSheer voicing. `spread` is held at 0 (mono output).

### Decision: Reverb placed post-master-volume (after VCA and output level)

Inserting the reverb after `masterVol` is the classic send-effect position: the amp envelope and master volume both apply to the dry signal first, and the reverb operates on the fully-shaped, level-adjusted output. The reverb tail decays freely after the VCA closes, giving the characteristic "bloom" of a hardware send reverb — notes ring naturally into space without the tail being gated by the amp envelope.

**Alternative considered:** Pre-VCA (between the ladder filter and the amplifier) — the amp envelope gates the reverb-processed signal directly, producing a tighter, more gated character. This was the original design, but the user requested post-master-volume placement to achieve the send-effect sound.

### Decision: Reverb panel placed to the right of Amp Env in the filter-output-grid

The `filter-output-grid` uses `grid-template-columns: auto auto auto` with Filter (left), AmpEnv/output (centre), and Reverb (right). This order mirrors the audio signal flow: filter → VCA/output → reverb. The Reverb panel is the rightmost top-row column, adjacent to the output (master volume) section it follows in the signal chain. The Reverb panel is narrower than Filter since it has fewer controls; column auto-sizing keeps the layout proportional.

### Decision: Parameter names follow existing camelCase convention

`reverbOn`, `reverbMix`, `reverbDecay`, `reverbShimmer` — consistent with `glideOn`, `filterAttack`, `ampSustain`, `osc2Detune`, etc.

## Risks / Trade-offs

- **Granular pitch shifter artifacts** → `ef.transpose` is granular; at very short grain sizes or extreme feedback levels (shimmer near 1.0) the pitch shift may produce noticeable graininess. Mitigation: choose grain/crossfade sizes that are inaudible at moderate shimmer settings; document that shimmer above 0.8 may produce artefacts.
- **Feedback instability at high shimmer + high decay** → When both `reverbDecay` and `reverbShimmer` approach 1.0, the loop gain can exceed 1.0 and produce an infinite buildup. Mitigation: `ba.clip(-1, 1)` in the feedback path bounds amplitude symmetrically; if the UltraSheer-style intentional runaway is desired, this can be removed in a follow-up.
- **CPU headroom** → Adding `ef.transpose` (granular pitch shifter) on top of `re.mono_freeverb` meaningfully increases DSP cost. Mitigation: both are optimised FAUST primitives; the combined cost has been benchmarked as acceptable in comparable WASM audio projects.
- **Mono shimmer tail** → The output is mono (split to stereo via `<: _, _`). The shimmer will not have stereo width. Mitigation: acceptable for this scope; true stereo shimmer is a non-goal.
- **Reverb tail rings after VCA closes** → Because reverb is post-master-volume, the reverb tail decays freely even after the amp envelope closes. This is intentional (see placement decision) and is the characteristic send-effect sound. Users who prefer a gated reverb character should set a short reverb decay.
