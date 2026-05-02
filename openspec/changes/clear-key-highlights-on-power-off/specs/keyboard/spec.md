## ADDED Requirements

### Requirement: All key highlights cleared on power-off

The system SHALL clear the `activeKeys` set whenever the synth transitions from powered-on to powered-off, regardless of which input source(s) (mouse/pointer, QWERTY, MIDI) populated it. After the transition, no key on the rendered keyboard SHALL display the active highlight, and the gate parameter SHALL be 0. The clear SHALL execute as part of the power-off side-effect path so that the visual state matches the inert engine state from the moment audio is suspended.

#### Scenario: Held QWERTY key is unhighlighted on power-off

- **WHEN** a QWERTY key is held down (highlighting its mapped piano key) and the user toggles the power button to OFF
- **THEN** the key's amber highlight is removed immediately and `gate` is set to 0

#### Scenario: Held MIDI note is unhighlighted on power-off

- **WHEN** an external MIDI note-on has been received (highlighting the corresponding key) and the user toggles the power button to OFF
- **THEN** the key's amber highlight is removed immediately and `gate` is set to 0

#### Scenario: Multiple held inputs all cleared on power-off

- **WHEN** a QWERTY key and a MIDI note are both currently held (both keys highlighted) and the user toggles the power button to OFF
- **THEN** both highlights are removed and `activeKeys` becomes empty

#### Scenario: Power-on after power-off with stuck physical input shows clean keyboard

- **WHEN** a QWERTY key is held continuously across a power-off → power-on cycle
- **THEN** immediately after power-on no key on the on-screen keyboard is highlighted and `gate` is 0; a fresh keydown event (release + re-press) is required to retrigger the note
