## MODIFIED Requirements

### Requirement: Value label display
Each knob SHALL display its current value below the SVG graphic with appropriate units (Hz, ms, %, etc.) as a formatted string. The value label element SHALL have a stable minimum width so that changes in the formatted string length do not cause surrounding layout elements to shift. The label SHALL be displayed as an inline-block with centred text. For Hz values, the formatting SHALL depend on magnitude:
- Values ≥ 1 000 Hz: display in kHz with one decimal place (e.g., "1.2 kHz")
- Values ≥ 10 Hz and < 1 000 Hz: display as a whole number (e.g., "440 Hz")
- Values > 0 Hz and < 10 Hz: display with two decimal places (e.g., "0.10 Hz", "9.90 Hz")

#### Scenario: Frequency knob label above 1 kHz
- **WHEN** cutoff knob is set to 1200 Hz
- **THEN** label reads "1.2 kHz"

#### Scenario: Frequency knob label in mid range
- **WHEN** cutoff knob is set to 440 Hz
- **THEN** label reads "440 Hz"

#### Scenario: Frequency knob label below 10 Hz shows two decimals
- **WHEN** an LFO rate knob is set to 0.1 Hz
- **THEN** label reads "0.10 Hz" (not "0 Hz")

#### Scenario: Value label does not cause layout reflow
- **WHEN** a knob value changes between a short formatted string and a longer one (e.g., "1 Hz" vs "440 Hz")
- **THEN** the surrounding layout does not shift; the label occupies a stable fixed minimum width

#### Scenario: Time knob label
- **WHEN** attack knob is set to 250ms
- **THEN** label reads "250 ms"
