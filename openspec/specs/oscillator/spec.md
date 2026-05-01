# Oscillator

## Purpose

Provides the audio source for the subtractive synthesizer. Three independent oscillators each offer six waveforms generated simultaneously in the FAUST DSP graph and selected by index. Oscillator pitch is driven by keyboard input and can be transposed by octave. OSC 2 and OSC 3 support continuous detune.
## Requirements
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

### Requirement: Oscillator frequency is set by the keyboard
The system SHALL accept a `freq` parameter (Hz) that sets the pitch of all pitched oscillators. Frequency SHALL be computed as `mtof(midiNote)` from the pressed key.

#### Scenario: Frequency update on key press
- **WHEN** a keyboard key is pressed
- **THEN** the oscillator frequency is updated to the MIDI note frequency before the gate is triggered

#### Scenario: Frequency range
- **WHEN** any key across the 2-octave keyboard is pressed
- **THEN** the oscillator produces a frequency in the range of the mapped MIDI notes (C3–C5 or equivalent)

---

### Requirement: Per-oscillator octave range control
Each oscillator SHALL provide an integer octave range control (−2 to +2 octaves) that transposes that oscillator's output independently from the other oscillators.

#### Scenario: OSC 1 octave up
- **WHEN** OSC 1 octave is set to +1
- **THEN** OSC 1 produces a frequency double that of the base keyboard frequency

#### Scenario: OSC 2 octave independent of OSC 1
- **WHEN** OSC 1 octave is 0 and OSC 2 octave is −1
- **THEN** OSC 1 and OSC 2 produce frequencies one octave apart

---

### Requirement: OSC 2 and OSC 3 continuous detune
OSC 2 and OSC 3 SHALL each provide a continuous detune knob spanning −700 to +700 cents (bipolar, center = 0 cents), corresponding to ±7 semitones (a perfect fifth in either direction). The detune SHALL be applied as a frequency multiplier: `detunedFreq = baseFreq × pow(2, detuneCents / 1200)`. The knob SHALL use the `bipolar` prop so the arc extends from 12 o'clock in the direction of the current offset. The knob SHALL use a linear scale so the perceived knob travel is proportional to cent value across the full ±700¢ range; precision near unison is provided instead by the 5-cent default drag step (1-cent with Shift) and the numeric semitone readout. The knob's displayed label SHALL read `freq` (uppercase rendering as `FREQ`); the underlying parameter identifiers (`osc2Detune`, `osc3Detune`) and the FAUST hslider names SHALL remain unchanged. The knob's value label SHALL display the value in semitones with two decimal places (e.g. `−6.50 st`). The knob's drag step SHALL default to 5 cents, with a 1-cent fine step while the Shift key is held. The knob SHALL display a musical interval indicator above its value label per the `knob` capability's interval-indicator requirement; the indicator SHALL latch at minor-third (±300¢), major-third (±400¢), and perfect-fifth (±700¢) targets within a ±15¢ tolerance window, and SHALL be blank otherwise.

#### Scenario: Zero detune — oscillator in tune
- **WHEN** OSC 2 detune is 0 cents
- **THEN** OSC 2 produces exactly the same pitch as OSC 1 (given matching waveform and octave settings)
- **AND** the value label reads `0.00 st`
- **AND** the interval indicator slot is blank

#### Scenario: Positive detune raises pitch
- **WHEN** OSC 2 detune is +10 cents
- **THEN** OSC 2 frequency is slightly above OSC 1, producing a chorus/beating effect
- **AND** the value label reads `0.10 st`
- **AND** the interval indicator slot is blank

#### Scenario: Negative detune lowers pitch
- **WHEN** OSC 3 detune is −50 cents
- **THEN** OSC 3 frequency is a quarter-tone below the base keyboard frequency
- **AND** the value label reads `−0.50 st`
- **AND** the interval indicator slot is blank

#### Scenario: Knob spans full Minimoog frequency range
- **WHEN** the freq knob is dragged to its maximum
- **THEN** the value is +700 cents (a perfect fifth above unison)
- **AND** the value label reads `7.00 st`
- **AND** the interval indicator reads `P5`

#### Scenario: Major third up lights the indicator
- **WHEN** the freq knob value is +400 cents (within ±15¢ window)
- **THEN** the interval indicator reads `M3`
- **AND** the value label reads `4.00 st`

#### Scenario: Minor third down lights the indicator
- **WHEN** the freq knob value is −300 cents (within ±15¢ window)
- **THEN** the interval indicator reads `m3`
- **AND** the value label reads `−3.00 st`

#### Scenario: Drag step is 5 cents by default
- **WHEN** the user drags the freq knob from 0 cents through small increments without holding Shift
- **THEN** each discrete value transition is a multiple of 5 cents (e.g. 0 → 5 → 10)

#### Scenario: Shift drag gives 1-cent fine step
- **WHEN** the user holds Shift and drags the freq knob
- **THEN** each discrete value transition is a multiple of 1 cent (e.g. 397 → 398 → 399 → 400)
- **AND** while inside the ±15¢ M3 window the interval indicator reads `M3`

#### Scenario: Linear scale gives proportional travel across the range
- **WHEN** the freq knob is turned from center toward maximum
- **THEN** equal increments of knob travel produce equal increments of cent value (±700¢ ÷ half-sweep), so M3 (+400¢) and P5 (+700¢) are reached without disproportionate compression of the outer region

### Requirement: OSC 3 range and detune controls are disabled in LFO mode

When OSC 3 LFO mode is active, the range step buttons and the freq (detune) knob SHALL be rendered in a disabled state and SHALL NOT accept user input. The waveform selector SHALL remain enabled because waveform choice affects the shape of the LFO signal. While the freq knob is disabled, its interval indicator slot SHALL remain visually present but SHALL NOT update.

#### Scenario: Range buttons disabled in LFO mode

- **WHEN** OSC 3 LFO mode is on
- **THEN** the OSC 3 range `+` and `−` step buttons are disabled and do not respond to clicks

#### Scenario: Freq knob disabled in LFO mode

- **WHEN** OSC 3 LFO mode is on
- **THEN** the OSC 3 freq knob is in its disabled state and does not respond to drag or scroll input

#### Scenario: Controls re-enabled when LFO mode is turned off

- **WHEN** OSC 3 LFO mode is turned off
- **THEN** the OSC 3 range step buttons and freq knob become interactive again

#### Scenario: Waveform selector remains enabled in LFO mode

- **WHEN** OSC 3 LFO mode is on
- **THEN** all six waveform buttons for OSC 3 remain interactive and can be changed

