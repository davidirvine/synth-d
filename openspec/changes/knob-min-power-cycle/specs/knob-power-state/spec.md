## ADDED Requirements

### Requirement: Knobs initialise at minimum value on page load

On page load, before the synth is powered on, all knob `externalValue` props SHALL be set to the parameter's declared minimum value. No random or arbitrary initial position SHALL be used. The visual indicator of every knob SHALL rest at the minimum (fully counter-clockwise) position when the page first renders.

#### Scenario: Knob indicator is at min on page load

- **WHEN** the application loads for the first time (synth is not yet powered on)
- **THEN** every knob indicator is at the minimum position (fully counter-clockwise)

#### Scenario: No random position on reload

- **WHEN** the page is refreshed
- **THEN** all knob indicators are at minimum, never at a random or mid-range position

---

### Requirement: Power-on animates knobs from min to defaults

When the synth powers on, the knob `externalValue` props SHALL be updated from their min values to `DEFAULTS`, triggering the existing spring animation. Because knobs are guaranteed to be at min before power-on, the spring sweep SHALL always start from the minimum position.

#### Scenario: Spring sweep starts from min on power-on

- **WHEN** the user presses the power button (synth was off)
- **THEN** all knob indicators animate from the minimum position to their default values via the spring

#### Scenario: Consistent power-on sweep after power-off

- **WHEN** the synth is powered off and then powered on again
- **THEN** all knob indicators animate from minimum to defaults, identically to the first power-on

---

### Requirement: Power-off animates knobs back to minimum

When the synth powers off, all knob `externalValue` props SHALL be set to their parameter's minimum value, triggering the spring animation (if `springEnabled` is true) or an instant snap (if false). After power-off completes, all knob indicators SHALL be at the minimum position.

#### Scenario: Knobs sweep to min on power-off

- **WHEN** the user presses the power button (synth was on)
- **THEN** all knob indicators animate toward the minimum position

#### Scenario: Knob indicators are at min after power-off animation completes

- **WHEN** the power-off animation has finished
- **THEN** every knob indicator rests at the minimum (fully counter-clockwise) position

#### Scenario: Powering off with springEnabled false snaps knobs to min instantly

- **WHEN** the synth powers off and springEnabled is false
- **THEN** all knob indicators snap immediately to the minimum position without animation
