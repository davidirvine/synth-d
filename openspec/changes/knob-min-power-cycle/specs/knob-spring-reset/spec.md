## ADDED Requirements

### Requirement: Spring-animated knob sweep to min on power-off

When the synth powers off, all knob `externalValue` props SHALL be set to their parameter's minimum value while `springEnabled` is `true`. This SHALL trigger the existing spring animation, sweeping each knob indicator from its current position to the minimum. After the spring settles (no later than 800 ms), `springEnabled` SHALL be set to `false` as it is after the power-on reset.

#### Scenario: Knob indicators sweep to min on power-off via spring

- **WHEN** the user activates the power button to turn the synth off and springEnabled is true
- **THEN** each knob indicator animates smoothly to the minimum position via the spring

#### Scenario: springEnabled disabled after power-off sweep completes

- **WHEN** 800 ms have elapsed since the power-off spring sweep was initiated
- **THEN** springEnabled is false and all knob indicators are at the minimum position

#### Scenario: Power-off spring sweep is symmetric with power-on sweep

- **WHEN** the synth is powered off after a power-on spring reset has completed
- **THEN** the power-off sweep behaves identically to the power-on sweep but in reverse, sweeping from current (default) to minimum
