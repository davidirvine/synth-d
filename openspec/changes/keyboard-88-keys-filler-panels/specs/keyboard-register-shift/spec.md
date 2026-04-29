## ADDED Requirements

### Requirement: KEYBOARD RANGE panel with register jump buttons

The system SHALL render a "KEYBOARD RANGE" panel to the left of the control-panel grid. The panel SHALL contain a label reading "KEYBOARD RANGE" and two buttons — "Oct ▼" and "Oct ▲" — that jump the 61-key keyboard view to the bottom or top of the 88-key range in a single click. The panel SHALL use the same background color (`#1c1c1c`), 1 px `#333` border, and padding as other synth panels.

#### Scenario: Panel label visible

- **WHEN** the KEYBOARD RANGE panel is rendered
- **THEN** the text "KEYBOARD RANGE" is visible in cream (`#e8dcc8`), uppercase, 10 px monospace

#### Scenario: Oct ▼ jumps to bottom of 88-key range

- **WHEN** the user clicks "Oct ▼"
- **THEN** the keyboard `baseMidi` is set to 21 and the keyboard immediately shows A0–A5 (MIDI 21–81)

#### Scenario: Oct ▲ jumps to top of 88-key range

- **WHEN** the user clicks "Oct ▲"
- **THEN** the keyboard `baseMidi` is set to 48 and the keyboard immediately shows C3–C8 (MIDI 48–108)

#### Scenario: Active button is highlighted

- **WHEN** the keyboard is at the bottom register (baseMidi = 21)
- **THEN** the "Oct ▼" button is styled with amber background (`#3a2a1a`) and amber text (`#c87941`)

#### Scenario: Active button at top register

- **WHEN** the keyboard is at the top register (baseMidi = 48)
- **THEN** the "Oct ▲" button is styled with amber background (`#3a2a1a`) and amber text (`#c87941`)

#### Scenario: Neither button highlighted at default register

- **WHEN** the keyboard is at the default register (baseMidi = 36)
- **THEN** neither button is styled with the amber active state

#### Scenario: Pressing active button is a no-op

- **WHEN** the keyboard is already at the bottom register and "Oct ▼" is clicked
- **THEN** `baseMidi` remains 21 and no re-render occurs
