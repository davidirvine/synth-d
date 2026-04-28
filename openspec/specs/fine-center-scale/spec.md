# fine-center-scale Specification

## Purpose
TBD - created by archiving change tweak-detune-taper. Update Purpose after archive.
## Requirements
### Requirement: Fine-center scale concentrates precision near bipolar center
The `normalizedToValue` and `valueToNormalized` functions in `math.js` SHALL support a `'fine-center'` scale. The scale SHALL apply a quadratic taper symmetric around the midpoint of the value range, giving more knob travel to values near the center and compressing travel toward the extremes.

For a bipolar range with `center = (max + min) / 2` and `range = (max − min) / 2`:
- Forward: `value = center + sign(t) × t² × range` where `t = (pos − 0.5) × 2`
- Inverse: `normT = sign(v) × sqrt(|v − center| / range)`, `pos = normT / 2 + 0.5`

The mapping SHALL be exactly invertible: `valueToNormalized(normalizedToValue(pos, min, max, 'fine-center'), min, max, 'fine-center') === pos` for all pos ∈ [0, 1].

#### Scenario: Center position maps to center value
- **WHEN** pos is 0.5 and scale is 'fine-center'
- **THEN** normalizedToValue returns the arithmetic center of the range

#### Scenario: Minimum position maps to minimum value
- **WHEN** pos is 0 and scale is 'fine-center'
- **THEN** normalizedToValue returns min

#### Scenario: Maximum position maps to maximum value
- **WHEN** pos is 1 and scale is 'fine-center'
- **THEN** normalizedToValue returns max

#### Scenario: ±10 cents at approximately 32% of half-sweep for detune range
- **WHEN** pos is approximately 0.342 with min=-100 and max=100 and scale is 'fine-center'
- **THEN** normalizedToValue returns approximately -10 cents (within 0.1 cent)

#### Scenario: Round-trip pos is lossless
- **WHEN** valueToNormalized is called on the result of normalizedToValue for any pos in [0, 1]
- **THEN** the returned pos matches the original pos within floating-point precision

