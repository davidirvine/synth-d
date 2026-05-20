## MODIFIED Requirements

### Requirement: ADSR filter contour with bipolar amount

The filter SHALL accept an ADSR envelope modulating the cutoff frequency. The contour amount parameter SHALL span −10 000 … +10 000 Hz (bipolar), with a default of 0. At amount = 0 the filter cutoff is unaffected by the envelope. With positive amount the envelope raises the cutoff by up to 10 000 Hz above the base cutoff at envelope peak. With negative amount the envelope lowers the cutoff by up to 10 000 Hz below the base cutoff at envelope peak; the existing lower clamp (20 Hz) keeps the effective cutoff at or above 20 Hz. The DSP modulation formula (`baseCutoff + filterEnvOut × filterEnvAmt`) is identical for both signs — only the sign of `filterEnvAmt` differs.

#### Scenario: Zero contour amount

- **WHEN** filter envelope amount is 0
- **THEN** the filter cutoff follows only the base cutoff and key tracking; envelope has no effect

#### Scenario: Positive contour opens filter on key press

- **WHEN** filter envelope amount is greater than 0 and a key is pressed
- **THEN** the effective cutoff rises above the base cutoff during the attack phase and returns toward base cutoff during decay toward the sustain level

#### Scenario: Negative contour closes filter on key press

- **WHEN** filter envelope amount is less than 0 and a key is pressed
- **THEN** the effective cutoff drops below the base cutoff during the attack phase, recovering toward `baseCutoff + amount × sustainLevel` (which sits below base) during decay, and never falls below the 20 Hz lower clamp

#### Scenario: Release returns cutoff to base

- **WHEN** a key is released with a non-zero filter envelope amount
- **THEN** the effective cutoff returns to the base cutoff value over the release time, from either above (positive amount) or below (negative amount)
