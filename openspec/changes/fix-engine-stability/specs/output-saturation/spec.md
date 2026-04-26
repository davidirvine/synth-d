## ADDED Requirements

### Requirement: Output stage soft saturation driven by master volume
The master volume control SHALL drive a soft saturator such that at 60% master volume the signal passes through cleanly (no saturation), and above 60% the signal is progressively soft-clipped via `ma.tanh`. At 100% master volume the drive into the saturator SHALL be approximately 1.67× unity, producing noticeable harmonic saturation. Output level SHALL plateau as the saturator limits peaks, replicating the behaviour of a pushed analog output stage.

#### Scenario: Below 60% master vol — no saturation
- **WHEN** master volume is at or below 0.6
- **THEN** the output signal is clean with no soft clipping applied

#### Scenario: Above 60% master vol — progressive saturation
- **WHEN** master volume is above 0.6
- **THEN** peaks in the output signal are progressively soft-clipped, adding harmonic content

#### Scenario: At 100% master vol — maximum saturation
- **WHEN** master volume is at 1.0
- **THEN** the output drive is 1.67× and the signal is noticeably saturated, with output level lower than a linear extrapolation would predict

#### Scenario: Saturation is always applied post-VCA
- **WHEN** any master volume setting is used
- **THEN** saturation occurs after the VCA envelope, preserving the amplitude shape of the envelope
