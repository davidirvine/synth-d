## ADDED Requirements

### Requirement: Cutoff modulation input smoothing

The modulation component of the cutoff sum (`filterModHz`) SHALL be passed through a one-pole IIR smoother with a time constant of approximately 5 ms before it enters `ve.moog_vcf`. This prevents audio-rate transients on the modulation path from destabilising the filter, which can manifest as pops or resonance runaway when OSC 3 or noise is used as a modulation source.

#### Scenario: Audio-rate modulation source does not cause filter instability

- **WHEN** OSC 3 is in audio-frequency mode, routed to filter modulation at non-zero depth, with resonance set above 0.7
- **THEN** the filter output remains stable with no audible pops or runaway resonance

#### Scenario: LFO-rate modulation is unaffected perceptibly

- **WHEN** OSC 3 is in LFO mode at 5 Hz, routed to filter modulation
- **THEN** the cutoff sweeps smoothly and the 5 ms smoother introduces no audible lag
