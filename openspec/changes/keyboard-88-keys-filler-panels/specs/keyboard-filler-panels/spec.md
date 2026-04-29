## ADDED Requirements

### Requirement: Panel row fills to keyboard width using RegisterPanel and EmptyPanel

The system SHALL insert a `RegisterPanel` component to the left of the control-panel grid and a plain `EmptyPanel` component to the right, so that the panel row total width matches the keyboard row width (~1 008 px). The `EmptyPanel` SHALL use the same background color (`#1c1c1c`), 1 px `#333` border, and padding as other panels. No interactive controls SHALL appear inside the `EmptyPanel`.

#### Scenario: Panel row width matches keyboard row width

- **WHEN** the UI is rendered
- **THEN** the combined width of the RegisterPanel, control-panel grid, and EmptyPanel equals the keyboard row width (36 white keys × 28 px = 1 008 px)

#### Scenario: EmptyPanel contains no interactive elements

- **WHEN** the EmptyPanel is rendered
- **THEN** no buttons, knobs, sliders, or other interactive controls are present inside it

#### Scenario: EmptyPanel has correct dark-theme styling

- **WHEN** the EmptyPanel is rendered
- **THEN** it has background `#1c1c1c` and a 1 px `#333` border matching other panels
