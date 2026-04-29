## ADDED Requirements

### Requirement: Keyboard row with WheelPanel and RegisterPanel

The system SHALL render a `WheelPanel` component to the left of the keyboard and a `RegisterPanel` component to the right, both inside the `.keyboard-row` flex row. Both components SHALL use `flex: 1` so they fill the space flanking the 1 008 px keyboard SVG. Both SHALL use the same background color (`#1c1c1c`), 1 px `#333` border, and padding as other panels.

#### Scenario: Keyboard row contains WheelPanel, Keyboard, RegisterPanel

- **WHEN** the UI is rendered
- **THEN** the keyboard row contains WheelPanel on the left, the 61-key keyboard in the center, and RegisterPanel on the right

#### Scenario: WheelPanel has correct dark-theme styling

- **WHEN** the WheelPanel is rendered
- **THEN** it has background `#1c1c1c` and a 1 px `#333` border matching other panels

#### Scenario: WheelPanel slider is draggable

- **WHEN** the user drags the WheelPanel slider
- **THEN** a `modWheel` parameter change is emitted and the fill height updates accordingly
