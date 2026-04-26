## MODIFIED Requirements

### Requirement: Virtual mod wheel on-screen control

The modulation panel SHALL display a vertical slider functioning as a virtual mod wheel. Dragging it upward increases modulation depth from 0 to 1. The virtual wheel SHALL initialise to 0.5 (center position) at power-on. The virtual wheel SHALL remain in sync with incoming MIDI CC 1 messages: when CC 1 is received, the on-screen slider updates to match. The FAUST DSP `modWheel` hslider default SHALL also be 0.5 so that the DSP and Svelte state agree at power-on without requiring any user interaction.

#### Scenario: Dragging virtual wheel increases modulation

- **WHEN** user drags the virtual mod wheel slider upward
- **THEN** modulation depth increases and audible modulation deepens if routing is active

#### Scenario: Virtual wheel defaults to center at power-on

- **WHEN** the synth starts with no saved state
- **THEN** the virtual mod wheel is at 0.5 and the DSP modWheel parameter is also 0.5

#### Scenario: MIDI CC 1 updates virtual wheel position

- **WHEN** MIDI CC 1 message is received
- **THEN** the virtual mod wheel slider moves to the position corresponding to the CC value (0–127 → 0–1)

#### Scenario: Virtual wheel and CC 1 stay in sync

- **WHEN** user moves the virtual wheel and then a CC 1 message arrives
- **THEN** the on-screen slider updates to the CC 1 value, overriding the prior manual position
