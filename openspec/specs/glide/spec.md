# Glide

## Purpose

Provides monophonic portamento (glide) for the synthesizer. When enabled, oscillator pitch slides exponentially from the previous note frequency to the target frequency over a configurable rate, enabling classic Moog-style legato glide effects.

## Requirements

### Requirement: Portamento with on/off toggle and rate knob
The system SHALL provide monophonic portamento (glide) with an on/off toggle switch and a rate knob spanning 0–5 seconds (logarithmic). When glide is off, frequency changes are instantaneous. When glide is on, frequency slides exponentially from the previous note frequency to the target frequency over the duration set by the rate knob.

#### Scenario: Glide off — instantaneous frequency change
- **WHEN** the glide toggle is off
- **THEN** pressing a new key causes the oscillator frequency to jump instantly to the target pitch

#### Scenario: Glide on — frequency slides between notes
- **WHEN** the glide toggle is on and a new key is pressed after a previous key
- **THEN** oscillator frequency slides exponentially from the previous pitch to the new pitch over the glide rate time

#### Scenario: Glide rate at minimum
- **WHEN** glide is on and rate is at minimum (near 0 s)
- **THEN** the slide is nearly instantaneous, audibly indistinguishable from no glide

#### Scenario: Glide rate at maximum
- **WHEN** glide is on and rate is at 5 s and a note is played
- **THEN** the frequency takes approximately 5 seconds to arrive at the target pitch

---

### Requirement: Glide applies to all three oscillators simultaneously
When glide is active, the same portamento time constant SHALL be applied to OSC 1, OSC 2, and OSC 3 (when not in LFO mode). All three oscillators slide together, preserving their relative detune relationships during the glide.

#### Scenario: Detuned oscillators glide together
- **WHEN** glide is on and OSC 2 is detuned from OSC 1
- **THEN** both oscillators slide to their respective target pitches simultaneously, maintaining the detune interval throughout the glide
