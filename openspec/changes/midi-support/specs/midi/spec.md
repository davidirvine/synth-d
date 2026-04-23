# Midi

## Purpose

Provides Web MIDI API access, MIDI input device enumeration and selection, and translation of MIDI note-on, note-off, pitchbend, and CC messages into synth engine parameters. Owns the CC-to-knob-parameter mapping and learn mode lifecycle.

## ADDED Requirements

### Requirement: Web MIDI access request
The system SHALL request Web MIDI access on synth power-on using `navigator.requestMIDIAccess`. If access is denied, unavailable (browser not supported), or the page is served over an insecure origin, the system SHALL set MIDI status to `unavailable` and continue operating normally without MIDI input.

#### Scenario: MIDI access granted
- **WHEN** `navigator.requestMIDIAccess` resolves successfully
- **THEN** MIDI status is set to `connected` and all available input ports are enumerated

#### Scenario: MIDI API not supported
- **WHEN** `navigator.requestMIDIAccess` is not a function (e.g., Safari)
- **THEN** MIDI status is set to `unavailable` and no error is thrown; synth operates normally

#### Scenario: MIDI access denied
- **WHEN** the user denies the MIDI permission prompt
- **THEN** MIDI status is set to `unavailable` and no MIDI input is processed

---

### Requirement: MIDI input device enumeration
The system SHALL enumerate all available MIDI input ports and present them to the user when more than one port is connected. The system SHALL listen for device connections and disconnections and update the port list dynamically.

#### Scenario: Single input device
- **WHEN** exactly one MIDI input device is connected
- **THEN** that device is selected automatically with no UI selector shown

#### Scenario: Multiple input devices
- **WHEN** two or more MIDI input devices are connected
- **THEN** a device selector (dropdown) is shown listing all available inputs by name

#### Scenario: Device hot-plug
- **WHEN** a MIDI device is connected after the page loads
- **THEN** the device appears in the selector within one event cycle without a page reload

#### Scenario: Device disconnected
- **WHEN** the active MIDI input device is disconnected
- **THEN** any active notes from that device are released (gate set to 0), and the device is removed from the selector

---

### Requirement: MIDI note-on handling
The system SHALL respond to MIDI note-on messages (status byte 0x9n, velocity > 0) by triggering the corresponding note on the synth engine using the same `triggerNote` path as QWERTY and pointer input.

#### Scenario: Note-on received
- **WHEN** a MIDI note-on message is received for any MIDI note number
- **THEN** the synth plays the corresponding frequency and the matching visual keyboard key is highlighted if it falls within the displayed range

#### Scenario: Note-on with velocity zero treated as note-off
- **WHEN** a MIDI note-on message with velocity 0 is received
- **THEN** it is treated as a note-off for that note

---

### Requirement: MIDI note-off handling
The system SHALL respond to MIDI note-off messages (status byte 0x8n) by releasing the note via the same `releaseNote` path, which sends gate=0 when all active notes are released.

#### Scenario: Note-off received
- **WHEN** a MIDI note-off message is received for the currently active note
- **THEN** the note is released and gate is set to 0 if no other notes remain active

#### Scenario: Note-off for non-active note ignored
- **WHEN** a MIDI note-off is received for a note that is not currently active
- **THEN** no engine parameters are changed

---

### Requirement: MIDI pitchbend handling
The system SHALL respond to MIDI pitchbend messages (status byte 0xEn) by adjusting the oscillator frequency. The pitchbend range SHALL be ±2 semitones. When pitchbend returns to center (value 8192), the oscillator frequency SHALL return to the unmodified note frequency.

#### Scenario: Pitchbend up
- **WHEN** a pitchbend message with value 16383 (maximum) is received
- **THEN** the `freq` parameter is set to the current note frequency shifted up by 2 semitones

#### Scenario: Pitchbend center
- **WHEN** a pitchbend message with value 8192 (center) is received
- **THEN** the `freq` parameter is set to the unmodified note frequency

#### Scenario: Pitchbend with no active note
- **WHEN** a pitchbend message is received while no note is active
- **THEN** the bend value is stored and applied when the next note-on fires

---

### Requirement: MIDI status indicator
The system SHALL display a MIDI status indicator in the synth UI header showing the current MIDI connection state.

#### Scenario: MIDI unavailable
- **WHEN** MIDI status is `unavailable`
- **THEN** the indicator displays a grey dot and the label "MIDI"

#### Scenario: MIDI connected, no active note
- **WHEN** MIDI access is granted and a device is connected but no note is playing
- **THEN** the indicator displays an amber dot

#### Scenario: MIDI active (note playing)
- **WHEN** a MIDI note is currently sounding
- **THEN** the indicator displays a green dot

---

### Requirement: MIDI CC message handling
The system SHALL receive MIDI CC messages (status byte 0xBn) and dispatch them to any synth parameter that has a CC mapping registered. The CC value (0–127) SHALL be linearly scaled to the mapped parameter's `[min, max]` range before being applied.

#### Scenario: CC message dispatched to mapped parameter
- **WHEN** a CC message is received for a CC number that has a registered mapping
- **THEN** the corresponding synth parameter is updated and the matching knob visually reflects the new value

#### Scenario: CC message for unmapped CC number
- **WHEN** a CC message is received for a CC number with no registered mapping
- **THEN** the message is silently ignored

#### Scenario: CC value scaling
- **WHEN** a CC message with value 0 is received for a parameter mapped to range [min, max]
- **THEN** the parameter is set to `min`

#### Scenario: CC value scaling at maximum
- **WHEN** a CC message with value 127 is received for a parameter mapped to range [min, max]
- **THEN** the parameter is set to `max`

---

### Requirement: CC learn mode — assignment
The system SHALL support a learn mode where the user assigns a MIDI CC number to a specific synth parameter by right-clicking the corresponding knob and then moving a hardware CC control. Only one parameter may be in learn mode at a time.

#### Scenario: Enter learn mode
- **WHEN** the user right-clicks a knob
- **THEN** that knob enters learn mode (pulsing highlight ring) and the system waits for the next incoming CC message

#### Scenario: CC received while in learn mode
- **WHEN** a CC message is received while a knob is in learn mode
- **THEN** the CC number is assigned to that knob's parameter, learn mode exits, and the knob highlight ring stops pulsing

#### Scenario: Only one knob in learn mode at a time
- **WHEN** the user right-clicks a second knob while another is already in learn mode
- **THEN** the first knob exits learn mode without saving, and the second knob enters learn mode

#### Scenario: Cancel learn mode
- **WHEN** the user presses Escape while a knob is in learn mode
- **THEN** learn mode exits without saving any mapping

---

### Requirement: CC learn mode — persistence
The system SHALL persist CC-to-parameter mappings to `localStorage` so they survive page reload. Mappings SHALL be keyed by synth parameter name.

#### Scenario: Mapping persists after reload
- **WHEN** a CC mapping is assigned and the page is reloaded
- **THEN** the same CC number controls the same parameter without re-learning

#### Scenario: Mapping overwritten
- **WHEN** the user assigns a new CC number to a parameter that already has a mapping
- **THEN** the old mapping is replaced by the new one in both memory and `localStorage`

#### Scenario: Existing mapping shown on knob
- **WHEN** a knob has a registered CC mapping
- **THEN** the assigned CC number is displayed on or near the knob (e.g., small "CC 74" label)
