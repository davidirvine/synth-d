## Context

The ladder filter is `ve.moog_vcf_2bn(resonanceSafe, cutoffMod)` in [faust/synth.dsp:156](../../../faust/synth.dsp#L156), fed through `ma.tanh` on input and output. Two facts are in tension:

- The `ladder-filter` spec requires "No artificial cap on resonance is imposed" and self-oscillation as resonance approaches 1.0.
- The code defines `resonanceSafe = min(0.7, resonance)` ([line 155](../../../faust/synth.dsp#L155)), so the `resonance` knob (0–1) only ever drives the filter to 0.7.

Meanwhile the cutoff clamp is documented (comment at [line 145](../../../faust/synth.dsp#L145)) as "the stability ceiling for `ve.moog_vcf` at resonance ≤ 0.97, SR = 48 kHz." So the design already commits to resonance running as high as 0.97; the 0.7 cap is an unexplained, stricter limit that strands the entire squelch region (≈0.85→1.0) where the resonant peak rings, dominates, and gives the fat-Moog character.

`engine.js` forces `sampleRate: 48000`, so the 48 kHz stability analysis behind the 0.97 ceiling holds.

This is a DSP-only change. No parameters, UI, parameter-schema, or patch-format changes are involved.

## Goals / Non-Goals

**Goals:**

- Make the `resonance` knob actually reach the high-resonance / near-self-oscillation zone, honoring the existing spec requirement.
- Give the high-Q peak a saturated, rubbery "squelch" character by driving more level into the ladder.
- Keep the filter stable at the new ceiling (no runaway resonance, no NaN/denormal blow-ups) at SR = 48 kHz.

**Non-Goals:**

- No user-facing drive/overdrive knob. Drive is a fixed internal constant this change; a performable control is a separate future change.
- No filter topology swap. `ve.moog_vcf_2bn` is retained; the target is fat Minimoog squelch, not 303/acid (`ve.diodeLadder`) or MS-20 (`ve.korg35`).
- No change to the `resonance` parameter's external range (still 0–1) or to presets/patches.

## Decisions

### Decision 1: Raise the resonance ceiling to the documented stability ceiling, not remove it

Change `resonanceSafe = min(0.7, resonance)` to cap at the documented stability ceiling (≈0.97) instead of 0.7.

- **Why cap at all (not pass `resonance` straight through to 1.0):** `ve.moog_vcf_2bn` at SR = 48 kHz is only analysed as stable up to ≈0.97 (the same value the 18 kHz cutoff clamp is tuned against). Allowing the knob's full 1.0 risks instability the cutoff clamp does not cover. A ceiling just below the unstable point keeps self-oscillation strong but bounded — which is also exactly the fat-Moog sweet spot (strong ring without a pure runaway sine).
- **Why this still honors "no artificial cap":** the prior `0.7` cap sat *below* the squelch zone and was the artificial limit the spec forbids. A ceiling at the genuine stability boundary is a physical safety limit, not an artificial musical one — it does not prevent the filter from reaching the near-self-oscillation behaviour the spec mandates. The spec text is updated to describe this stability ceiling honestly rather than claiming an absolute absence of any cap.
- **Exact value is set by ear.** 0.97 is the documented analytical ceiling and the starting point; the final value is tuned at the audio-verification gate (dial back toward ~0.92 if self-oscillation is too wild, push toward 0.97 if it is too tame). The spec fixes the *intent and bound*, not the literal number.

**Alternative considered — remove the cap entirely (`resonance` 0–1 → filter 0–1):** rejected. It exposes the unanalysed 0.97→1.0 region and can destabilise the filter; gains no musical benefit because the sweet spot is below 1.0 anyway.

### Decision 2: Fixed input drive before the pre-filter `tanh`

Insert a constant gain `> 1` into the mixer signal before the existing input `ma.tanh`, i.e. `mixerOut * DRIVE : ma.tanh : ve.moog_vcf_2bn(...)`.

- **Why pre-filter and via the existing `tanh`:** pushing more level into the saturating `tanh` ahead of the ladder makes the high-Q resonant peak overdrive and compress — the rubbery, vocal squelch. Reusing the existing `tanh` avoids adding a new nonlinearity and keeps the change minimal. The output `tanh` already soft-clips the louder result.
- **Placement relative to `attach`:** the current chain is `attach(mixerOut, mixerPeak) : ma.tanh : ...`. The drive MUST go *after* the `attach`, i.e. `attach(mixerOut, mixerPeak) : _ * DRIVE : ma.tanh : ...`, so the `mixerPeak` meter keeps reporting the undriven mixer level rather than an inflated driven level.
- **Bounded for the audio gate:** the multiplier is fenced to `> 1` and `≤ 3`. Above ≈3 the input hard-clips through the `tanh` before the filter, turning the instrument into a distortion box rather than adding squelch; the fence keeps the by-ear tuning in a musical range.
- **Why a fixed constant, not a knob:** the proposal scopes out a user control. A single tuned constant delivers the character without new UI/parameter surface.
- **Exact multiplier is set by ear** at the audio gate (start ≈1.5). Too high muddies low-resonance tones; too low yields no extra grit. The spec fixes "a fixed gain greater than unity feeds the ladder," not the number.

**Alternative considered — saturation inside the resonance feedback path:** more authentic transistor-ladder behaviour, but `ve.moog_vcf_2bn` is a library black box; injecting saturation into its internal feedback would mean forking the filter — out of scope for a minimal tweak.

## Risks / Trade-offs

- **[Loud self-oscillation / bass boom at high resonance]** → Expected and already acknowledged by the `ladder-filter` spec ("players should use master volume to manage loud self-oscillation"). The output `ma.tanh` and the `mixerPeak` meter remain as guards. The audio-verification gate is the place to confirm it is musical, not painful.
- **[Filter instability near the new ceiling]** → Mitigated by capping at the analysed 0.97 stability ceiling (not 1.0) and by the existing 18 kHz cutoff clamp and `si.smooth` on the cutoff sum. If instability appears at the gate, lower the ceiling.
- **[Drive muddies clean/low-resonance sounds]** → Mitigated by keeping the multiplier modest (≈1.5) and tuning by ear; the pre-filter `tanh` only saturates meaningfully when driven hard, so low-level signals stay relatively clean.
- **[Constants are not provable from the spec]** → Accepted by design: the resonance ceiling and drive multiplier are listening-tuned. The spec bounds their intent; their final values are set at the audio gate and recorded there, not asserted by unit tests.
- **[Saved patches with high resonance change sound]** → Existing patches that stored `resonance` at 0.8–1.0 were silently clamped to 0.7; after this change they map to their true higher value and will sound dramatically more resonant (and louder). This is the intended fix, not a regression, and the patch format is unchanged — but it is a perceptible sonic change to those patches. No migration is performed; the behaviour is the corrected mapping the spec always intended. Worth a heads-up at the audio gate when auditioning existing presets.

## Migration / Spec sync

- This is a behaviour fix with no data migration: `resonance` keeps its 0–1 range and the patch format is untouched. The only "migration" is that previously-clamped high-resonance patches now sound as their stored value dictates.
- **Spec-sync reconciliation (`/opsx:sync`):** the delta's MODIFIED `Resonance control with self-oscillation` requirement replaces the existing main-spec requirement header text ("No artificial cap on resonance is imposed") and its "High resonance approaches self-oscillation" scenario ("near 1.0", "even with no input signal") wholesale — those are superseded by the delta's stability-ceiling language and "reaches the near-self-oscillation zone" scenario. The delta also updates the stale `resonance set above 0.7` thresholds in the two cutoff-smoothing stress scenarios to test near the new ceiling (≈0.95). The main spec's cutoff-clamp requirement already phrases its bound as "up to the 0.97 cap," which is correct post-change; confirm it reads consistently at sync time. No other main-spec language references the former 0.7 cap.
- **Shippable defaults vs. tuned values:** the starting values (0.97 resonance ceiling, 1.5 drive) are *not* assumed safe to ship unconfirmed. Per the workflow's audio-verification gate, the branch MUST NOT be merged until the human runs the audio gate and either confirms the starting values or commits tuned ones (task 3.3). The starting values are a sensible default to commit during implementation, but the gate — not the commit — authorizes them.

## Open Questions

- Final numeric values for the resonance ceiling (≈0.92–0.97) and the drive multiplier (≈1.5, fenced ≤ 3) — resolved by ear at the audio-verification gate, not before.
