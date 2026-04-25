## ADDED Requirements

### Requirement: Shimmer reverb DSP stage inserted after VCA
The system SHALL implement a shimmer reverb stage in `faust/synth.dsp` positioned after the VCA and before the final stereo split. The reverb SHALL use `re.mono_freeverb` as the diffusion body with `ef.transpose` (grain 512, crossfade 256, +12 semitones) in the recirculation feedback path. The feedback tap SHALL be scaled by `reverbShimmer` (0–1). The wet/dry blend SHALL be controlled by `reverbMix` (0–1). The tail length SHALL be controlled by `reverbDecay` (0–1) mapped to freeverb's `fb1` parameter. An `reverbOn` parameter (0 or 1, default 0) SHALL bypass the entire reverb stage via `select2` when 0, passing the signal through unchanged. Default values: `reverbOn` = 0, `reverbMix` = 0.5, `reverbDecay` = 0.5, `reverbShimmer` = 0.

#### Scenario: reverbOn at zero bypasses the reverb
- **WHEN** `reverbOn` is 0
- **THEN** the output is identical to the pre-reverb VCA output with no reverb or shimmer processing applied

#### Scenario: reverbOn at one activates the reverb
- **WHEN** `reverbOn` is 1 and `reverbMix` is greater than 0
- **THEN** the reverb tail is audible in the output

#### Scenario: Mix at zero passes dry signal only when reverb is on
- **WHEN** `reverbOn` is 1 and `reverbMix` is 0
- **THEN** only the dry signal is present in the output with no reverb tail

#### Scenario: Mix at one passes wet signal only
- **WHEN** `reverbOn` is 1 and `reverbMix` is 1
- **THEN** the output consists entirely of the reverb wet signal with no dry component

#### Scenario: Shimmer at zero produces no pitch-shifted feedback
- **WHEN** `reverbOn` is 1, `reverbShimmer` is 0, and `reverbMix` is greater than 0
- **THEN** the reverb tail has no pitch-shifted harmonic content and decays normally

#### Scenario: Shimmer above zero produces octave-up harmonic buildup
- **WHEN** `reverbOn` is 1, `reverbShimmer` is greater than 0, and `reverbMix` is greater than 0
- **THEN** the reverb tail contains audible harmonic content one octave above the source note that builds up over time

#### Scenario: Decay controls tail length
- **WHEN** `reverbOn` is 1, `reverbMix` is greater than 0, and `reverbDecay` is increased from 0 to 1
- **THEN** the reverb tail grows longer

#### Scenario: Feedback is clipped to prevent infinite buildup
- **WHEN** `reverbDecay` and `reverbShimmer` are both at 1.0 and `reverbOn` is 1
- **THEN** the feedback signal is clipped to prevent the output level from growing without bound

---

### Requirement: Reverb UI panel with on/off toggle and three MIDI-learnable knobs
The system SHALL provide a `Reverb.svelte` component containing an on/off toggle button (controlling `reverbOn`) and three `Knob` components labelled `mix`, `decay`, and `shimmer`. The toggle SHALL use the same button style as the Glide panel's on/off button (active state: amber highlight; inactive: grey). The component SHALL accept `onchange`, `midiState`, and `onknobcontextmenu` props following the same contract as existing panel components. The `reverbMix`, `reverbDecay`, and `reverbShimmer` knobs SHALL participate in the MIDI CC learn workflow. The `reverbOn` toggle is not MIDI-learnable.

#### Scenario: Toggle defaults to off
- **WHEN** the Reverb panel is rendered with no external state
- **THEN** the toggle button displays "off" and the reverb is inactive

#### Scenario: Toggle sends reverbOn param
- **WHEN** the on/off toggle button is clicked from the off state
- **THEN** `onchange` is called with `{ param: 'reverbOn', value: 1 }`

#### Scenario: Mix knob defaults to 0.5
- **WHEN** the Reverb panel is rendered with no external state
- **THEN** the mix knob displays a value of 0.5

#### Scenario: Knob change dispatches correct param name
- **WHEN** the decay knob is adjusted
- **THEN** `onchange` is called with `{ param: 'reverbDecay', value: <new value> }`

#### Scenario: MIDI learn context menu triggers for each knob
- **WHEN** the user right-clicks any of the three reverb knobs
- **THEN** `onknobcontextmenu` is called with the corresponding param name (`reverbMix`, `reverbDecay`, or `reverbShimmer`)

#### Scenario: External MIDI value updates knob display
- **WHEN** `midiState.reverbShimmer.externalValue` is updated by an incoming CC message
- **THEN** the shimmer knob reflects the new value visually

---

### Requirement: Reverb parameters registered in MIDI CC map
The system SHALL register `reverbMix` (range 0–1), `reverbDecay` (range 0–1), and `reverbShimmer` (range 0–1) as learnable parameters in the `KNOB_PARAMS` registry in `App.svelte` and the `midiCcMap.js`, following the same pattern as existing parameters. `reverbOn` is not registered (it is a toggle, not a knob).

#### Scenario: Reverb mix responds to assigned CC
- **WHEN** a MIDI CC is assigned to `reverbMix` and a CC message is received
- **THEN** `reverbMix` is updated by the engine via the standard CC routing path

#### Scenario: Reverb params appear in CC learn UI
- **WHEN** the user right-clicks a reverb knob and enters MIDI learn mode
- **THEN** the knob enters learn state and captures the next incoming CC number

---

### Requirement: Reverb panel mounted between Filter and Amp Env in the filter-output-grid
The system SHALL mount the `Reverb` panel in `App.svelte` inside the `filter-output-grid`, as the middle column between the `Filter` and `AmpEnv` panels. The grid SHALL be widened from two columns (`auto auto`) to three columns (`auto auto auto`) to accommodate the new panel.

#### Scenario: Reverb panel is visible in the UI
- **WHEN** the application loads
- **THEN** a panel labelled "reverb" is visible between the filter and amp env panels in the synthesizer interface

#### Scenario: Reverb panel wires onchange to engine
- **WHEN** a reverb knob value or toggle changes
- **THEN** the corresponding parameter is sent to the DSP engine via the existing `setParam` path
