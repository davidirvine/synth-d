# Oscillator

## Purpose

Provides the audio source for the subtractive synthesizer. Five waveforms are generated simultaneously in the FAUST DSP graph and selected by index. Oscillator pitch is driven by keyboard input and can be transposed by octave.

## Requirements

### Requirement: Five waveform sources are available
The system SHALL provide five oscillator waveforms: sine, sawtooth, square, triangle, and noise. All five SHALL be generated simultaneously in the FAUST DSP graph; one is selected by index via `ba.selectn`.

#### Scenario: Waveform selection
- **WHEN** the waveform parameter is set to index 0–4
- **THEN** the corresponding waveform (sine=0, saw=1, square=2, triangle=3, noise=4) is passed to the filter

#### Scenario: Noise source
- **WHEN** waveform index 4 (noise) is selected
- **THEN** white noise is generated regardless of the current frequency parameter

---

### Requirement: Oscillator frequency is set by the keyboard
The system SHALL accept a `freq` parameter (Hz) that sets the pitch of all pitched oscillators (sine, saw, square, triangle). Frequency SHALL be computed as `mtof(midiNote)` from the pressed key.

#### Scenario: Frequency update on key press
- **WHEN** a keyboard key is pressed
- **THEN** the oscillator frequency is updated to the MIDI note frequency before the gate is triggered

#### Scenario: Frequency range
- **WHEN** any key across the 2-octave keyboard is pressed
- **THEN** the oscillator produces a frequency in the range of the mapped MIDI notes (C3–C5 or equivalent)

---

### Requirement: Octave transpose control
The system SHALL provide an octave transpose control (integer, range ±2 octaves) that shifts all keyboard-generated frequencies up or down by the selected number of octaves.

#### Scenario: Transpose up one octave
- **WHEN** octave is set to +1 and a key is pressed
- **THEN** the oscillator frequency is double that of the untransposed key frequency

#### Scenario: Transpose down one octave
- **WHEN** octave is set to -1 and a key is pressed
- **THEN** the oscillator frequency is half that of the untransposed key frequency
