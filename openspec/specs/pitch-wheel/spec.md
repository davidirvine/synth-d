# Pitch Wheel

## Purpose

Defines the on-screen PITCH wheel that bends the played note's frequency by up to ±2 semitones, reusing the MIDI pitch-bend signal path. The wheel rests at and springs back to center, stays in sync with incoming MIDI pitch-bend, and applies its bend transiently so no stale bend carries into the next note.

## Requirements

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

### Requirement: Mouse scroll-wheel bends the pitch wheel momentarily

The PITCH wheel SHALL respond to mouse `wheel` events while the pointer is over it (hover-to-scroll). Scrolling up SHALL move the cursor toward +2 semitones and scrolling down toward −2 semitones, by a fixed increment per scroll event — the same `KEY_STEP` (0.05) the arrow keys use — in the direction of `Math.sign(deltaY)` (independent of `deltaY` magnitude), clamped to `[0, 1]`. Because the PITCH wheel is spring-loaded, after the scroll-driven bend the cursor SHALL spring back toward centre (0.5) using the existing wheel spring physics, with the frequency bend following the cursor back to no bend — making scroll a momentary bend gesture rather than a held offset. When a scroll event arrives while a spring-back is already animating, the cursor SHALL be set to the scroll-adjusted position (the increment applied to the current animated cursor value) and the spring-back SHALL restart from there, so each scroll is a fresh bend rather than a compounded one. While a pointer drag is in progress the wheel handler SHALL ignore wheel events — the drag owns the cursor. The handler SHALL call `preventDefault()` so the page does not scroll.

#### Scenario: Scroll up bends pitch sharp then springs back

- **WHEN** the synth is powered and the user scrolls up with the pointer over the PITCH wheel while a note sounds
- **THEN** the note bends toward +2 semitones and the cursor then springs back to centre with the bend following it back to no bend

#### Scenario: Scroll down bends pitch flat then springs back

- **WHEN** the synth is powered and the user scrolls down over the PITCH wheel while a note sounds
- **THEN** the note bends toward −2 semitones and the cursor then springs back to centre

#### Scenario: Scroll increment is independent of deltaY magnitude

- **WHEN** scroll events of differing `deltaY` magnitude but the same sign arrive over the PITCH wheel
- **THEN** each event moves the cursor by the same fixed increment

#### Scenario: Scroll during spring-back restarts the spring from the new position

- **WHEN** the user scrolls the PITCH wheel while it is already springing back toward centre
- **THEN** the cursor jumps to the current animated position adjusted by one increment and the spring-back restarts from there (the bend is not compounded onto a stale target)

#### Scenario: Page does not scroll while bending the pitch wheel

- **WHEN** the user scrolls with the pointer over the PITCH wheel
- **THEN** the wheel event is consumed (default prevented) and the surrounding page does not scroll
