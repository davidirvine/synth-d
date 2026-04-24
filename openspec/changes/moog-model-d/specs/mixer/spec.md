## ADDED Requirements

### Requirement: Per-source level knobs for oscillators and noise
The mixer SHALL provide four independent level knobs — one each for OSC 1, OSC 2, OSC 3, and noise — each spanning 0–1 (linear). Signals from all four sources SHALL be multiplied by their respective level values and summed before being passed to the filter.

#### Scenario: All levels at zero produces silence
- **WHEN** all four mixer level knobs are at 0
- **THEN** the signal reaching the filter is zero regardless of oscillator waveform or noise settings

#### Scenario: Single source at full level
- **WHEN** OSC 1 level is 1.0 and all other levels are 0
- **THEN** only OSC 1 contributes to the filter input

#### Scenario: Multiple sources summed
- **WHEN** OSC 1 level is 0.5 and OSC 2 level is 0.5 and all others are 0
- **THEN** the filter input is the sum of both oscillators each scaled by 0.5

#### Scenario: OSC 3 in LFO mode is excluded from mixer
- **WHEN** OSC 3 LFO mode is enabled
- **THEN** OSC 3 contributes zero to the mixer output regardless of its level knob position

---

### Requirement: White and pink noise source with selector
The mixer noise input SHALL offer two noise variants selectable by a toggle switch: white noise (flat spectrum) and pink noise (−3 dB/octave rolloff). The selected noise variant is the signal scaled by the noise level knob.

#### Scenario: White noise selected
- **WHEN** the noise selector is set to white
- **THEN** the noise source is flat-spectrum white noise (FAUST `no.noise`)

#### Scenario: Pink noise selected
- **WHEN** the noise selector is set to pink
- **THEN** the noise source is pink noise with −3 dB/octave rolloff (FAUST `no.pink_noise`)

#### Scenario: Noise level at zero
- **WHEN** noise level is 0 regardless of white/pink selector
- **THEN** noise contributes nothing to the filter input

---

### Requirement: Mixer level knobs are MIDI-learnable
Each mixer level knob SHALL participate in the standard MIDI CC learn workflow: right-click to enter learn mode, next incoming CC is assigned, right-click again or Escape to cancel.

#### Scenario: MIDI CC controls mixer level
- **WHEN** a CC is assigned to a mixer level knob and that CC is received
- **THEN** the mixer level updates to the scaled CC value and the knob indicator moves accordingly
