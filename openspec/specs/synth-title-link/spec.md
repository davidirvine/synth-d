# Synth Title Link

## Purpose

Defines the SYNTH-D header title being rendered as a hyperlink to the project's GitHub repository, without changing its visual appearance.

## Requirements

### Requirement: SYNTH-D title is a hyperlink to the GitHub repository
The SYNTH-D header label SHALL be rendered as an anchor element (`<a>`) that opens `https://github.com/davidirvine/synth-d` in a new browser tab when clicked. The visual appearance (font, color, weight, letter-spacing) SHALL be identical to the current plain title.

#### Scenario: User clicks SYNTH-D title
- **WHEN** the user clicks the SYNTH-D label in the header
- **THEN** the browser opens `https://github.com/davidirvine/synth-d` in a new tab without navigating away from the synth

#### Scenario: Title appearance is unchanged
- **WHEN** the page loads
- **THEN** the SYNTH-D label looks identical to the previous plain text title (same font, size, color, letter-spacing, no default underline)
