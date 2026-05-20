# Delay

## Purpose

Provides a tape-modelled feedback delay effect stage positioned after master volume and before reverb in the signal chain. Supports time, feedback, and mix control via MIDI-learnable knobs, with an optional LFO modulation path for pitch-shifting wow/flutter effects. The delay can be toggled on/off independently of reverb in a combined Effects panel.
## Requirements
### Requirement: Tape delay DSP stage inserted after master volume and before reverb

The system SHALL implement a tape-delay-modelled feedback delay stage in `faust/synth.dsp` positioned after `masterVol` and before the shimmer reverb stage. The delay SHALL use `de.fdelay` (linear interpolation, tape character) with a slow wow/flutter LFO (≈ 0.5 Hz, ±0.3% of delay time) modulating the read position. The feedback path SHALL include a first-order low-pass filter at 6 kHz (`fi.lowpass(1, 6000)`) to darken successive repeats and `ma.tanh` soft saturation to model tape saturation. The feedback coefficient SHALL be capped via `max(0) : min(0.9)` to prevent unbounded buildup. When `delayOn` is 0 the delay input SHALL be driven with zeros so the buffer stays silent and enabling delay for the first time produces no jarring burst of buffered audio. The wet/dry blend SHALL be controlled by `delayMix` (0–1). A `delayOn` parameter (0 or 1, default 0) SHALL bypass the entire delay stage via `select2` when 0. Default values: `delayOn` = 0, `delayTime` = 0.3 s, `delayFeedback` = 0.3, `delayMix` = 0.3.

#### Scenario: delayOn at zero bypasses the delay

- **WHEN** `delayOn` is 0
- **THEN** the VCA output passes through unchanged with no delay repeats audible

#### Scenario: delayOn at one activates delay repeats

- **WHEN** `delayOn` is 1 and `delayMix` is greater than 0
- **THEN** audible delay repeats are heard after the initial note

#### Scenario: Delay repeats ring freely after VCA closes

- **WHEN** `delayOn` is 1, `delayFeedback` is greater than 0, and the note is released (VCA closes)
- **THEN** delay repeats continue to decay after the VCA output reaches zero

#### Scenario: Delay output feeds into reverb stage

- **GIVEN** an audio signal is present, a note is playing, and `delayTime` is 0.3 s (the default)
- **WHEN** `delayOn` is 1, `reverbOn` is 1, and `delayFeedback` is greater than 0
- **THEN** the output signal in a 500 ms window beginning at note-off has non-zero energy that exceeds the dry-only baseline, confirming delay signal is entering the reverb wet path

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

#### Scenario: Time change is smooth with no hard clicks

- **WHEN** `delayTime` is adjusted while `delayOn` is 1 and audio is playing
- **THEN** the delay time transitions without hard clicks; subtle interpolation artefacts consistent with the tape character of `de.fdelay` are acceptable

---

### Requirement: Combined Effects panel with DELAY and REVERB sub-sections

The system SHALL provide an `Effects.svelte` component that hosts both the delay and reverb controls in a single panel. The outer panel label SHALL read "EFFECTS". A sub-label "DELAY" SHALL appear above the delay controls: an on/off toggle (amber active style, grey inactive) and three `Knob` components labelled `mix`, `time`, and `feedback`, in that left-to-right order. A `section-divider` line SHALL visually separate the two sub-sections. A sub-label "REVERB" SHALL appear above the reverb controls: an on/off toggle and four `Knob` components labelled `mix`, `LPF`, `decay`, and `pre-delay`. The sub-label style SHALL match the `AmpEnv.svelte` "loudness contour" label. The component SHALL accept `onchange`, `midiState`, and `onknobcontextmenu` props. The `delayTime`, `delayFeedback`, `delayMix`, `reverbMix`, `reverbDecay`, `reverbTone` (the `LPF` knob), and `reverbPreDelay` knobs SHALL all participate in the MIDI CC learn workflow. `delayOn` and `reverbOn` are not MIDI-learnable. For reverb knob parameter names, defaults, and scenarios, see `openspec/specs/reverb/spec.md`.

#### Scenario: Toggle defaults to off

- **WHEN** the Delay panel is rendered with no external state
- **THEN** the toggle button displays "off" and delay is inactive

#### Scenario: Toggle sends delayOn param

- **WHEN** the on/off toggle is clicked from the off state
- **THEN** `onchange` is called with `{ param: 'delayOn', value: 1 }`

#### Scenario: Toggle sends delayOn off param

- **WHEN** the on/off toggle is clicked from the on state
- **THEN** `onchange` is called with `{ param: 'delayOn', value: 0 }`

#### Scenario: Mix knob is the leftmost delay knob

- **WHEN** the Delay panel is rendered
- **THEN** the delay knob row presents the knobs in left-to-right order `mix`, `time`, `feedback`

#### Scenario: Time knob defaults to 0.3 s

- **WHEN** the Delay panel is rendered with no external state
- **THEN** the time knob displays 0.3 s

#### Scenario: Knob change dispatches correct param name

- **WHEN** the feedback knob is adjusted
- **THEN** `onchange` is called with `{ param: 'delayFeedback', value: <new value> }`

#### Scenario: MIDI learn context menu triggers for each knob

- **WHEN** the user right-clicks any of the three delay knobs
- **THEN** `onknobcontextmenu` is called with the corresponding param name (`delayMix`, `delayTime`, or `delayFeedback`)

#### Scenario: External MIDI value updates knob display

- **WHEN** `midiState.delayTime.externalValue` is updated by an incoming CC message
- **THEN** the time knob reflects the new value visually

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

### Requirement: Delay line modulation with user-controllable on/off, rate, and depth

The system SHALL provide a sinusoidal LFO that modulates the delay read position, summed with the existing tape wow LFO. Three new FAUST parameters SHALL be added: `delayModOn` (nentry, 0 or 1, default 0), `delayModRate` (LFO frequency, 0.1–10 Hz, default 0.5 Hz), and `delayModDepth` (LFO amplitude expressed in seconds, 0–0.025 s, default 0). `delayModRate`, `delayModDepth`, and `delayModOn` SHALL each be smoothed with a one-pole IIR filter before use — `delayModOn`'s smooth value acts as a gain on the LFO output, preventing clicks when toggled at a non-zero LFO phase. When `delayModOn` is 0, the smoothed gain fades to zero and the LFO contributes nothing to `tapeTime`.

#### Scenario: MOD off produces no modulation regardless of rate and depth

- **WHEN** `delayModOn` is 0 (the default)
- **THEN** the delay output is indistinguishable from the pre-change implementation; no additional pitch wobble is present beyond the existing tape wow, even if rate and depth knobs are non-zero

#### Scenario: Toggling MOD on produces no click

- **WHEN** `delayModOn` transitions from 0 to 1 while `delayOn` is 1 and audio is playing
- **THEN** the modulation fades in over approximately 10 ms with no audible click or discontinuity

#### Scenario: Toggling MOD off produces no click

- **WHEN** `delayModOn` transitions from 1 to 0 while `delayOn` is 1 and modulation is active
- **THEN** the modulation fades out over approximately 10 ms with no audible click or discontinuity

#### Scenario: MOD on with non-zero depth produces audible pitch modulation on repeats

- **WHEN** `delayModOn` is 1, `delayModDepth` is greater than 0, and `delayOn` is 1
- **THEN** each delay repeat exhibits pitch wobble at the rate set by `delayModRate`, consistent with a chorus/vibrato effect on the repeats

#### Scenario: Rate controls LFO frequency

- **WHEN** `delayModRate` is set to 0.5 Hz with moderate depth
- **THEN** the pitch wobble on repeats cycles approximately once every 2 seconds

#### Scenario: Rate set to 10 Hz produces vibrato-speed modulation

- **WHEN** `delayModRate` is 10 Hz with non-zero depth
- **THEN** the pitch wobble on repeats cycles approximately 10 times per second, producing a rapid vibrato character

#### Scenario: Adjusting rate knob while playing causes no audible click

- **WHEN** `delayModRate` is changed while `delayOn` is 1 and audio is playing
- **THEN** no click or discontinuity is heard; the rate change is smoothed over approximately 10 ms

#### Scenario: Adjusting depth knob while playing causes no audible click

- **WHEN** `delayModDepth` is changed while `delayOn` is 1 and audio is playing
- **THEN** no click or discontinuity is heard; the depth ramps smoothly to the new value

#### Scenario: tapeTime remains valid at maximum depth and minimum delay time

- **WHEN** `delayModDepth` is 0.025 s and `delayTime` is 0.01 s (minimum)
- **THEN** `tapeTime` is clamped to at least 1 sample and at most `maxDelayLen - 1` samples; no clamp violation or audio artefact occurs

### Requirement: Delay modulation controls on a dedicated second row in the Effects panel

The Effects panel delay sub-section SHALL contain two rows. The first row contains the `mix`, `time`, `feedback` knobs (in that left-to-right order). A second row SHALL appear immediately below it containing a **MOD** on/off toggle button followed by two `Knob` components: **rate** (param `delayModRate`, range 0.1–10 Hz, default 0.5, log scale, unit "Hz") and **depth** (param `delayModDepth`, range 0–0.025 s, default 0, linear scale, unit "s"). The MOD toggle SHALL use the same visual style as the existing delay and reverb on/off toggles (amber active, grey inactive). `delayModOn` is not MIDI-learnable. Both knobs SHALL participate in the MIDI CC learn workflow.

#### Scenario: MOD toggle defaults to off

- **WHEN** the Effects panel is rendered with no external state
- **THEN** the MOD toggle displays "off" and modulation is inactive

#### Scenario: MOD toggle sends delayModOn param on

- **WHEN** the MOD toggle is clicked from the off state
- **THEN** `onchange` is called with `{ param: 'delayModOn', value: 1 }`

#### Scenario: MOD toggle sends delayModOn param off

- **WHEN** the MOD toggle is clicked from the on state
- **THEN** `onchange` is called with `{ param: 'delayModOn', value: 0 }`

#### Scenario: MOD toggle resets to off on synth reset

- **WHEN** the synth reset counter increments
- **THEN** the MOD toggle returns to the off state and dispatches `{ param: 'delayModOn', value: 0 }`

#### Scenario: Rate knob defaults to 0.5 Hz

- **WHEN** the Effects panel is rendered with no external state
- **THEN** the rate knob displays 0.5 Hz

#### Scenario: Depth knob defaults to 0

- **WHEN** the Effects panel is rendered with no external state
- **THEN** the depth knob displays 0 s

#### Scenario: Rate knob change dispatches correct param

- **WHEN** the rate knob is adjusted
- **THEN** `onchange` is called with `{ param: 'delayModRate', value: <new value> }`

#### Scenario: Depth knob change dispatches correct param

- **WHEN** the depth knob is adjusted
- **THEN** `onchange` is called with `{ param: 'delayModDepth', value: <new value> }`

#### Scenario: MIDI learn context menu triggers for rate and depth knobs

- **WHEN** the user right-clicks the rate or depth knob
- **THEN** `onknobcontextmenu` is called with `'delayModRate'` or `'delayModDepth'` respectively

### Requirement: Delay modulation params registered in MIDI CC map

The system SHALL register `delayModRate` (range 0.1–10 Hz) and `delayModDepth` (range 0–0.025 s) in the `KNOB_PARAMS` registry in `App.svelte`, and set their default values in the `DEFAULTS` map (`delayModRate`: 0.5, `delayModDepth`: 0). Both params SHALL be included in `effectsMidiState`.

#### Scenario: delayModRate responds to assigned CC

- **WHEN** a MIDI CC is assigned to `delayModRate` and a CC message is received
- **THEN** the rate parameter is updated via the standard CC routing path and the knob reflects the new value

#### Scenario: delayModDepth responds to assigned CC

- **WHEN** a MIDI CC is assigned to `delayModDepth` and a CC message is received
- **THEN** the depth parameter is updated via the standard CC routing path and the knob reflects the new value

