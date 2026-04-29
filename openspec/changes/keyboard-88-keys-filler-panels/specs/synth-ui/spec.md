## MODIFIED Requirements

### Requirement: Panel layout with six sections

The system SHALL arrange controls in six labeled panels: Oscillator Bank, Mixer, Filter (combined with filter contour envelope), Output (combined volume and loudness contour), Modulation, and Glide. The three top-level panel columns (Oscillator Bank, Mixer, and the filter-output grid) SHALL be laid out as a fixed three-column CSS grid. All three columns SHALL share the same height. The keyboard SHALL appear below all panels spanning its full computed width (~1 008 px for 61 keys). A `RegisterPanel` ("KEYBOARD RANGE") SHALL be placed to the left of the three-column panel grid and a plain `EmptyPanel` to the right, so the panel row fills to the keyboard row width. A header strip containing the synth title, MIDI status, and power button SHALL appear above the panels. The outer spacing around the synth module area SHALL be `8px` on all sides, matching the `8px` gap between individual panels. The layout SHALL NOT reflow or wrap when the browser window is resized.

#### Scenario: Panel arrangement

- **WHEN** the UI is rendered
- **THEN** panels appear in order: header above, then [RegisterPanel | Oscillator Bank | Mixer | filter-output-grid | EmptyPanel], keyboard below

#### Scenario: Panel row width matches keyboard row width

- **WHEN** the UI is rendered
- **THEN** the combined width of the RegisterPanel, panel grid, and EmptyPanel equals the keyboard row width

#### Scenario: All top-level columns the same height

- **WHEN** the UI is rendered
- **THEN** the Oscillator Bank, Mixer, and filter-output-grid columns all share the same bottom edge

#### Scenario: Outer spacing matches inter-panel gap

- **WHEN** the UI is rendered
- **THEN** the space between the edge of the viewport and the nearest panel edge is `8px`, equal to the gap between panels

#### Scenario: No reflow on resize

- **WHEN** the browser window is resized to any width
- **THEN** the three top-level panel columns remain in a single row and do not wrap or reorder

#### Scenario: Minimum layout width is 1 008 px

- **WHEN** the UI is rendered
- **THEN** the keyboard row width is at least 1 008 px (36 white keys × 28 px) and the layout does not reflow or wrap below this width
