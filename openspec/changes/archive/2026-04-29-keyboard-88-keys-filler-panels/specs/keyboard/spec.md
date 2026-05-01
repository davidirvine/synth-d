## MODIFIED Requirements

### Requirement: 61-key visual piano keyboard with configurable base

The system SHALL render a 61-key piano keyboard as interactive SVG elements. The visible range is determined by a `baseMidi` prop (default 36, C2–C7). The keyboard SHALL always show exactly 61 consecutive keys starting from `baseMidi`. White and black keys SHALL be visually distinct and styled to the Moog dark aesthetic. A 1 px top rail in `#333` SHALL span the full keyboard width at the top of the SVG, providing a subtle visual boundary between the black keys and the panel background.

#### Scenario: Key count

- **WHEN** the keyboard is rendered
- **THEN** exactly 61 keys are shown: 36 white keys and 25 black keys

#### Scenario: Top rail visible

- **WHEN** the keyboard is rendered
- **THEN** a 1 px horizontal rail in `#333` is visible at the top of the keyboard spanning its full width, and all keys are seated below it

#### Scenario: Active key highlight

- **WHEN** a key is pressed (mouse or QWERTY)
- **THEN** the key is highlighted in amber (#c87941) for the duration of the press

---

### Requirement: Base MIDI note is reactive

The system SHALL re-render the key array immediately whenever the `baseMidi` prop changes. The total SVG width SHALL remain constant (36 white keys × 28 px = 1 008 px) regardless of `baseMidi`, because any 61-key span contains exactly 36 white keys.

#### Scenario: Register shift re-renders keys

- **WHEN** `baseMidi` changes from 36 to 21
- **THEN** the keyboard immediately shows 61 keys starting from A0 (MIDI 21–81) with no layout shift

#### Scenario: Width is constant across register positions

- **WHEN** `baseMidi` is set to either 21 or 48
- **THEN** the keyboard SVG width remains 1 008 px

---

### Requirement: MIDI-driven key highlighting

The system SHALL highlight a visual keyboard key when a MIDI note-on is received for that note, using the same amber highlight (#c87941) applied to QWERTY and pointer presses. The highlight SHALL be removed when the corresponding MIDI note-off is received. Highlighting applies only to keys currently in the visible window.

#### Scenario: MIDI note within current window highlighted

- **WHEN** a MIDI note-on is received for a note within the currently displayed range
- **THEN** that key is highlighted in amber for the duration of the MIDI note

#### Scenario: MIDI note outside current window

- **WHEN** a MIDI note-on is received for a note outside the currently displayed range
- **THEN** no key is highlighted, but the note still sounds at the correct frequency

#### Scenario: MIDI note-off removes highlight

- **WHEN** a MIDI note-off is received for a highlighted key
- **THEN** the highlight is removed from that key
