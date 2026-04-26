## ADDED Requirements

### Requirement: OSC 3 range and detune controls are disabled in LFO mode
When OSC 3 LFO mode is active, the range step buttons and the detune knob SHALL be rendered in a disabled state and SHALL NOT accept user input. The waveform selector SHALL remain enabled because waveform choice affects the shape of the LFO signal.

#### Scenario: Range buttons disabled in LFO mode
- **WHEN** OSC 3 LFO mode is on
- **THEN** the OSC 3 range `+` and `−` step buttons are disabled and do not respond to clicks

#### Scenario: Detune knob disabled in LFO mode
- **WHEN** OSC 3 LFO mode is on
- **THEN** the OSC 3 detune knob is in its disabled state and does not respond to drag or scroll input

#### Scenario: Controls re-enabled when LFO mode is turned off
- **WHEN** OSC 3 LFO mode is turned off
- **THEN** the OSC 3 range step buttons and detune knob become interactive again

#### Scenario: Waveform selector remains enabled in LFO mode
- **WHEN** OSC 3 LFO mode is on
- **THEN** all six waveform buttons for OSC 3 remain interactive and can be changed
