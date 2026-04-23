# Keyboard (delta)

## ADDED Requirements

### Requirement: MIDI-driven key highlighting
The system SHALL highlight a visual keyboard key when a MIDI note-on is received for that note, using the same amber highlight (#c87941) applied to QWERTY and pointer presses. The highlight SHALL be removed when the corresponding MIDI note-off is received.

#### Scenario: MIDI note within displayed range highlighted
- **WHEN** a MIDI note-on is received for a note within the keyboard's displayed range (C3–C5, MIDI 48–72)
- **THEN** that key is highlighted in amber for the duration of the MIDI note

#### Scenario: MIDI note outside displayed range
- **WHEN** a MIDI note-on is received for a note outside MIDI 48–72
- **THEN** no key is highlighted, but the note still sounds at the correct frequency

#### Scenario: MIDI note-off removes highlight
- **WHEN** a MIDI note-off is received for a highlighted key
- **THEN** the highlight is removed from that key

---

### Requirement: Shared active-key state across input sources
The system SHALL maintain a single `activeKeys` set that tracks active notes regardless of whether they originate from QWERTY, pointer, or MIDI input. The gate parameter SHALL only be set to 0 when the `activeKeys` set becomes empty, regardless of which input source triggers the release.

#### Scenario: MIDI note held while QWERTY note released
- **WHEN** a MIDI note-on has been received for note A and a QWERTY note B is released
- **THEN** gate remains 1 because note A is still in `activeKeys`

#### Scenario: All sources released
- **WHEN** all active notes from all input sources are released
- **THEN** gate is set to 0
