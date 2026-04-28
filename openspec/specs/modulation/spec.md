# Modulation

## Purpose

Provides the modulation section for the synthesizer, enabling LFO-style modulation routed to oscillator pitch and filter cutoff. The modulation source crossfades between OSC 3 output and white noise, with depth controlled by a virtual mod wheel that also responds to MIDI CC 1.

## Requirements

### Requirement: Modulation source mix between OSC 3 and noise
The modulation section SHALL provide a mix knob that crossfades the modulation source signal between OSC 3 output (at 0) and noise (at 1). The noise used SHALL be the same type selected by the mixer noise-type control: white noise when noise type is 0, pink noise when noise type is 1. The resulting modulation signal is used by all active routing destinations.

The mix knob SHALL NOT display a numeric value label. The mix knob arc highlight SHALL span from the current indicator position to the 12 o'clock (top-center) position on the arc, communicating the offset from a neutral center-mix position.

#### Scenario: Mix fully to OSC 3
- **WHEN** mod mix is 0
- **THEN** the modulation signal is OSC 3 output exclusively

#### Scenario: Mix fully to noise
- **WHEN** mod mix is 1
- **THEN** the modulation signal is noise exclusively

#### Scenario: Mid-mix blends both sources
- **WHEN** mod mix is 0.5
- **THEN** the modulation signal is an equal blend of OSC 3 and noise

#### Scenario: Noise type white — modulation uses white noise
- **WHEN** mixer noise type is set to white and mod mix is non-zero
- **THEN** the modulation noise component is white noise

#### Scenario: Noise type pink — modulation uses pink noise
- **WHEN** mixer noise type is set to pink and mod mix is non-zero
- **THEN** the modulation noise component is pink noise

#### Scenario: Value label is absent
- **WHEN** the modulation mix knob is rendered
- **THEN** no numeric value label is displayed below the knob

#### Scenario: Arc highlight at minimum mix
- **WHEN** mod mix is 0
- **THEN** the arc highlight spans from the lower-left indicator position to the 12 o'clock position

#### Scenario: Arc highlight at center mix
- **WHEN** mod mix is 0.5
- **THEN** no arc highlight is visible (indicator is at 12 o'clock)

#### Scenario: Arc highlight at maximum mix
- **WHEN** mod mix is 1
- **THEN** the arc highlight spans from the 12 o'clock position to the lower-right indicator position

---

### Requirement: Three independent routing switches
The modulation section SHALL provide three independent boolean routing switches. Each routes the modulation signal (scaled by the mod wheel) to its destination when on:
- **OSC 1 pitch**: modulates OSC 1 frequency as ±2 semitones at full mod wheel
- **OSC 2 pitch**: modulates OSC 2 frequency as ±2 semitones at full mod wheel
- **Filter cutoff**: modulates filter cutoff additively in Hz

Each switch SHALL operate independently; any combination of on/off is valid.

#### Scenario: All switches off — no modulation
- **WHEN** all three routing switches are off
- **THEN** no modulation is applied to any destination regardless of mod wheel or mix settings

#### Scenario: OSC 1 pitch switch routes vibrato
- **WHEN** OSC 1 pitch switch is on and mod wheel is non-zero
- **THEN** OSC 1 frequency is modulated at the rate and shape of the modulation source

#### Scenario: Filter switch routes filter LFO
- **WHEN** filter switch is on and mod wheel is non-zero
- **THEN** filter cutoff oscillates at the rate and shape of the modulation source

#### Scenario: Multiple switches active simultaneously
- **WHEN** OSC 1 pitch, OSC 2 pitch, and filter switches are all on
- **THEN** all three destinations are modulated simultaneously and independently

---

### Requirement: Modulation depth controlled by mod wheel
The modulation signal SHALL be scaled by the mod wheel value (0–1) before routing to destinations. At mod wheel 0 no modulation SHALL reach any destination. At mod wheel 1 full modulation depth SHALL be applied. Pitch modulation depth SHALL be fixed at ±2 semitones at mod wheel 1.0.

#### Scenario: Mod wheel at zero suppresses modulation
- **WHEN** mod wheel is 0 and routing switches are on
- **THEN** no audible modulation occurs

#### Scenario: Mod wheel at maximum applies full depth
- **WHEN** mod wheel is 1.0 and OSC 1 pitch switch is on
- **THEN** OSC 1 pitch deviates by up to ±2 semitones at the modulation source's amplitude

---

### Requirement: Virtual mod wheel on-screen control
The modulation panel SHALL display a vertical slider functioning as a virtual mod wheel. Dragging it upward increases modulation depth from 0 to 1. The virtual wheel SHALL initialise to 0.5 (center position) at power-on. The virtual wheel SHALL remain in sync with incoming MIDI CC 1 messages: when CC 1 is received, the on-screen slider updates to match. The FAUST DSP `modWheel` hslider default SHALL also be 0.5 so that the DSP and Svelte state agree at power-on without requiring any user interaction.

#### Scenario: Dragging virtual wheel increases modulation
- **WHEN** user drags the virtual mod wheel slider upward
- **THEN** modulation depth increases and audible modulation deepens if routing is active

#### Scenario: Virtual wheel defaults to center at power-on
- **WHEN** the synth starts with no saved state
- **THEN** the virtual mod wheel is at 0.5 and the DSP modWheel parameter is also 0.5

#### Scenario: MIDI CC 1 updates virtual wheel position
- **WHEN** MIDI CC 1 message is received
- **THEN** the virtual mod wheel slider moves to the position corresponding to the CC value (0–127 → 0–1)

#### Scenario: Virtual wheel and CC 1 stay in sync
- **WHEN** user moves the virtual wheel and then a CC 1 message arrives
- **THEN** the on-screen slider updates to the CC 1 value, overriding the prior manual position

---

### Requirement: OSC 3 LFO mode
OSC 3 SHALL provide an LFO mode toggle switch. When LFO mode is off, OSC 3 operates at normal audio frequencies (same range as OSC 1 and OSC 2). When LFO mode is on, OSC 3 frequency is controlled by a dedicated LFO rate parameter spanning 0.1–20 Hz, independent of keyboard input. While in LFO mode OSC 3 is excluded from the mixer (its contribution to the audio signal path is zero).

#### Scenario: LFO mode off — OSC 3 is audio oscillator
- **WHEN** OSC 3 LFO mode is off
- **THEN** OSC 3 operates at keyboard-driven frequency, is present in the mixer at its set level, and can be heard in the output

#### Scenario: LFO mode on — OSC 3 runs at sub-audio rate
- **WHEN** OSC 3 LFO mode is on
- **THEN** OSC 3 frequency is set by the LFO rate knob (0.1–20 Hz) regardless of keyboard input

#### Scenario: LFO mode excludes OSC 3 from mixer audio
- **WHEN** OSC 3 LFO mode is on
- **THEN** OSC 3 contributes zero to the mixer signal and is inaudible in the output

#### Scenario: LFO rate controls modulation speed
- **WHEN** OSC 3 is in LFO mode and routed to a pitch or filter destination
- **THEN** the modulation oscillates at the frequency set by the LFO rate knob
