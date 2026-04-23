## ADDED Requirements

### Requirement: Tick labels match knob label colour
Tick labels rendered inside the knob SVG SHALL use the same colour as the knob label text (`#e8dcc8`), so that all text labels in a knob group are visually consistent.

#### Scenario: Tick labels are cream-coloured
- **WHEN** the filter mode knob renders its LP, BP, and HP tick labels
- **THEN** each tick label is displayed in colour `#e8dcc8`

#### Scenario: Tick label colour matches knob label colour
- **WHEN** comparing a tick label colour to the CUTOFF or RES knob label colour
- **THEN** both colours are identical (`#e8dcc8`)
