# SEM Filter

## Purpose

~~Replaced by `ladder-filter`.~~ This capability has been superseded by the Moog 24 dB/octave transistor ladder filter (`ladder-filter` capability). The SEM SVF (LP/BP/HP crossfade) is incompatible with the Moog Model D architecture which uses a single lowpass topology.

## Requirements

All requirements previously defined in this capability have been removed. See `ladder-filter` for filter requirements.

### Migration Notes

- The `filterMode` parameter is removed; cutoff and resonance parameter names are preserved in `ladder-filter`.
- Resonance now reaches self-oscillation near 1.0. Players should use master volume to manage loud self-oscillation.
- Filter envelope modulation is now specified in the `ladder-filter` capability with positive-only amount (0–10 000 Hz).
- The filter is always lowpass; no mode selector exists.
