## MODIFIED Requirements

### Requirement: Power-off animates knobs back to minimum

When the synth powers off, non-bipolar knob `externalValue` props SHALL be set to their parameter's minimum value, triggering the knob's built-in tweened animation (100 ms duration). Bipolar knob `externalValue` props SHALL be set to their sweep midpoint (`(min + max) / 2`), placing the indicator at the 12 o'clock position. After power-off completes, non-bipolar knob indicators SHALL be at the minimum position; bipolar knob indicators SHALL be at the 12 o'clock position.

#### Scenario: Non-bipolar knob sweeps to min on power-off

- **WHEN** the user presses the power button (synth was on) and the knob is non-bipolar
- **THEN** the knob indicator animates toward the minimum position

#### Scenario: Bipolar knob sweeps to 12 o'clock on power-off

- **WHEN** the user presses the power button (synth was on) and the knob is bipolar
- **THEN** the knob indicator animates toward the 12 o'clock (sweep midpoint) position

#### Scenario: Non-bipolar indicator is at min after power-off animation completes

- **WHEN** the power-off animation has finished and the knob is non-bipolar
- **THEN** the knob indicator rests at the minimum (fully counter-clockwise) position

#### Scenario: Bipolar indicator is at 12 o'clock after power-off animation completes

- **WHEN** the power-off animation has finished and the knob is bipolar
- **THEN** the knob indicator rests at the 12 o'clock (sweep center) position

#### Scenario: Power-off always animates non-bipolar knobs to min via tweened animation

- **WHEN** the synth powers off and the knob is non-bipolar
- **THEN** the knob indicator animates to the minimum position over 100 ms via the knob's built-in tweened animation

#### Scenario: Power-off always animates bipolar knobs to midpoint via tweened animation

- **WHEN** the synth powers off and the knob is bipolar
- **THEN** the knob indicator animates to the 12 o'clock position over 100 ms via the knob's built-in tweened animation

---

### Requirement: Knobs initialise at minimum value on page load

On page load, before the synth is powered on, non-bipolar knob `externalValue` props SHALL be set to the parameter's declared minimum value. Bipolar knob `externalValue` props SHALL be set to their sweep midpoint (`(min + max) / 2`). The visual indicator of every knob SHALL rest at the corresponding position (fully counter-clockwise for non-bipolar; 12 o'clock for bipolar) when the page first renders.

#### Scenario: Non-bipolar knob indicator is at min on page load

- **WHEN** the application loads for the first time (synth is not yet powered on) and the knob is non-bipolar
- **THEN** the knob indicator is at the minimum position (fully counter-clockwise)

#### Scenario: Bipolar knob indicator is at 12 o'clock on page load

- **WHEN** the application loads for the first time (synth is not yet powered on) and the knob is bipolar
- **THEN** the knob indicator is at the 12 o'clock (sweep center) position

#### Scenario: No random position on reload

- **WHEN** the page is refreshed
- **THEN** all knob indicators are at their power-off rest positions (min for non-bipolar; 12 o'clock for bipolar), never at a random or arbitrary position

---

### Requirement: Power-on animates knobs from rest to defaults

When the synth powers on, the knob `externalValue` props SHALL be updated from their power-off rest values to `DEFAULTS`, triggering the existing spring animation. Non-bipolar knobs start from their minimum; bipolar knobs start from their sweep midpoint (12 o'clock).

#### Scenario: Non-bipolar knob spring sweep starts from min on power-on

- **WHEN** the user presses the power button (synth was off) and the knob is non-bipolar
- **THEN** the knob indicator animates from the minimum position to its default value via the spring

#### Scenario: Bipolar knob spring sweep starts from 12 o'clock on power-on

- **WHEN** the user presses the power button (synth was off) and the knob is bipolar
- **THEN** the knob indicator animates from the 12 o'clock position to its default value via the spring

#### Scenario: Consistent power-on sweep after power-off

- **WHEN** the synth is powered off and then powered on again
- **THEN** all knob indicators animate from their rest positions to defaults, identically to the first power-on
