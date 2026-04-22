## ADDED Requirements

### Requirement: 2-octave visual piano keyboard
The system SHALL render a 2-octave piano keyboard (25 keys, C to C) as interactive SVG or HTML elements. White and black keys SHALL be visually distinct and styled to the Moog dark aesthetic.

#### Scenario: Key count
- **WHEN** the keyboard is rendered
- **THEN** exactly 25 keys are shown: 15 white keys and 10 black keys spanning 2 octaves

#### Scenario: Active key highlight
- **WHEN** a key is pressed (mouse or QWERTY)
- **THEN** the key is highlighted in amber (#c87941) for the duration of the press

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

### Requirement: Monophonic retrigger behavior
The system SHALL be monophonic — only one note plays at a time. When a new key is pressed while another is held, the new note's frequency is set and gate is retriggered (0→1 transition) to restart both envelopes.

#### Scenario: New key while holding old
- **WHEN** key A is held and key B is pressed
- **THEN** frequency changes to key B's pitch and envelopes retrigger

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
