## ADDED Requirements

### Requirement: Arc suppression via showArc prop

The `Knob` component SHALL accept a `showArc` boolean prop (default `true`). When `false`, the colored active arc SHALL NOT be rendered. The grey background track arc SHALL remain visible regardless of `showArc`.

#### Scenario: Arc hidden when showArc is false

- **WHEN** a `Knob` is rendered with `showArc={false}`
- **THEN** no colored arc element is present in the SVG output

#### Scenario: Track visible when showArc is false

- **WHEN** a `Knob` is rendered with `showArc={false}`
- **THEN** the grey track arc is still rendered at full sweep

#### Scenario: Arc shown by default

- **WHEN** a `Knob` is rendered without a `showArc` prop
- **THEN** the colored active arc is present in the SVG output

---

### Requirement: Bipolar arc from sweep center via bipolar prop

The `Knob` component SHALL accept a `bipolar` boolean prop (default `false`). When `true`, the active arc SHALL be drawn from the 12 o'clock position (the midpoint of the total sweep) to the current indicator position, rather than from the sweep start. For values above the midpoint the arc SHALL extend clockwise; for values below the midpoint the arc SHALL extend counter-clockwise; at exactly the midpoint no arc SHALL be drawn.

#### Scenario: Positive bipolar value arcs clockwise from center

- **WHEN** a `Knob` with `bipolar={true}` has a normalized position greater than 0.5
- **THEN** the arc extends clockwise from 12 o'clock to the indicator position

#### Scenario: Negative bipolar value arcs counter-clockwise from center

- **WHEN** a `Knob` with `bipolar={true}` has a normalized position less than 0.5
- **THEN** the arc extends counter-clockwise from 12 o'clock to the indicator position

#### Scenario: Zero bipolar value renders no arc

- **WHEN** a `Knob` with `bipolar={true}` has a normalized position of exactly 0.5
- **THEN** no arc is drawn

#### Scenario: Non-bipolar knob arc unaffected

- **WHEN** a `Knob` is rendered without `bipolar` prop (or with `bipolar={false}`)
- **THEN** the arc sweeps from the 7 o'clock start position to the indicator as before
