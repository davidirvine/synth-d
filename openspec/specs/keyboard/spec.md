# Keyboard

## Purpose

Provides a 61-key interactive piano keyboard UI supporting both mouse/click and QWERTY computer keyboard input. The keyboard enforces monophonic legato behavior and maps input to oscillator frequency and gate parameters sent to the DSP engine. The visible range is configurable via a `baseMidi` prop, enabling coverage of the full 88-key range through two fixed register positions.
## Requirements
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

### Requirement: Mouse/click interaction

The system SHALL trigger a note when the user clicks or mousedowns on a keyboard key and release the note on mouseup or mouseleave.

#### Scenario: Click to play

- **WHEN** user clicks a white or black key
- **THEN** the corresponding note plays immediately on mousedown

#### Scenario: Release on mouseup

- **WHEN** user releases the mouse button
- **THEN** gate is set to 0 (note off)

---

### Requirement: QWERTY keyboard mapping

The system SHALL map computer keyboard keys to piano keys using the standard two-row layout. Lower octave: `z s x d c v g b h n j m` (white=z,x,c,v,b,n,m; black=s,d,g,h,j). Upper octave: `q 2 w 3 e r 5 t 6 y 7 u` (white=q,w,e,r,t,y,u; black=2,3,5,6,7).

#### Scenario: Z key plays C

- **WHEN** user presses the Z key
- **THEN** the lowest C on the keyboard sounds

#### Scenario: S key plays C#

- **WHEN** user presses the S key
- **THEN** C# above the lowest C sounds

#### Scenario: Key repeat suppressed

- **WHEN** a QWERTY key is held down (OS key repeat fires)
- **THEN** no retrigger occurs from key repeat events; only the initial keydown triggers

---

### Requirement: Monophonic legato behavior

The system SHALL be monophonic — only one note plays at a time. When a new key is pressed while another is held, the oscillator frequency is updated without sending a gate pulse (legato). Both envelopes continue their current phase without interruption.

#### Scenario: New key while holding old

- **WHEN** key A is held and key B is pressed
- **THEN** frequency changes to key B's pitch; envelopes are not retriggered (legato, no gate pulse)

#### Scenario: Release held key after pressing new

- **WHEN** key A is held, key B is pressed, then key A is released
- **THEN** note continues sounding at key B's pitch (key B is still held)

---

### Requirement: Frequency and gate parameter mapping

The system SHALL compute oscillator frequency as `440 * 2^((midiNote - 69) / 12)` Hz and send both `freq` and `gate` parameters to the DSP engine on every note-on/note-off event.

#### Scenario: A4 frequency

- **WHEN** MIDI note 69 (A4) is triggered
- **THEN** freq parameter is set to exactly 440Hz

#### Scenario: Gate off on all keys released

- **WHEN** all keyboard keys are released
- **THEN** gate parameter is set to 0

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

### Requirement: Shared active-key state across input sources

The system SHALL maintain a single `activeKeys` set that tracks active notes regardless of whether they originate from QWERTY, pointer, or MIDI input. The gate parameter SHALL only be set to 0 when the `activeKeys` set becomes empty, regardless of which input source triggers the release.

#### Scenario: MIDI note held while QWERTY note released

- **WHEN** a MIDI note-on has been received for note A and a QWERTY note B is released
- **THEN** gate remains 1 because note A is still in `activeKeys`

#### Scenario: All sources released

- **WHEN** all active notes from all input sources are released
- **THEN** gate is set to 0

