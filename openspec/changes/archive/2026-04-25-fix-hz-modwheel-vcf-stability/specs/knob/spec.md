## MODIFIED Requirements

### Requirement: Value label display

Each knob SHALL display its current value below the SVG graphic with appropriate units (Hz, ms, %, etc.) as a formatted string. For Hz values, the formatting SHALL depend on magnitude:
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

#### Scenario: Frequency knob label at 9.9 Hz shows two decimals

- **WHEN** an LFO rate knob is set to 9.9 Hz
- **THEN** label reads "9.90 Hz" (not "10 Hz")
