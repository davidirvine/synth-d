## ADDED Requirements

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
