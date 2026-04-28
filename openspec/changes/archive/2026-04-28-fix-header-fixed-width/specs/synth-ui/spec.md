## MODIFIED Requirements

### Requirement: Header strip with power button above the panels

The system SHALL render a header strip above the control panels containing the synth name on the left, MIDI status in the middle, and the power button on the right. The header strip SHALL have a fixed, content-driven width that does not change when the browser window is resized. The header strip's left and right edges SHALL overhang the panel grid below it by equal amounts.

#### Scenario: Header layout

- **WHEN** the UI is rendered
- **THEN** a header strip is visible above all panels with the synth title on the left and the power button on the right

#### Scenario: Header does not resize with the window

- **WHEN** the browser window is resized to any width
- **THEN** the header strip width remains constant and does not stretch to fill the viewport

#### Scenario: Header overhangs are symmetric

- **WHEN** the UI is rendered
- **THEN** the distance from the left edge of the header to the left edge of the panel grid equals the distance from the right edge of the panel grid to the right edge of the header
