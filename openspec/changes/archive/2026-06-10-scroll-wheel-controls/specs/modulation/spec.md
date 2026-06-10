## MODIFIED Requirements

### Requirement: Virtual mod wheel on-screen control
The wheels panel SHALL display a MOD wheel functioning as a virtual mod wheel. Its value SHALL be shown as a horizontal cursor line (not a fill) whose vertical position represents the value. Dragging upward increases modulation depth toward 1; dragging downward decreases it toward 0. As a real mod wheel, the MOD wheel SHALL rest at 0 (bottom, zero modulation) and SHALL HOLD whatever position it is left at — it SHALL NOT spring back. This hold applies to every input method (drag, scroll, and arrow keys): none of them trigger a spring-back release. The MOD wheel SHALL remain in sync with incoming MIDI CC 1 messages: when CC 1 is received, the cursor snaps to the matching position. The FAUST DSP `modWheel` hslider default SHALL be 0 so that the DSP and Svelte state agree at power-on (zero modulation) without requiring any user interaction.

#### Scenario: Dragging mod wheel increases modulation
- **WHEN** user drags the MOD wheel cursor upward
- **THEN** modulation depth increases and audible modulation deepens if routing is active

#### Scenario: Mod wheel rests at zero at power-on
- **WHEN** the synth starts with no saved state
- **THEN** the MOD wheel cursor is at 0 (bottom) and the DSP modWheel parameter is also 0, so no modulation is applied

#### Scenario: Mod wheel holds its position on release
- **WHEN** the user drags the MOD wheel to a position and releases it
- **THEN** the cursor stays at that position and the modulation depth holds — it does not spring back

#### Scenario: Mod wheel holds after arrow-key adjustment
- **WHEN** the user moves the MOD wheel with the arrow keys and releases them
- **THEN** the cursor holds at the new position and does not spring back

#### Scenario: MIDI CC 1 updates mod wheel position
- **WHEN** MIDI CC 1 message is received
- **THEN** the MOD wheel cursor moves to the position corresponding to the CC value (0–127 → 0–1) and holds there

#### Scenario: Mod wheel and CC 1 stay in sync
- **WHEN** user moves the MOD wheel and then a CC 1 message arrives
- **THEN** the cursor updates to the CC 1 value, overriding the prior manual position, and holds at the new value

## ADDED Requirements

### Requirement: Mouse scroll-wheel adjusts the mod wheel and holds

The MOD wheel SHALL respond to mouse `wheel` events while the pointer is over it (hover-to-scroll). Scrolling up SHALL increase modulation depth toward 1 and scrolling down SHALL decrease it toward 0, by a fixed increment per scroll event — the same `KEY_STEP` (0.05) the arrow keys use — in the direction of `Math.sign(deltaY)` (independent of `deltaY` magnitude), clamped to `[0, 1]`. Because the MOD wheel is a non-spring control, the scrolled-to value SHALL HOLD — the cursor does not return after scrolling. While a pointer drag is in progress the wheel handler SHALL ignore wheel events — the drag owns the cursor. An incoming MIDI CC 1 message (a position-set, not an increment) SHALL override the scrolled position as it does today, so scroll and CC 1 do not conflict. The handler SHALL call `preventDefault()` so the page does not scroll.

#### Scenario: Scroll up raises modulation depth and holds

- **WHEN** the pointer is over the MOD wheel and the user scrolls up
- **THEN** the modulation depth increases by one increment and the cursor stays at the new position

#### Scenario: Scroll down lowers modulation depth and holds

- **WHEN** the pointer is over the MOD wheel and the user scrolls down
- **THEN** the modulation depth decreases by one increment and the cursor stays at the new position

#### Scenario: Scroll increment is independent of deltaY magnitude

- **WHEN** scroll events of differing `deltaY` magnitude but the same sign arrive over the MOD wheel
- **THEN** each event moves the cursor by the same fixed increment

#### Scenario: Page does not scroll while adjusting the mod wheel

- **WHEN** the user scrolls with the pointer over the MOD wheel
- **THEN** the wheel event is consumed (default prevented) and the surrounding page does not scroll
