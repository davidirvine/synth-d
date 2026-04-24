## REMOVED Requirements

### Requirement: SEM-style 2-pole state variable filter
**Reason**: Replaced by the Moog 24 dB/octave transistor ladder filter (`ladder-filter` capability). The SEM SVF (LP/BP/HP crossfade) is incompatible with the Moog Model D architecture which uses a single lowpass topology.
**Migration**: Use `ladder-filter` for all filter requirements. The `filterMode` parameter is removed; cutoff and resonance parameter names are preserved.

### Requirement: Resonance without self-oscillation
**Reason**: The ladder filter self-oscillates at high resonance by design; capping resonance is contrary to the Model D character.
**Migration**: Resonance now reaches self-oscillation near 1.0. Players should use master volume to manage loud self-oscillation.

### Requirement: Envelope-modulated cutoff
**Reason**: Envelope modulation is now specified in the `ladder-filter` capability with positive-only amount.
**Migration**: See `ladder-filter` spec — filter contour amount is 0–10 000 Hz (positive only).

### Requirement: Filter mode crossfade (LP/BP/HP)
**Reason**: The Moog Model D has a single lowpass topology; no mode selector exists.
**Migration**: Remove `filterMode` parameter. The filter is always lowpass.
