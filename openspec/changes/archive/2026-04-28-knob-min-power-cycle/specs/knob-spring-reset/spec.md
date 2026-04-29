## ADDED Requirements

### Requirement: Tweened knob sweep to min on power-off

When the synth powers off, all knob `externalValue` props SHALL be set to their parameter's minimum value. This SHALL trigger the knob's built-in tweened animation (100 ms duration), sweeping each knob indicator from its current position to the minimum. No flag or timer is required; the animation completes automatically when the tween finishes.

#### Scenario: Knob indicators sweep to min on power-off via tweened animation

- **WHEN** the user activates the power button to turn the synth off
- **THEN** each knob indicator animates smoothly to the minimum position over 100 ms

#### Scenario: Knob indicators are at minimum after power-off sweep completes

- **WHEN** 100 ms have elapsed since the power-off sweep was initiated
- **THEN** all knob indicators are at the minimum position

#### Scenario: Power-off sweep is symmetric with power-on sweep

- **WHEN** the synth is powered off after a power-on reset has completed
- **THEN** the power-off sweep behaves identically to the power-on sweep but in reverse, sweeping from current (default) to minimum
