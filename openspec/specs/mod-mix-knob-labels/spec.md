# mod-mix-knob-labels Specification

## Purpose
TBD - created by archiving change tweak-mod-mix-knob. Update Purpose after archive.
## Requirements
### Requirement: Arc endpoint labels identify modulation sources
The modulation mix knob SHALL display a text label at each end of its arc sweep to identify what the knob blends between. The label at the minimum end (pos=0, lower-left) SHALL read "LFO". The label at the maximum end (pos=1, lower-right) SHALL read "NOISE". Both labels SHALL be rendered inside the knob's SVG using the existing ticks mechanism and SHALL remain visible at the default knob body size.

#### Scenario: LFO label appears at arc minimum
- **WHEN** the modulation mix knob is rendered
- **THEN** the text "LFO" is visible near the lower-left end of the knob arc

#### Scenario: NOISE label appears at arc maximum
- **WHEN** the modulation mix knob is rendered
- **THEN** the text "NOISE" is visible near the lower-right end of the knob arc

