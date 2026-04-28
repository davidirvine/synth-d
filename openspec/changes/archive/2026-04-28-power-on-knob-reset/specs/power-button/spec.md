## ADDED Requirements

### Requirement: Power-on orchestrates spring-animated knob reset

When the power button transitions to ON, the system SHALL:
1. Set `springEnabled` to `true` on all knobs before applying default values.
2. Apply default values to all knobs via `ccExternalValues`.
3. Set `springEnabled` back to `false` after 800 ms.

This sequence SHALL be coordinated in `App.svelte`'s `handleToggle` function. The `springEnabled` state SHALL be propagated to all panel components and then to each `Knob` instance via props.

#### Scenario: springEnabled set before defaults applied

- **WHEN** the user activates the power button
- **THEN** `springEnabled` is set to `true` before `ccExternalValues` is populated with default values, ensuring the spring is active when knob `externalValue` props first change

#### Scenario: springEnabled cleared after animation window

- **WHEN** 800 ms have elapsed since `springEnabled` was set to `true` on power-on
- **THEN** `springEnabled` is set to `false` so all subsequent knob value changes are instant

#### Scenario: springEnabled is false on power-off

- **WHEN** the user deactivates the power button
- **THEN** `springEnabled` is `false` (it is not modified during power-off)
