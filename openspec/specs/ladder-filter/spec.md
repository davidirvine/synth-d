# Ladder Filter

## Purpose

Provides a Moog 24 dB/octave transistor ladder lowpass filter for the synthesizer. The filter offers cutoff frequency control, resonance with self-oscillation, continuous keyboard tracking, and ADSR filter contour modulation with positive-only amount.

## Requirements

### Requirement: Moog 24 dB/octave transistor ladder lowpass filter
The system SHALL implement a 4-pole 24 dB/octave transistor ladder lowpass filter using `ve.moog_vcf` from the FAUST standard library. No highpass or bandpass output is available; the filter is lowpass only. Rolloff SHALL be 24 dB per octave above the cutoff frequency.

#### Scenario: Lowpass output only
- **WHEN** the filter is processing audio
- **THEN** frequencies above the cutoff are attenuated at 24 dB/octave and no HP or BP mode is available

#### Scenario: Filter passes all frequencies at maximum cutoff
- **WHEN** cutoff is set to 20 000 Hz
- **THEN** the filter passes the full audio spectrum with minimal attenuation

---

### Requirement: Cutoff frequency control
The filter SHALL accept a cutoff parameter spanning 20–20 000 Hz with logarithmic scaling.

#### Scenario: Cutoff at 1 000 Hz attenuates above 1 kHz
- **WHEN** cutoff is set to 1 000 Hz
- **THEN** frequencies above 1 kHz are progressively attenuated; frequencies below pass cleanly

#### Scenario: Cutoff sweep is logarithmically distributed
- **WHEN** the cutoff knob is at the midpoint of its travel
- **THEN** the cutoff frequency is approximately the geometric mean of 20 and 20 000 Hz (≈ 632 Hz)

---

### Requirement: Resonance control with self-oscillation
The filter SHALL accept a resonance parameter spanning 0–1 (linear). At values approaching 1.0 the filter SHALL self-oscillate, producing a sine tone at the cutoff frequency. No artificial cap on resonance is imposed.

#### Scenario: Low resonance produces gentle peak
- **WHEN** resonance is 0.3 and a signal passes through
- **THEN** a slight emphasis is audible at the cutoff frequency

#### Scenario: High resonance approaches self-oscillation
- **WHEN** resonance is set near 1.0
- **THEN** the filter produces a strong pitched tone at the cutoff frequency even with no input signal

---

### Requirement: Continuous keyboard tracking
The filter SHALL accept a keyboard tracking parameter (0–1, linear). When non-zero, a portion of the keyboard frequency offset from C4 (261.63 Hz) is added to the cutoff frequency before filtering, so higher notes open the filter proportionally.

#### Scenario: No keyboard tracking
- **WHEN** key track is 0
- **THEN** the filter cutoff is unaffected by which key is pressed

#### Scenario: Full keyboard tracking
- **WHEN** key track is 1.0 and a note one octave above C4 is played
- **THEN** the effective cutoff increases by the same ratio as the frequency increase (one octave up)

#### Scenario: Partial keyboard tracking
- **WHEN** key track is 0.5
- **THEN** the effective cutoff shifts by half the keyboard frequency offset from C4

---

### Requirement: ADSR filter contour with positive-only amount
The filter SHALL accept an ADSR envelope modulating the cutoff frequency. The contour amount parameter SHALL span 0–10 000 Hz (positive-only). At amount = 0 the filter cutoff is unaffected by the envelope. At maximum amount the envelope raises the cutoff by up to 10 000 Hz above the base cutoff at envelope peak.

#### Scenario: Zero contour amount
- **WHEN** filter envelope amount is 0
- **THEN** the filter cutoff follows only the base cutoff and key tracking; envelope has no effect

#### Scenario: Positive contour opens filter on key press
- **WHEN** filter envelope amount is greater than 0 and a key is pressed
- **THEN** the effective cutoff rises above the base cutoff during the attack phase and returns toward base cutoff during decay toward the sustain level

#### Scenario: Release returns cutoff to base
- **WHEN** a key is released with a non-zero filter envelope amount
- **THEN** the effective cutoff returns to the base cutoff value over the release time

---

### Requirement: Filter contour uses full ADSR shape
The filter contour envelope SHALL be a full ADSR envelope: attack, decay, sustain (normalised 0–1), and release. Sustain holds the envelope at a fraction of its peak while the gate is held; release occurs after gate-off.

#### Scenario: Sustain holds cutoff during key hold
- **WHEN** a key is held longer than attack + decay time
- **THEN** the filter cutoff remains at `baseCutoff + amount × sustainLevel` until the key is released

#### Scenario: Release on key-off
- **WHEN** a key is released
- **THEN** the filter envelope decays from its current level to zero over the release time, returning the cutoff to the base value

---

### Requirement: Cutoff modulation input smoothing

The modulation component of the cutoff sum (`filterModHz`) SHALL be passed through a one-pole IIR smoother with a time constant of approximately 5 ms before it enters `ve.moog_vcf`. This prevents audio-rate transients on the modulation path from destabilising the filter, which can manifest as pops or resonance runaway when OSC 3 or noise is used as a modulation source.

#### Scenario: Audio-rate modulation source does not cause filter instability

- **WHEN** OSC 3 is in audio-frequency mode, routed to filter modulation at non-zero depth, with resonance set above 0.7
- **THEN** the filter output remains stable with no audible pops or runaway resonance

#### Scenario: LFO-rate modulation is unaffected perceptibly

- **WHEN** OSC 3 is in LFO mode at 5 Hz, routed to filter modulation
- **THEN** the cutoff sweeps smoothly and the 5 ms smoother introduces no audible lag

---

### Requirement: Keyboard tracking toggle button self-labels in both states

The keyboard tracking toggle SHALL display the text "KEY TRACK" as its visible label in both the enabled and disabled states. No separate text label SHALL appear above or beside the toggle. The toggle SHALL be vertically aligned with the adjacent cutoff and resonance knobs — its top edge SHALL be level with the top of those knob SVG bodies. The `aria-pressed` attribute SHALL reflect the current state (`true` when tracking is on, `false` when off).

#### Scenario: Toggle displays KEY TRACK when tracking is off

- **WHEN** keyboard tracking is disabled
- **THEN** the toggle button text reads "KEY TRACK" and `aria-pressed` is `false`

#### Scenario: Toggle displays KEY TRACK when tracking is on

- **WHEN** keyboard tracking is enabled
- **THEN** the toggle button text reads "KEY TRACK" and `aria-pressed` is `true`

#### Scenario: No separate label above the toggle

- **WHEN** the filter panel is rendered
- **THEN** there is no standalone "Key Track" text element separate from the toggle button itself
