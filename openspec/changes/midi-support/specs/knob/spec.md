# Knob (delta)

## ADDED Requirements

### Requirement: External value update from MIDI CC
The knob SHALL accept an `externalValue` prop. When `externalValue` changes, the knob SHALL snap to that value without affecting pointer drag state (i.e., an in-progress drag is not interrupted, but the next drag starts from the new value).

#### Scenario: CC drives knob position
- **WHEN** a MIDI CC message is received for a mapped parameter and `externalValue` is updated
- **THEN** the knob indicator moves to reflect the new value and the `onchange` callback fires with the scaled value

#### Scenario: Drag not interrupted by CC
- **WHEN** a pointer drag is in progress and a CC message arrives
- **THEN** the ongoing drag continues to control the knob; the CC value is applied after the drag ends

---

### Requirement: MIDI learn mode visual state
The knob SHALL accept a `learningMidi` boolean prop. When `true`, the knob SHALL display a pulsing amber highlight ring around its SVG track to indicate it is awaiting a CC assignment.

#### Scenario: Learn mode highlight shown
- **WHEN** `learningMidi` is `true`
- **THEN** a pulsing amber ring is visible around the knob track

#### Scenario: Learn mode highlight removed
- **WHEN** `learningMidi` changes from `true` to `false`
- **THEN** the pulsing ring is removed and the knob returns to its normal appearance

---

### Requirement: Assigned CC number label
When a knob has a registered MIDI CC mapping, it SHALL display the assigned CC number as a small label (e.g., "CC 74") beneath the value label, styled in a subdued colour so it does not compete with the parameter value.

#### Scenario: CC label shown when mapped
- **WHEN** a knob has a CC mapping (e.g., CC 74)
- **THEN** "CC 74" is displayed beneath the value label in a muted colour

#### Scenario: CC label hidden when no mapping
- **WHEN** a knob has no CC mapping
- **THEN** no CC label is shown
