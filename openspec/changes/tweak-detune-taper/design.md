## Context

`src/audio/math.js` provides `normalizedToValue` and `valueToNormalized` used by every Knob in the synth UI. It currently supports three scales: `'linear'`, `'log'`, and `'log-reverse'`. The detune knobs use `'linear'` with `min=-100`, `max=100`, `bipolar=true`.

The quadratic bipolar taper works as follows. Let `t = (pos − 0.5) × 2` so t ∈ [−1, 1]:

- **Forward** (pos → value): `value = center + sign(t) × t² × range`
  where `center = (max + min) / 2`, `range = (max − min) / 2`
- **Inverse** (value → pos): `normT = sign(v − center) × sqrt(|v − center| / range)`, `pos = normT / 2 + 0.5`

Key value checkpoints for min=−100, max=100:

| pos  | cents |
|------|-------|
| 0.00 | −100  |
| 0.34 | −10   |
| 0.50 |   0   |
| 0.66 | +10   |
| 1.00 | +100  |

The ±10 cent zone occupies about 32% of each half-sweep (64% of total travel).

## Goals / Non-Goals

**Goals:**
- Concentrate knob precision in the ±10 cent region without removing access to ±100 cents
- Keep the scale invertible (round-trip pos→value→pos is lossless)
- Require no changes to DSP code or MIDI mapping

**Non-Goals:**
- Applying the taper to any knob other than the two detune knobs
- Exposing taper strength as a configurable parameter
- Changing the displayed value range (still shows cents, same min/max)

## Decisions

**Quadratic (power=2) over cubic (power=3) or piecewise linear**

Power=2 puts ±10 cents at ~32% of half-travel. Power=3 puts it at ~46% — more compression but the outer range becomes difficult to hit accurately. Piecewise linear has a hard velocity change at the breakpoint that feels unnatural during performance. Quadratic is smooth, simple, and the precision trade-off matches the stated use pattern.

**New scale name `'fine-center'` rather than `'bipolar-power'` or `'detune'`**

`'fine-center'` describes the user-observable behavior (more precision near center) rather than the math or the specific use case. It could generalize to other bipolar controls in future without renaming. `'detune'` is too specific; `'bipolar-power'` leaks implementation detail.

**Scale lives in `math.js`, not inside `Knob.svelte`**

Consistent with the existing architecture: all scale math is in `math.js`, Knob is purely a display/interaction component. Tests for the scale belong in `math.test.js`.

## Risks / Trade-offs

- [Existing MIDI CC assignments] MIDI CC values (0–127) are mapped to normalized pos (0–1) before being passed to the Knob as `externalValue`. The `externalValue` is in raw value space (cents), not pos space, so the MIDI→value mapping in `engine.js` is unaffected. → No risk.
- [Saved presets] If any preset state stores the raw cents value (not a knob position), loading saved patches is unaffected. If state stores normalized pos, saved patches would re-interpret pos through the new curve. → Check `engine.js` to confirm state is stored as raw cents before implementing.
- [Display value] The value label (if shown) calls `formatValue(value, unit)` which receives the raw cents value — unaffected by the scale.

## Open Questions

- Confirm that engine state serialization stores detune as raw cents (not normalized pos), to rule out any preset-loading regression.
