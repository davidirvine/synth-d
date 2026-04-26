## ADDED Requirements

### Requirement: Engine exposes pre-filter mixer peak level
The audio engine SHALL export a `getMixerPeak()` function that returns the current pre-filter mixer output peak as a linear value in the range 0–4. When the engine is powered off (node is null) the function SHALL return 0. The value is sourced from a FAUST `vbargraph` parameter computed inside the DSP before the `ma.tanh` soft clipper.

#### Scenario: getMixerPeak returns 0 when powered off
- **WHEN** `getMixerPeak()` is called while the engine is off
- **THEN** it returns 0 without error

#### Scenario: getMixerPeak returns a positive value during audio playback
- **WHEN** a note is playing with at least one oscillator level above zero
- **THEN** `getMixerPeak()` returns a positive value greater than 0
