## MODIFIED Requirements

### Requirement: Three independent oscillators each with six waveforms
The system SHALL provide three independent oscillators (OSC 1, OSC 2, OSC 3). Each oscillator SHALL offer six waveforms generated simultaneously in the FAUST DSP graph and selected by index via `ba.selectn(6, waveIndex)`:
- 0: triangle
- 1: reverse sawtooth (`-os.sawtooth`)
- 2: sawtooth
- 3: square (50% duty)
- 4: wide pulse (`os.pulsetrain(f, 0.67)`)
- 5: narrow pulse (`os.pulsetrain(f, 0.1)`)

Noise is no longer an oscillator waveform; it is provided by the mixer as a separate source.

#### Scenario: Waveform selection per oscillator
- **WHEN** an oscillator waveform parameter is set to index 0–5
- **THEN** the corresponding waveform is used as that oscillator's output

#### Scenario: All three oscillators output simultaneously
- **WHEN** OSC 1, OSC 2, and OSC 3 are all active in the mixer
- **THEN** all three waveform outputs are available to be blended at the mixer stage

#### Scenario: Noise is not available as an oscillator waveform
- **WHEN** any oscillator waveform selector is cycled through all positions
- **THEN** no noise waveform is available; noise is sourced from the mixer independently

---

### Requirement: Per-oscillator octave range control
Each oscillator SHALL provide an integer octave range control (−2 to +2 octaves) that transposes that oscillator's output independently from the other oscillators.

#### Scenario: OSC 1 octave up
- **WHEN** OSC 1 octave is set to +1
- **THEN** OSC 1 produces a frequency double that of the base keyboard frequency

#### Scenario: OSC 2 octave independent of OSC 1
- **WHEN** OSC 1 octave is 0 and OSC 2 octave is −1
- **THEN** OSC 1 and OSC 2 produce frequencies one octave apart

## ADDED Requirements

### Requirement: OSC 2 and OSC 3 continuous detune
OSC 2 and OSC 3 SHALL each provide a continuous detune knob spanning −100 to +100 cents (bipolar, center = 0 cents). The detune is applied as a frequency multiplier: `detunedFreq = baseFreq × pow(2, detuneCents / 1200)`. The detune knob SHALL use the `bipolar` prop so the arc extends from 12 o'clock in the direction of the current offset.

#### Scenario: Zero detune — oscillator in tune
- **WHEN** OSC 2 detune is 0 cents
- **THEN** OSC 2 produces exactly the same pitch as OSC 1 (given matching waveform and octave settings)

#### Scenario: Positive detune raises pitch
- **WHEN** OSC 2 detune is +10 cents
- **THEN** OSC 2 frequency is slightly above OSC 1, producing a chorus/beating effect

#### Scenario: Negative detune lowers pitch
- **WHEN** OSC 3 detune is −50 cents
- **THEN** OSC 3 frequency is a quarter-tone below the base keyboard frequency
