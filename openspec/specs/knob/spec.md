# Knob

## Purpose

Provides a reusable SVG rotary knob Svelte component for all synthesizer parameter controls. The knob supports vertical drag interaction with logarithmic or linear value curves, shift-key fine mode, double-click reset, and a formatted value label display.

## Requirements

### Requirement: SVG rotary knob with drag control

The system SHALL provide a reusable Svelte `Knob` component rendered as SVG. The knob SHALL display a circular track arc and a line indicator showing the current value. Dragging vertically SHALL change the knob value: upward drag increases value, downward drag decreases.

#### Scenario: Drag increases value

- **WHEN** user drags upward on a knob
- **THEN** the knob value increases and the indicator rotates clockwise

#### Scenario: Drag decreases value

- **WHEN** user drags downward on a knob
- **THEN** the knob value decreases and the indicator rotates counter-clockwise

#### Scenario: Value clamped at limits

- **WHEN** drag would move value beyond min or max
- **THEN** value stops at the limit and indicator does not move past the endpoint

---

### Requirement: Per-parameter logarithmic or linear value curve

Each knob instance SHALL accept a `scale` prop (`"log"` or `"linear"`). Logarithmic knobs SHALL map normalized drag position to value as `value = min * (max/min)^pos`. Linear knobs SHALL map as `value = min + (max - min) * pos`.

#### Scenario: Log knob midpoint

- **WHEN** a logarithmic knob with min=20, max=20000 is at normalized position 0.5
- **THEN** displayed value is approximately 632Hz (geometric mean)

#### Scenario: Linear knob midpoint

- **WHEN** a linear knob with min=0, max=1 is at normalized position 0.5
- **THEN** displayed value is 0.5

---

### Requirement: Shift key fine mode

The system SHALL reduce drag sensitivity by 10× while the Shift key is held, enabling precise adjustments.

#### Scenario: Fine mode active

- **WHEN** user holds Shift and drags the knob
- **THEN** the same pixel distance produces 1/10th the value change compared to normal drag

---

### Requirement: Double-click reset to default

The system SHALL reset a knob to its default value when the user double-clicks it.

#### Scenario: Double-click resets

- **WHEN** user double-clicks a knob that has been adjusted away from default
- **THEN** knob snaps to its default value and the indicator moves to the default position

---

### Requirement: Value label display

Each knob SHALL display its current value below the SVG graphic with appropriate units (Hz, ms, %, etc.) as a formatted string.

#### Scenario: Frequency knob label

- **WHEN** cutoff knob is set to 1200Hz
- **THEN** label reads "1200 Hz" (or "1.2 kHz" above 1000Hz)

#### Scenario: Time knob label

- **WHEN** attack knob is set to 250ms
- **THEN** label reads "250 ms"

---

### Requirement: Tick labels match knob label colour

Tick labels rendered inside the knob SVG SHALL use the same colour as the knob label text (`#e8dcc8`), so that all text labels in a knob group are visually consistent.

#### Scenario: Tick labels are cream-coloured

- **WHEN** the filter mode knob renders its LP, BP, and HP tick labels
- **THEN** each tick label is displayed in colour `#e8dcc8`

#### Scenario: Tick label colour matches knob label colour

- **WHEN** comparing a tick label colour to the CUTOFF or RES knob label colour
- **THEN** both colours are identical (`#e8dcc8`)

---

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
