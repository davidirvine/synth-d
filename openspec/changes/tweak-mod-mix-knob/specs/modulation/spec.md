## MODIFIED Requirements

### Requirement: Modulation source mix between OSC 3 and noise
> **Note:** The panel label for the OSC 3 source at pos=0 is "LFO" (as specified in `mod-mix-knob-labels/spec.md`). This follows the original Minimoog panel design where the modulation oscillator (OSC 3) is labelled "LFO" in the modulation routing context.

The modulation section SHALL provide a mix knob that crossfades the modulation source signal between OSC 3 output (at 0) and noise (at 1). The noise used SHALL be the same type selected by the mixer noise-type control: white noise when noise type is 0, pink noise when noise type is 1. The resulting modulation signal is used by all active routing destinations.

The mix knob SHALL NOT display a numeric value label. The mix knob arc highlight SHALL span from the current indicator position to the 12 o'clock (top-center) position on the arc, communicating the offset from a neutral center-mix position.

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

#### Scenario: Value label is absent
- **WHEN** the modulation mix knob is rendered
- **THEN** no numeric value label is displayed below the knob

#### Scenario: Arc highlight at minimum mix
- **WHEN** mod mix is 0
- **THEN** the arc highlight spans from the lower-left indicator position to the 12 o'clock position

#### Scenario: Arc highlight at center mix
- **WHEN** mod mix is 0.5
- **THEN** no arc highlight is visible (indicator is at 12 o'clock)

#### Scenario: Arc highlight at maximum mix
- **WHEN** mod mix is 1
- **THEN** the arc highlight spans from the 12 o'clock position to the lower-right indicator position
