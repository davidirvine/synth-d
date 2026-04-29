## ADDED Requirements

### Requirement: GitHub icon is a hyperlink to the repository

A GitHub mark icon SHALL be rendered as an anchor element (`<a>`) that opens `https://github.com/davidirvine/synth-d` in a new browser tab when clicked. The icon SHALL use the official GitHub invertocat SVG mark rendered inline. The icon SHALL NOT have a visible text label.

#### Scenario: User clicks the GitHub icon

- **WHEN** the user clicks the GitHub icon below the keyboard
- **THEN** the browser opens `https://github.com/davidirvine/synth-d` in a new tab without navigating away from the synth

#### Scenario: Icon has no text label

- **WHEN** the UI is rendered
- **THEN** no text label is visible adjacent to the GitHub icon

### Requirement: GitHub icon is positioned below the keyboard, left-aligned with the Oscillator Bank panel

The GitHub icon SHALL be placed in a footer row below the keyboard. The icon's left edge SHALL be horizontally aligned with the left edge of the Oscillator Bank panel.

#### Scenario: Icon placement below keyboard

- **WHEN** the UI is rendered
- **THEN** the GitHub icon appears below the keyboard row and above no other synth UI elements

#### Scenario: Icon left-aligns with Oscillator Bank

- **WHEN** the UI is rendered
- **THEN** the GitHub icon's left edge is flush with the left edge of the Oscillator Bank panel

### Requirement: GitHub icon visual appearance matches the synth aesthetic

The icon SHALL be 16 × 16 px. The icon fill color SHALL be a muted gray (`#555`) at rest. On pointer hover the icon fill SHALL transition to `#888`. There SHALL be no underline or outline on the anchor element.

#### Scenario: Icon color at rest

- **WHEN** the page loads and no pointer is over the icon
- **THEN** the icon is rendered in muted gray (`#555`)

#### Scenario: Icon color on hover

- **WHEN** the user moves the pointer over the GitHub icon
- **THEN** the icon fill transitions to `#888`

#### Scenario: No underline or outline

- **WHEN** the page loads
- **THEN** the anchor wrapping the icon has no text underline and no visible focus outline in its default state
