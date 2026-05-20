## MODIFIED Requirements

### Requirement: Virtual mod wheel on-screen control
The wheels panel SHALL display a MOD wheel functioning as a virtual mod wheel. Its value SHALL be shown as a horizontal cursor line (not a fill) whose vertical position represents the value. Dragging upward increases modulation depth toward 1; dragging downward decreases it toward 0. The MOD wheel SHALL rest at 0.5 (center) and SHALL spring back to 0.5 when released, with modulation depth following the cursor every animation frame so the return to center is audible. The MOD wheel SHALL remain in sync with incoming MIDI CC 1 messages: when CC 1 is received, the cursor snaps to match and any active spring-back is cancelled. The FAUST DSP `modWheel` hslider default SHALL also be 0.5 so that the DSP and Svelte state agree at power-on without requiring any user interaction.

#### Scenario: Dragging mod wheel increases modulation
- **WHEN** user drags the MOD wheel cursor upward
- **THEN** modulation depth increases and audible modulation deepens if routing is active

#### Scenario: Mod wheel rests at center at power-on
- **WHEN** the synth starts with no saved state
- **THEN** the MOD wheel cursor is at 0.5 and the DSP modWheel parameter is also 0.5

#### Scenario: Mod wheel springs back to center on release
- **WHEN** the user releases the MOD wheel away from center
- **THEN** the cursor springs back to 0.5 and the modulation depth follows it back to 0.5

#### Scenario: MIDI CC 1 updates mod wheel position
- **WHEN** MIDI CC 1 message is received
- **THEN** the MOD wheel cursor moves to the position corresponding to the CC value (0–127 → 0–1)

#### Scenario: Mod wheel and CC 1 stay in sync
- **WHEN** user moves the MOD wheel and then a CC 1 message arrives
- **THEN** the cursor updates to the CC 1 value, overriding the prior manual position and cancelling any active spring-back
