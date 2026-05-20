## MODIFIED Requirements

### Requirement: Filter contour controls (within Filter panel)

The Filter panel's lower section SHALL contain the filter contour envelope: four knobs — attack, decay, sustain, release — and a bipolar amount knob (−10 000 … +10 000 Hz, default 0), grouped under a "filter contour" sub-label. The amount knob SHALL render in bipolar mode (centre detent at 0, arc filling from centre outward) using a linear taper, matching the bipolar-knob idiom used by the oscillator detune knobs. The knob's reserved value-display width SHALL accommodate a negative reading (e.g. `-10.0 kHz`) without layout shift.

#### Scenario: Filter contour has five knobs

- **WHEN** the filter panel is rendered
- **THEN** attack, decay, sustain, release, and amount knobs are all visible below the filter contour sub-label

#### Scenario: Amount knob is bipolar and centred at zero

- **WHEN** the amount knob is at its default value (0)
- **THEN** the knob indicator points to centre and the arc shows no fill; turning it clockwise shows a positive Hz reading and counter-clockwise shows a negative Hz reading

#### Scenario: Negative amount reading does not shift layout

- **WHEN** the amount knob displays a negative value such as `-10.0 kHz`
- **THEN** the value display fits within the reserved width and adjacent knobs do not shift position
