## Context

The filter contour amount (`filterEnvAmt`) is the only filter-modulation control that is positive-only. The DSP already computes cutoff as `max(20, min(18000, baseCutoff + keyTrack·… + filterEnvOut·filterEnvAmt + filterModHz))` (`faust/synth.dsp:147-153`), where `filterEnvOut` is an ADSR in 0…1. Because the contribution is a signed product, a negative `filterEnvAmt` already produces correct downward modulation — the only thing preventing it is the slider's `min=0`.

The codebase already has a complete bipolar-knob facility built for the oscillator detune knobs: `Knob.svelte` has a `bipolar` prop with a centre-outward arc (`bipolarArcPath`), `App.svelte` has a `BIPOLAR_PARAMS` set used by power-off reset, and MIDI CC scaling is linear/symmetric. This change reuses that facility rather than introducing anything new.

## Goals / Non-Goals

**Goals:**

- Make `filterEnvAmt` bipolar (−10 000 … +10 000 Hz, default 0) end-to-end: DSP range, UI knob, param registry, power-off reset.
- Reuse the existing bipolar-knob rendering and reset machinery.
- Keep all existing positive-amount behaviour and the filter-stability clamps unchanged.

**Non-Goals:**

- No change to the cutoff summation formula or the 18 000 Hz / 20 Hz clamps.
- No change to the MIDI CC scaling model (it stays linear; centre-snapping is explicitly out of scope).
- No fine-center taper — linear, per the explore decision.
- No migration of saved patches (stored values already fall within the wider range).

## Decisions

**1. Change only the slider minimum in DSP, not the formula.**
`hslider("filterEnvAmt …", 0, 0, 10000, 1)` → minimum becomes `-10000` (default stays 0). The `max(20, min(18000, …))` clamp already bounds the negative direction at 20 Hz, so no extra guard is needed. Alternative — adding an explicit negative-side guard — was rejected as redundant.

**2. Reuse the `bipolar` Knob prop with a linear taper.**
Set `min={-10000}`, `bipolar={true}`, keep `scale="linear"`. The detune knobs use `fine-center`, but the explore decision is linear here: simpler, and a Hz reading reads naturally on a linear sweep. Centre detent and centre-outward arc come for free from the existing `bipolarArcPath`.

**3. Add `filterEnvAmt` to `BIPOLAR_PARAMS`.**
This is load-bearing: power-off reset sends bipolar params to centre and non-bipolar params to min. Without this, widening the min to −10 000 would make power-off slam the filter envelope fully negative instead of to 0. The param registry min in `App.svelte` also changes to −10 000.

**4. Document, don't fix, the MIDI CC centre offset.**
Linear CC mapping maps raw 64 to `−10000 + 20000·(64/127) ≈ +78 Hz`, so CC cannot land exactly on 0. This already holds for detune and modMix, so it is consistent existing behaviour; a spec note records it rather than introducing per-param centre-snapping.

**5. Widen the reserved value-display width in `Filter.svelte`.**
The fixed reserve currently sized for `"0.00 Hz" ↔ "10.0 kHz"` must also fit a leading minus (`"-10.0 kHz"`). `formatValue` already preserves sign, so only the CSS reserve needs the bump.

## Risks / Trade-offs

- **Power-off reset regression if `BIPOLAR_PARAMS` is missed** → Decision 3 makes it explicit; a power-on-reset test asserts `filterEnvAmt` returns to 0, not −10 000.
- **Layout shift from the minus sign** → Decision 5 widens the reserve; a UI test asserts no shift at `-10.0 kHz`.
- **Negative modulation hitting the 20 Hz floor produces a non-linear "stuck" region at low base cutoff** → expected and acceptable; the spec's negative-amount scenario states the 20 Hz clamp explicitly so it is treated as defined behaviour, not a bug.
