# SEM Filter

## Purpose

Provides a SEM-style (Steiner-Parker) 2-pole state variable filter for the subtractive synthesizer. The filter offers simultaneous LP, BP, and HP outputs with continuous crossfade, envelope-modulated cutoff, and resonance control that does not self-oscillate.

## Requirements

### Requirement: SEM-style 2-pole state variable filter
The system SHALL implement a 2-pole state variable filter using `fi.svf` from the FAUST stdlib, providing 12dB/octave rolloff. The filter SHALL simultaneously produce LP, BP, and HP outputs which are crossfaded by the mode parameter.

#### Scenario: Lowpass at mode 0
- **WHEN** mode parameter is 0
- **THEN** output is pure lowpass (LP gain=1, BP gain=0, HP gain=0)

#### Scenario: Bandpass at mode 1
- **WHEN** mode parameter is 1
- **THEN** output is pure bandpass (LP gain=0, BP gain=1, HP gain=0)

#### Scenario: Highpass at mode 2
- **WHEN** mode parameter is 2
- **THEN** output is pure highpass (LP gain=0, BP gain=0, HP gain=1)

---

### Requirement: Continuous LP/BP/HP crossfade
The system SHALL crossfade smoothly between filter modes as the mode parameter moves continuously from 0 to 2, using triangular gain curves:
- `lpGain = max(0, 1 - mode)`
- `bpGain = max(0, 1 - |mode - 1|)`
- `hpGain = max(0, mode - 1)`

#### Scenario: LP-to-BP crossfade
- **WHEN** mode moves from 0 to 1
- **THEN** LP gain decreases linearly from 1 to 0 while BP gain increases from 0 to 1, with no click or discontinuity

#### Scenario: BP-to-HP crossfade
- **WHEN** mode moves from 1 to 2
- **THEN** BP gain decreases linearly from 1 to 0 while HP gain increases from 0 to 1, with no click or discontinuity

---

### Requirement: Cutoff frequency control
The system SHALL provide a cutoff frequency parameter in the range 20Hz–20,000Hz. The cutoff SHALL be modulated by the filter envelope output: `cutoffActual = cutoff + filterEnv * filterEnvAmount`.

#### Scenario: Cutoff at minimum
- **WHEN** cutoff is set to 20Hz and envelope amount is 0
- **THEN** filter passes only frequencies near 20Hz (nearly silent for most waveforms)

#### Scenario: Envelope modulation of cutoff
- **WHEN** filter envelope fires with a positive envelope amount
- **THEN** effective cutoff rises above the base cutoff value, then returns as the envelope decays

#### Scenario: Modulated cutoff clamped to valid range
- **WHEN** envelope modulation would push cutoff above 20,000Hz
- **THEN** effective cutoff is clamped to 20,000Hz

---

### Requirement: Resonance control
The system SHALL provide a resonance (Q) parameter in the range 0–1. The filter SHALL not self-oscillate at maximum resonance (SEM filter characteristic).

#### Scenario: Zero resonance
- **WHEN** resonance is set to 0
- **THEN** filter has no resonant peak at the cutoff frequency

#### Scenario: Maximum resonance
- **WHEN** resonance is set to 1
- **THEN** filter has a pronounced but stable resonant peak; no runaway self-oscillation occurs
