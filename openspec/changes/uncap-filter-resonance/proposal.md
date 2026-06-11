## Why

The ladder filter cannot reach the high-resonance, near-self-oscillation zone where fat Minimoog "squelch" lives. The DSP caps resonance at `min(0.7, resonance)` ([faust/synth.dsp:155](../../../faust/synth.dsp#L155)), which directly contradicts the existing `ladder-filter` spec requirement "No artificial cap on resonance is imposed." The cap is also internally inconsistent: the cutoff clamp at 18 kHz ([faust/synth.dsp:147](../../../faust/synth.dsp#L147)) is documented as the stability ceiling for resonance ≤ 0.97, so the rest of the design already assumes resonance can run up to 0.97. The result is a filter that sounds correct at low/medium resonance but never gets squelchy.

## What Changes

- **Honor the existing "no artificial cap on resonance" requirement.** Raise the `resonanceSafe` ceiling from `0.7` to the documented stability ceiling of `0.97`, unlocking the high-resonance zone just below runaway self-oscillation (the fat-Moog sweet spot). The cap is raised, not removed, because `0.97` is the value the 18 kHz cutoff clamp is already tuned against; a full removal would let resonance reach `1.0` and risk instability the cutoff clamp does not cover.
- **Add a fixed input drive into the ladder.** Apply a constant gain to the mixer signal before the existing pre-filter `ma.tanh` ([faust/synth.dsp:156](../../../faust/synth.dsp#L156)) so more level hits the ladder and the high-Q resonant peak saturates and fattens, producing the rubbery squelch character. The drive is a fixed DSP constant — **no new user-facing knob** in this change.
- The exact constants (the resonance ceiling and the drive multiplier) are listening-tuned. The spec fixes their *intent and bounds*, not their precise numeric values; the final values are set by ear at the audio-verification gate.

Non-goals (explicitly out of scope):

- No performable/user-facing drive control. A drive knob would be a separate later change.
- No filter topology change. The `ve.moog_vcf_2bn` transistor-ladder topology is retained; the target sound is fat Minimoog bass squelch, not 303/acid or MS-20.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `ladder-filter`: The resonance-control requirement is tightened so the implementation must actually expose the high-resonance / near-self-oscillation range (no cap below the documented stability ceiling), and a new requirement is added for a fixed input drive feeding the ladder to produce the saturated high-Q squelch character.

## Impact

- **DSP**: [faust/synth.dsp](../../../faust/synth.dsp) — `resonanceSafe` definition (line 155) and the `filteredSig` chain (line 156). No new parameters, no UI changes, no parameter-schema changes.
- **Audio behaviour**: At high resonance the filter now self-oscillates audibly and can boom on bass notes; loudness is managed by master volume (already acknowledged by the `ladder-filter` spec). This is the intended behaviour, and is the key thing to confirm at the audio-verification gate.
- **No breaking changes** to parameters, presets, or the patch format — the `resonance` parameter range (0–1) is unchanged; only its effective mapping into the filter widens.
- **Sonic note for saved patches**: patches that stored `resonance` above 0.7 were silently clamped to 0.7 and will now sound markedly more resonant (and louder) as they map to their true value. This is the corrected behaviour the spec always intended, not a regression, and requires no migration — but it is a perceptible change worth confirming at the audio gate when auditioning existing presets.
