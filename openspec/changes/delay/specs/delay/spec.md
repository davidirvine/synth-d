## ADDED Requirements

### Requirement: Tape delay DSP stage inserted after master volume and before reverb

The system SHALL implement a tape-delay-modelled feedback delay stage in `faust/synth.dsp` positioned after `masterVol` and before the shimmer reverb stage. The delay SHALL use `de.fdelay` (linear interpolation, tape character) with a slow wow/flutter LFO (≈ 0.5 Hz, ±0.3% of delay time) modulating the read position. The feedback path SHALL include a first-order low-pass filter at 6 kHz (`fi.lowpass(1, 6000)`) to darken successive repeats and `ma.tanh` soft saturation to model tape saturation. The feedback coefficient SHALL be capped via `ba.clip(0, 0.9)` to prevent unbounded buildup. When `delayOn` is 0 the delay input SHALL be driven with zeros so the buffer stays silent and enabling delay for the first time produces no jarring burst of buffered audio. The wet/dry blend SHALL be controlled by `delayMix` (0–1). A `delayOn` parameter (0 or 1, default 0) SHALL bypass the entire delay stage via `select2` when 0. Default values: `delayOn` = 0, `delayTime` = 0.3 s, `delayFeedback` = 0.3, `delayMix` = 0.3.

#### Scenario: delayOn at zero bypasses the delay

- **WHEN** `delayOn` is 0
- **THEN** the VCA output passes through unchanged with no delay repeats audible

#### Scenario: delayOn at one activates delay repeats

- **WHEN** `delayOn` is 1 and `delayMix` is greater than 0
- **THEN** audible delay repeats are heard after the initial note

#### Scenario: Delay repeats ring freely after VCA closes

- **WHEN** `delayOn` is 1, `delayFeedback` is greater than 0, and the note is released (VCA closes)
- **THEN** delay repeats continue to decay after the VCA output reaches zero, and the repeats feed into the reverb stage

#### Scenario: Tape character — repeats darken and soften over time

- **WHEN** `delayOn` is 1 and `delayFeedback` is greater than 0
- **THEN** each successive delay repeat is noticeably darker (high frequencies attenuated) than the previous one, and the repeats exhibit subtle pitch wavering from the wow LFO

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

### Requirement: Combined Effects panel with DELAY and REVERB sub-sections

The system SHALL provide an `Effects.svelte` component that hosts both the delay and reverb controls in a single panel. The outer panel label SHALL read "EFFECTS". A sub-label "DELAY" SHALL appear above the delay controls: an on/off toggle (amber active style, grey inactive) and three `Knob` components labelled `time`, `feedback`, and `mix`. A `section-divider` line SHALL visually separate the two sub-sections. A sub-label "REVERB" SHALL appear above the reverb controls: an on/off toggle and three `Knob` components labelled `mix`, `decay`, and `shimmer`. The sub-label style SHALL match the `AmpEnv.svelte` "loudness contour" label. The component SHALL accept `onchange`, `midiState`, and `onknobcontextmenu` props. The `delayTime`, `delayFeedback`, `delayMix`, `reverbMix`, `reverbDecay`, and `reverbShimmer` knobs SHALL all participate in the MIDI CC learn workflow. `delayOn` and `reverbOn` are not MIDI-learnable.

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

### Requirement: Effects panel mounted in place of the standalone Reverb panel

The system SHALL mount `<Effects>` in `App.svelte` in the same grid position previously occupied by `<Reverb>`. The standalone `Reverb.svelte` component SHALL be removed. The combined panel SHALL handle both delay and reverb parameter dispatching through the existing `setParam` path.

#### Scenario: Effects panel is visible with DELAY above REVERB

- **WHEN** the application loads
- **THEN** a panel labelled "EFFECTS" is visible with a "DELAY" sub-section above a "REVERB" sub-section separated by a divider line

#### Scenario: Effects panel wires both delay and reverb onchange to engine

- **WHEN** any delay or reverb knob value or toggle changes
- **THEN** the corresponding parameter is sent to the DSP engine via the existing `setParam` path
