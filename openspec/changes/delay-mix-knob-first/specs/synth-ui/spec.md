## MODIFIED Requirements

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
- **THEN** the delay knob row contains only the mix, time, and feedback knobs (no toggle button)
- **AND** the reverb knob row contains only the mix, tone, decay, and pre-delay knobs (no toggle button)
