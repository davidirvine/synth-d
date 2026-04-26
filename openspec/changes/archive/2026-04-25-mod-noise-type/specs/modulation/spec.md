## MODIFIED Requirements

### Requirement: Modulation source mix between OSC 3 and noise
The modulation section SHALL provide a mix knob that crossfades the modulation source signal between OSC 3 output (at 0) and noise (at 1). The noise used SHALL be the same type selected by the mixer noise-type control: white noise when noise type is 0, pink noise when noise type is 1. The resulting modulation signal is used by all active routing destinations.

#### Scenario: Mix fully to OSC 3
- **WHEN** mod mix is 0
- **THEN** the modulation signal is OSC 3 output exclusively

#### Scenario: Mix fully to noise
- **WHEN** mod mix is 1
- **THEN** the modulation signal is noise exclusively

#### Scenario: Mid-mix blends both sources
- **WHEN** mod mix is 0.5
- **THEN** the modulation signal is an equal blend of OSC 3 and noise

#### Scenario: Noise type white — modulation uses white noise
- **WHEN** mixer noise type is set to white and mod mix is non-zero
- **THEN** the modulation noise component is white noise

#### Scenario: Noise type pink — modulation uses pink noise
- **WHEN** mixer noise type is set to pink and mod mix is non-zero
- **THEN** the modulation noise component is pink noise
