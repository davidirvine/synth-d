## ADDED Requirements

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
