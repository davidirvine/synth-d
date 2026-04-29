## MODIFIED Requirements

### Requirement: Panel layout with six sections

The system SHALL arrange controls in six labeled panels: Oscillator Bank, Mixer, Filter (combined with filter contour envelope), Output (combined volume and loudness contour), Modulation, and Glide. The three top-level panel columns (Oscillator Bank, Mixer, and the filter-output grid) SHALL be laid out as a fixed three-column CSS grid. All three columns SHALL share the same height. The keyboard SHALL appear below all panels spanning the full width. A footer row containing the GitHub icon link SHALL appear below the keyboard. A header strip containing the synth title, MIDI status, and power button SHALL appear above the panels. The outer spacing around the synth module area SHALL be `8px` on all sides, matching the `8px` gap between individual panels. The layout SHALL NOT reflow or wrap when the browser window is resized.

#### Scenario: Panel arrangement

- **WHEN** the UI is rendered
- **THEN** panels appear with header above, then three columns: Oscillator Bank | Mixer | filter-output-grid ([Filter/AmpEnv/Effects] over [Modulation+Glide/Scope]), keyboard below, footer row with GitHub icon below the keyboard

#### Scenario: All top-level columns the same height

- **WHEN** the UI is rendered
- **THEN** the Oscillator Bank, Mixer, and filter-output-grid columns all share the same bottom edge

#### Scenario: Outer spacing matches inter-panel gap

- **WHEN** the UI is rendered
- **THEN** the space between the edge of the viewport and the nearest panel edge is `8px`, equal to the gap between panels

#### Scenario: No reflow on resize

- **WHEN** the browser window is resized to any width
- **THEN** the three top-level panel columns remain in a single row and do not wrap or reorder
