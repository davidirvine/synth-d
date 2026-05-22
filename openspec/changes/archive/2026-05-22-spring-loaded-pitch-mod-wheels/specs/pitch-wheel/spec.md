## ADDED Requirements

### Requirement: On-screen pitch wheel bends oscillator frequency

The wheels panel SHALL display a PITCH wheel that, when dragged, bends the played note's frequency by up to ±2 semitones, reusing the same frequency-bend signal path as incoming MIDI pitch-bend messages. The wheel value SHALL map linearly so that 0.5 produces no bend, 1.0 produces +2 semitones, and 0.0 produces −2 semitones.

#### Scenario: Dragging the pitch wheel up bends pitch sharp
- **WHEN** the synth is powered and the user drags the PITCH wheel above center while a note sounds
- **THEN** the note's frequency rises toward +2 semitones at the top of travel

#### Scenario: Dragging the pitch wheel down bends pitch flat
- **WHEN** the synth is powered and the user drags the PITCH wheel below center while a note sounds
- **THEN** the note's frequency falls toward −2 semitones at the bottom of travel

#### Scenario: Pitch wheel at center applies no bend
- **WHEN** the PITCH wheel is at its 0.5 rest position
- **THEN** no frequency bend is applied and the note sounds at its nominal pitch

### Requirement: Pitch wheel rests at and springs back to center

The PITCH wheel SHALL initialise to 0.5 (center, no bend) and SHALL return to 0.5 when released, animated by the wheel spring physics. While returning, the frequency bend SHALL follow the cursor position so the pitch audibly glides back to the unbent note.

#### Scenario: Pitch springs back to center on release
- **WHEN** the user releases the PITCH wheel away from center
- **THEN** the cursor springs back to 0.5 and the frequency bend follows it back to no bend

#### Scenario: Pitch wheel initialises at center
- **WHEN** the synth is powered on
- **THEN** the PITCH wheel cursor is at 0.5 and no bend is applied

### Requirement: Incoming MIDI pitch-bend overrides the on-screen pitch wheel

When a MIDI pitch-bend message is received, the PITCH wheel cursor SHALL snap to the position corresponding to the bend amount and any active spring-back SHALL be cancelled, so the on-screen wheel stays in sync with the hardware control (mirroring the MOD wheel's MIDI CC 1 behavior).

#### Scenario: MIDI pitch-bend snaps the cursor and cancels spring-back
- **WHEN** a MIDI pitch-bend message arrives while the PITCH wheel is springing back to center
- **THEN** the spring-back is cancelled and the cursor snaps to the position corresponding to the received bend amount

### Requirement: Pitch wheel bend is transient and inert when no note sounds

The PITCH wheel SHALL bend whatever frequency is currently set. When no note is sounding, its frequency writes SHALL be inert and SHALL NOT carry a stale bend into the next note: the next note-on SHALL compute its frequency independently, matching existing MIDI pitch-bend semantics.

#### Scenario: Releasing the pitch wheel with no note sounding does not affect the next note
- **WHEN** the user drags and releases the PITCH wheel while no note is sounding
- **THEN** the spring-back writes are inert and the next note-on plays at its nominal (unbent) pitch
