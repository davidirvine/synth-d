## MODIFIED Requirements

### Requirement: SEM filter capability is retired

The `sem-filter` capability is retired. The SEM SVF (LP/BP/HP crossfade) is incompatible with the Moog Model D architecture and has been superseded by the 24 dB/octave transistor ladder filter; all filter behaviour is now defined by the `ladder-filter` capability, which SHALL be treated as authoritative. This spec is retained only as a tombstone that points to its replacement.

Migration notes:

- The `filterMode` parameter is removed; cutoff and resonance parameter names are preserved in `ladder-filter`.
- Resonance now reaches self-oscillation near 1.0; players should use master volume to manage loud self-oscillation.
- Filter-envelope modulation is specified in `ladder-filter` with positive-only amount (0–10 000 Hz).
- The filter is always lowpass; no mode selector exists.

#### Scenario: ladder-filter is authoritative for filter behaviour

- **WHEN** a contributor looks for filter behaviour previously defined by `sem-filter`
- **THEN** the behaviour is defined by the `ladder-filter` spec, and this `sem-filter` spec defines no active requirements of its own
