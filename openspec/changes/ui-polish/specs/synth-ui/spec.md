## ADDED Requirements

### Requirement: Key Track is a binary on/off switch

The Filter panel SHALL provide a "Key Track" on/off toggle switch in place of the previous continuous `key trk` knob. When the switch is off it SHALL emit `keyTrack: 0.0`; when on it SHALL emit `keyTrack: 1.0`. The default state SHALL be off.

#### Scenario: Key Track off by default

- **WHEN** the UI is first rendered
- **THEN** the Key Track switch is in the off state and the `keyTrack` parameter value is `0.0`

#### Scenario: Key Track toggled on

- **WHEN** the user activates the Key Track switch
- **THEN** the switch enters the on state and emits `keyTrack: 1.0`

#### Scenario: Key Track toggled off

- **WHEN** the user deactivates the Key Track switch
- **THEN** the switch enters the off state and emits `keyTrack: 0.0`

---

### Requirement: All on/off toggle switches use the active green color

The on/off toggle switches for Key Track, Glide, Delay, and Reverb SHALL each display with `color: #20b040` and `border-color: #20b040` when in the active (on) state. This matches the power button's active stroke color and establishes a consistent visual language for active binary controls.

#### Scenario: Toggle switch active appearance

- **WHEN** any on/off toggle switch (Key Track, Glide, Delay, or Reverb) is in the on state
- **THEN** the switch text and border are rendered in `#20b040`

#### Scenario: Toggle switch inactive appearance

- **WHEN** any on/off toggle switch is in the off state
- **THEN** the switch does not display the green active color

---

### Requirement: Product name is SYNTH-D

The header strip title SHALL read "SYNTH-D". The browser window `<title>` element SHALL also read "SYNTH-D".

#### Scenario: Header title text

- **WHEN** the UI is rendered
- **THEN** the header title text reads "SYNTH-D"

#### Scenario: Browser window title

- **WHEN** the application loads
- **THEN** the browser tab title reads "SYNTH-D"

---

## MODIFIED Requirements

### Requirement: Panel layout with six sections

The system SHALL arrange controls in six labeled panels: Oscillator Bank, Mixer, Filter (combined with filter contour envelope), Output (combined volume and loudness contour), Modulation, and Glide. The three top-level panel columns (Oscillator Bank, Mixer, and the filter-output grid) SHALL be laid out as a fixed three-column CSS grid. All three columns SHALL share the same height. The keyboard SHALL appear below all panels spanning the full width. A header strip containing the synth title, MIDI status, and power button SHALL appear above the panels. The outer spacing around the synth module area SHALL be `8px` on all sides, matching the `8px` gap between individual panels. The layout SHALL NOT reflow or wrap when the browser window is resized.

#### Scenario: Panel arrangement

- **WHEN** the UI is rendered
- **THEN** panels appear with header above, then three columns: Oscillator Bank | Mixer | filter-output-grid ([Filter/AmpEnv/Effects] over [Modulation+Glide/Scope]), keyboard below

#### Scenario: All top-level columns the same height

- **WHEN** the UI is rendered
- **THEN** the Oscillator Bank, Mixer, and filter-output-grid columns all share the same bottom edge

#### Scenario: Outer spacing matches inter-panel gap

- **WHEN** the UI is rendered
- **THEN** the space between the edge of the viewport and the nearest panel edge is `8px`, equal to the gap between panels

#### Scenario: No reflow on resize

- **WHEN** the browser window is resized to any width
- **THEN** the three top-level panel columns remain in a single row and do not wrap or reorder

---

### Requirement: Delay and reverb toggle buttons are co-located with section labels

In the Effects panel, each section's on/off toggle button SHALL appear on the same row as its section label ("DELAY" or "REVERB"). The knob row for each section SHALL contain only knobs.

#### Scenario: Delay toggle button row

- **WHEN** the Effects panel is rendered
- **THEN** the "DELAY" label and the delay on/off button appear on the same horizontal row

#### Scenario: Reverb toggle button row

- **WHEN** the Effects panel is rendered
- **THEN** the "REVERB" label and the reverb on/off button appear on the same horizontal row

#### Scenario: Knob rows contain only knobs

- **WHEN** the Effects panel is rendered
- **THEN** the delay knob row contains only the time, feedback, and mix knobs (no toggle button)
- **AND** the reverb knob row contains only the mix, decay, and tone knobs (no toggle button)
