## MODIFIED Requirements

### Requirement: Panel layout with six sections

The system SHALL arrange controls in six labeled panels: Oscillator Bank, Mixer, Filter (combined with filter contour envelope), Output (combined volume and loudness contour), Modulation, and Glide. Filter and Output panels share a two-column grid row; Modulation and Glide appear below Filter in a second row. The keyboard SHALL appear below all panels spanning the full width. A header strip containing the synth title, MIDI status, and power button SHALL appear above the panels. The previously unused panel slot under Output SHALL host the oscilloscope panel.

#### Scenario: Panel arrangement

- **WHEN** the UI is rendered
- **THEN** panels appear with header above, then Oscillator Bank | Mixer | [Filter over Modulation+Glide] | [Output over Oscilloscope], keyboard below

#### Scenario: Responsive to window width

- **WHEN** browser window is at least 1200px wide
- **THEN** all panels are visible without horizontal scrolling
