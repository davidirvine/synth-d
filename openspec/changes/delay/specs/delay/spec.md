## ADDED Requirements

### Requirement: Feedback delay DSP stage inserted post-VCA
The system SHALL implement a feedback delay stage in `faust/synth.dsp` positioned after the VCA (amp envelope × VCA output) and before master volume. The delay SHALL use `de.sdelay(96000, 1024, delayTime * ma.SR)` for smooth, click-free time changes. The feedback loop SHALL recirculate the delay output scaled by `delayFeedback`, with the feedback coefficient capped via `ba.clip(0, 0.9)` to prevent unbounded buildup and negative-feedback inversion. When `delayOn` is 0 the delay input SHALL be driven with zeros (not the live VCA signal) so the buffer stays silent and enabling delay for the first time produces no jarring burst of buffered audio. The wet/dry blend SHALL be controlled by `delayMix` (0–1). A `delayOn` parameter (0 or 1, default 0) SHALL bypass the entire delay stage via `select2` when 0. Default values: `delayOn` = 0, `delayTime` = 0.3 s, `delayFeedback` = 0.3, `delayMix` = 0.3.

#### Scenario: delayOn at zero bypasses the delay
- **WHEN** `delayOn` is 0
- **THEN** the VCA output passes through unchanged with no delay repeats audible

#### Scenario: delayOn at one activates delay repeats
- **WHEN** `delayOn` is 1 and `delayMix` is greater than 0
- **THEN** audible delay repeats are heard after the initial note

#### Scenario: Delay repeats ring freely after VCA closes
- **WHEN** `delayOn` is 1, `delayFeedback` is greater than 0, and the note is released (VCA closes)
- **THEN** delay repeats continue to decay after the VCA output reaches zero

#### Scenario: Mix at zero passes dry signal only
- **WHEN** `delayOn` is 1 and `delayMix` is 0
- **THEN** no delay repeats are audible; only the dry signal is present

#### Scenario: Mix at one passes wet signal only
- **WHEN** `delayOn` is 1 and `delayMix` is 1
- **THEN** the output consists entirely of the delay wet signal; the dry signal is absent

#### Scenario: Feedback at zero produces single repeat
- **WHEN** `delayOn` is 1, `delayFeedback` is 0, and `delayMix` is greater than 0
- **THEN** a single delayed copy of the signal is heard with no further repeats

#### Scenario: Feedback near 0.9 produces long-decaying repeats
- **WHEN** `delayOn` is 1 and `delayFeedback` is 0.9
- **THEN** multiple repeats are audible, decaying slowly over several seconds

#### Scenario: Feedback coefficient is capped at 0.9 in the DSP
- **WHEN** `delayFeedback` is set to any value via UI or MIDI CC
- **THEN** the feedback gain applied inside the delay circuit is clamped to [0, 0.9], preventing self-oscillation and negative-feedback phase inversion

#### Scenario: Enabling delay produces no burst of buffered audio
- **WHEN** `delayOn` transitions from 0 to 1 for the first time
- **THEN** no delay repeats from before the toggle are audible; the first repeat arrives one `delayTime` after the toggle

#### Scenario: Time change is smooth with no clicks
- **WHEN** `delayTime` is adjusted while `delayOn` is 1 and audio is playing
- **THEN** the delay time transitions without audible clicks or discontinuities

---

### Requirement: Delay UI panel with on/off toggle and three MIDI-learnable knobs
The system SHALL provide a `Delay.svelte` component containing an on/off toggle button (controlling `delayOn`) and three `Knob` components labelled `time`, `feedback`, and `mix`. The toggle SHALL use the same button style as the Glide panel (active state: amber highlight; inactive: grey). The component SHALL accept `onchange`, `midiState`, and `onknobcontextmenu` props following the same contract as existing panel components. The `delayTime`, `delayFeedback`, and `delayMix` knobs SHALL participate in the MIDI CC learn workflow. `delayOn` is not MIDI-learnable.

#### Scenario: Toggle defaults to off
- **WHEN** the Delay panel is rendered with no external state
- **THEN** the toggle button displays "off" and delay is inactive

#### Scenario: Toggle sends delayOn param
- **WHEN** the on/off toggle is clicked from the off state
- **THEN** `onchange` is called with `{ param: 'delayOn', value: 1 }`

#### Scenario: Time knob defaults to 0.3 s
- **WHEN** the Delay panel is rendered with no external state
- **THEN** the time knob displays 0.3 s

#### Scenario: Knob change dispatches correct param name
- **WHEN** the feedback knob is adjusted
- **THEN** `onchange` is called with `{ param: 'delayFeedback', value: <new value> }`

#### Scenario: MIDI learn context menu triggers for each knob
- **WHEN** the user right-clicks any of the three delay knobs
- **THEN** `onknobcontextmenu` is called with the corresponding param name (`delayTime`, `delayFeedback`, or `delayMix`)

#### Scenario: External MIDI value updates knob display
- **WHEN** `midiState.delayTime.externalValue` is updated by an incoming CC message
- **THEN** the time knob reflects the new value visually

---

### Requirement: Delay parameters registered in MIDI CC map
The system SHALL register `delayTime` (range 0.01–1.0 s), `delayFeedback` (range 0–0.9), and `delayMix` (range 0–1) as learnable parameters in the `KNOB_PARAMS` registry in `App.svelte`, following the same pattern as existing parameters. `delayOn` is not registered.

#### Scenario: Delay time responds to assigned CC
- **WHEN** a MIDI CC is assigned to `delayTime` and a CC message is received
- **THEN** `delayTime` is updated by the engine via the standard CC routing path

#### Scenario: Delay params appear in CC learn UI
- **WHEN** the user right-clicks a delay knob and enters MIDI learn mode
- **THEN** the knob enters learn state and captures the next incoming CC number

---

### Requirement: Delay panel mounted below Reverb in the filter-output-grid
The system SHALL mount the `Delay` panel in `App.svelte` inside the `filter-output-grid` at column 2, row 2 — directly below the Reverb panel — grouping the two time-based effects vertically.

#### Scenario: Delay panel is visible below Reverb in the UI
- **WHEN** the application loads
- **THEN** a panel labelled "delay" is visible directly below the reverb panel in the synthesizer interface

#### Scenario: Delay panel wires onchange to engine
- **WHEN** a delay knob value or toggle changes
- **THEN** the corresponding parameter is sent to the DSP engine via the existing `setParam` path
