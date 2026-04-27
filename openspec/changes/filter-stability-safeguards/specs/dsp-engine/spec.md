## ADDED Requirements

### Requirement: setParam rejects non-finite values

The `setParam` function in the audio engine SHALL validate that the `value` argument is a finite number before forwarding it to the DSP node. If `value` is `NaN`, `Infinity`, or `-Infinity`, the call SHALL be silently discarded and the DSP node SHALL NOT be called. This provides a system-boundary guard against corrupt or unexpected values reaching the FAUST DSP regardless of their origin (MIDI scaling, corrupt localStorage, programming errors in future code).

#### Scenario: Finite value is forwarded normally

- **WHEN** `setParam` is called with a finite numeric value
- **THEN** `node.setParamValue` is called with that value and the DSP parameter is updated

#### Scenario: NaN value is silently discarded

- **WHEN** `setParam` is called with `NaN` as the value
- **THEN** `node.setParamValue` is NOT called and no error is thrown

#### Scenario: Infinity value is silently discarded

- **WHEN** `setParam` is called with `Infinity` or `-Infinity` as the value
- **THEN** `node.setParamValue` is NOT called and no error is thrown

#### Scenario: Guard does not affect normal parameter flow

- **WHEN** knob interactions, MIDI CC messages, and note events produce parameter values
- **THEN** all values pass the `isFinite` check and reach the DSP without observable delay or change
