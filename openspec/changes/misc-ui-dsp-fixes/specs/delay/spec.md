## MODIFIED Requirements

### Requirement: Delay parameters registered in MIDI CC map
The system SHALL register `delayTime` (range 0.01–2.0 s), `delayFeedback` (range 0–0.9), and `delayMix` (range 0–1) as learnable parameters in the `KNOB_PARAMS` registry in `App.svelte`, following the same pattern as existing parameters. `delayOn` is not registered.

#### Scenario: Delay time responds to assigned CC
- **WHEN** a MIDI CC is assigned to `delayTime` and a CC message is received
- **THEN** `delayTime` is updated by the engine via the standard CC routing path

#### Scenario: Delay params appear in CC learn UI
- **WHEN** the user right-clicks a delay knob and enters MIDI learn mode
- **THEN** the knob enters learn state and captures the next incoming CC number

---

### Requirement: Tape delay DSP stage inserted after master volume and before reverb
The system SHALL implement a tape-delay-modelled feedback delay stage in `faust/synth.dsp` positioned after `masterVol` and before the shimmer reverb stage. The delay SHALL use `de.fdelay` (linear interpolation, tape character) with a slow wow/flutter LFO (≈ 0.5 Hz, ±0.3% of delay time) modulating the read position. The feedback path SHALL include a first-order low-pass filter at 6 kHz (`fi.lowpass(1, 6000)`) to darken successive repeats and `ma.tanh` soft saturation to model tape saturation. The feedback coefficient SHALL be capped via `max(0) : min(0.9)` to prevent unbounded buildup. When `delayOn` is 0 the delay input SHALL be driven with zeros so the buffer stays silent and enabling delay for the first time produces no jarring burst of buffered audio. The wet/dry blend SHALL be controlled by `delayMix` (0–1). A `delayOn` parameter (0 or 1, default 0) SHALL bypass the entire delay stage via `select2` when 0. The `delayTime` parameter SHALL span 0.01–2.0 s (maximum doubled from 1.0 s); the `maxDelayLen` buffer SHALL be 96000 samples, sufficient for 2 seconds at the locked 48 kHz sample rate. Default values: `delayOn` = 0, `delayTime` = 0.3 s, `delayFeedback` = 0.3, `delayMix` = 0.3.

#### Scenario: delayOn at zero bypasses the delay
- **WHEN** `delayOn` is 0
- **THEN** the VCA output passes through unchanged with no delay repeats audible

#### Scenario: delayOn at one activates delay repeats
- **WHEN** `delayOn` is 1 and `delayMix` is greater than 0
- **THEN** audible delay repeats are heard after the initial note

#### Scenario: Delay repeats ring freely after VCA closes
- **WHEN** `delayOn` is 1, `delayFeedback` is greater than 0, and the note is released (VCA closes)
- **THEN** delay repeats continue to decay after the VCA output reaches zero

#### Scenario: Delay time maximum is 2 seconds
- **WHEN** the delay time knob is set to its maximum position
- **THEN** the delay time is 2.0 s and audible repeats are spaced 2 seconds apart

#### Scenario: Time change is smooth with no hard clicks
- **WHEN** `delayTime` is adjusted while `delayOn` is 1 and audio is playing
- **THEN** the delay time transitions without hard clicks; subtle interpolation artefacts consistent with the tape character of `de.fdelay` are acceptable

#### Scenario: Enabling delay produces no burst of buffered audio
- **WHEN** `delayOn` transitions from 0 to 1 for the first time
- **THEN** no delay repeats from before the toggle are audible; the first repeat arrives one `delayTime` after the toggle

---

### Requirement: Combined Effects panel with DELAY and REVERB sub-sections
The system SHALL provide an `Effects.svelte` component that hosts both the delay and reverb controls in a single panel. The outer panel label SHALL read "EFFECTS". A sub-label "DELAY" SHALL appear above the delay controls: an on/off toggle (amber active style, grey inactive) and three `Knob` components labelled `time`, `feedback`, and `mix`. The `time` knob SHALL span 0.01–2.0 s. A `section-divider` line SHALL visually separate the two sub-sections. A sub-label "REVERB" SHALL appear above the reverb controls. The component SHALL accept `onchange`, `midiState`, and `onknobcontextmenu` props.

#### Scenario: Time knob maximum is 2.0 s
- **WHEN** the time knob is dragged to its maximum position
- **THEN** the knob displays 2.0 s and `onchange` is called with `{ param: 'delayTime', value: 2.0 }`

#### Scenario: Time knob defaults to 0.3 s
- **WHEN** the Delay panel is rendered with no external state
- **THEN** the time knob displays 0.3 s

#### Scenario: Toggle sends delayOn param
- **WHEN** the on/off toggle is clicked from the off state
- **THEN** `onchange` is called with `{ param: 'delayOn', value: 1 }`
