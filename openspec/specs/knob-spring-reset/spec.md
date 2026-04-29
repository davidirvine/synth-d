# knob-spring-reset Specification

## Purpose
TBD - created by archiving change power-on-knob-reset. Update Purpose after archive.
## Requirements
### Requirement: Spring-animated knob reset on power-on

The system SHALL animate all knob indicators from their current positions to their default values using the Svelte spring store during the power-on sequence. Animation SHALL use the existing spring parameters (`stiffness: 0.1, damping: 0.85`). The spring animation SHALL be disabled automatically after the animation completes (no later than 800 ms after initiation), so subsequent external value changes snap instantly.

#### Scenario: Knob indicator sweeps to default on power-on

- **WHEN** the user activates the power button and all knobs are reset to defaults
- **THEN** each knob's visual indicator animates smoothly from its current position to the default position via the spring

#### Scenario: Spring disabled after reset completes

- **WHEN** 800 ms have elapsed since the power-on spring reset was initiated
- **THEN** `springEnabled` is `false` and subsequent external value changes on all knobs snap the indicator instantly without spring animation

#### Scenario: No spring lag during normal MIDI CC interaction

- **WHEN** a MIDI CC message arrives and updates a knob's `externalValue` while the synth is powered on (not during power-on reset)
- **THEN** the knob indicator moves to the new position instantly without spring animation

#### Scenario: Power-on reset while spring already disabled

- **WHEN** the power button is activated and `springEnabled` is already `false`
- **THEN** `springEnabled` is set to `true` before the default values are applied and the spring animation runs normally

---

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
- **THEN** the power-off sweep behaves identically to the power-on sweep but in reverse, sweeping from current position to minimum

