## ADDED Requirements

### Requirement: Reverb DSP stage with pre-delay, diffusion, and tone filter

The system SHALL implement a reverb DSP stage in `faust/synth.dsp` positioned after the tape delay stage. The reverb signal chain SHALL be: pre-delay line → `re.mono_freeverb` (diffusion body) → `fi.lowpass` (tone filter) → `fi.dcblocker`. The freeverb internal `damp` parameter SHALL be fixed at `0`. The wet/dry blend SHALL be controlled by `reverbMix` (0–1, default 0.5). Tail length SHALL be controlled by `reverbDecay` (0–1, mapped to freeverb `fb1`, default 0.5). High-frequency rolloff of the wet signal SHALL be controlled by `reverbTone` (1000–16000 Hz, default 16000). Time before signal enters the diffusion body SHALL be controlled by `reverbPreDelay` (0–0.1 s, default 0). A `reverbOn` parameter (0 or 1, default 0) SHALL bypass the entire reverb stage when 0. All four continuous parameters SHALL be smoothed with `si.smoo` before use. The pre-delay buffer SHALL be sized at 4801 samples (covers 100 ms at 48 kHz with one sample of headroom), implemented with `de.fdelay`.

#### Scenario: reverbOn at zero bypasses the reverb

- **WHEN** `reverbOn` is 0
- **THEN** the tape delay output passes directly to the stereo split with no reverb processing applied

#### Scenario: reverbOn at one activates the reverb

- **WHEN** `reverbOn` is 1 and `reverbMix` is greater than 0
- **THEN** the reverb wet signal is audible in the output

#### Scenario: Mix at zero passes dry signal only

- **WHEN** `reverbOn` is 1 and `reverbMix` is 0
- **THEN** only the dry signal is present with no reverb tail

#### Scenario: Mix at one passes wet signal only

- **WHEN** `reverbOn` is 1 and `reverbMix` is 1
- **THEN** the output consists entirely of the reverb wet signal with no dry component

#### Scenario: Decay controls tail length

- **WHEN** `reverbOn` is 1, `reverbMix` is greater than 0, and `reverbDecay` is increased from 0.01 to 1
- **THEN** the reverb tail grows longer

#### Scenario: Tone at 16000 Hz produces no audible rolloff

- **WHEN** `reverbOn` is 1, `reverbMix` is greater than 0, and `reverbTone` is 16000
- **THEN** the wet signal retains full high-frequency content

#### Scenario: Tone below 4000 Hz audibly darkens the reverb tail

- **WHEN** `reverbOn` is 1, `reverbMix` is greater than 0, and `reverbTone` is set to 2000
- **THEN** the wet signal has reduced high-frequency content compared to `reverbTone` at 16000

#### Scenario: Pre-delay at zero produces no gap before reverb onset

- **WHEN** `reverbOn` is 1, `reverbMix` is greater than 0, and `reverbPreDelay` is 0
- **THEN** the reverb tail begins immediately with the dry signal onset

#### Scenario: Pre-delay above zero introduces a gap before reverb onset

- **WHEN** `reverbOn` is 1, `reverbMix` is greater than 0, and `reverbPreDelay` is 0.05
- **THEN** the reverb tail onset is delayed by approximately 50 ms relative to the dry signal

#### Scenario: Reverb tail rings freely after amp envelope closes

- **WHEN** `reverbOn` is 1, `reverbMix` is greater than 0, and the amp release is short (e.g. 0.05 s)
- **THEN** the reverb tail continues to decay after the VCA closes; tail length is governed by `reverbDecay`

#### Scenario: No shimmer parameter exists

- **WHEN** the DSP is compiled
- **THEN** there is no `reverbShimmer` parameter in the parameter list

---

### Requirement: Reverb UI panel with on/off toggle and four MIDI-learnable knobs

The system SHALL provide reverb controls inside `Effects.svelte`. The reverb section SHALL contain an on/off toggle button (controlling `reverbOn`) and four `Knob` components: `mix` (linear, 0–1, default 0.5), `tone` (log, 1000–16000 Hz, default 16000), `decay` (log, 0.01–1, default 0.5), and `pre-delay` (linear, 0–0.1 s, default 0). The toggle SHALL use the existing amber active / grey inactive button style. The four knobs SHALL participate in the MIDI CC learn workflow via `midiState` and `onknobcontextmenu` props. The `reverbOn` toggle SHALL NOT be MIDI-learnable. The `reverbShimmer` knob SHALL NOT be present.

#### Scenario: Toggle defaults to off

- **WHEN** the Effects panel is rendered with no external state
- **THEN** the reverb toggle displays "off" and `reverbOn` is 0

#### Scenario: Toggle sends reverbOn param on activation

- **WHEN** the reverb toggle is clicked from the off state
- **THEN** `onchange` is called with `{ param: 'reverbOn', value: 1 }`

#### Scenario: Mix knob defaults to 0.5

- **WHEN** the Effects panel is rendered with no external state
- **THEN** the mix knob displays a value of 0.5

#### Scenario: Tone knob defaults to 16000

- **WHEN** the Effects panel is rendered with no external state
- **THEN** the tone knob displays a value of 16000

#### Scenario: Decay knob defaults to 0.5

- **WHEN** the Effects panel is rendered with no external state
- **THEN** the decay knob displays a value of 0.5

#### Scenario: Pre-delay knob defaults to 0

- **WHEN** the Effects panel is rendered with no external state
- **THEN** the pre-delay knob displays a value of 0

#### Scenario: Knob change dispatches correct param name for tone

- **WHEN** the tone knob is adjusted
- **THEN** `onchange` is called with `{ param: 'reverbTone', value: <new value> }`

#### Scenario: Knob change dispatches correct param name for pre-delay

- **WHEN** the pre-delay knob is adjusted
- **THEN** `onchange` is called with `{ param: 'reverbPreDelay', value: <new value> }`

#### Scenario: MIDI learn context menu triggers for each knob

- **WHEN** the user right-clicks any of the four reverb knobs
- **THEN** `onknobcontextmenu` is called with the corresponding param name (`reverbMix`, `reverbTone`, `reverbDecay`, or `reverbPreDelay`)

#### Scenario: Shimmer knob is absent

- **WHEN** the Effects panel is rendered
- **THEN** no knob labelled "shimmer" is present in the reverb section

---

### Requirement: Reverb parameters registered in MIDI CC map

The system SHALL register `reverbMix` (0–1), `reverbDecay` (0.01–1), `reverbTone` (1000–16000), and `reverbPreDelay` (0–0.1) in the `KNOB_PARAMS` registry in `App.svelte` and in `midiCcMap.js`. `reverbShimmer` SHALL be removed from both registries. `reverbOn` SHALL NOT be registered.

#### Scenario: Reverb tone responds to assigned MIDI CC

- **WHEN** a MIDI CC is assigned to `reverbTone` and a CC message is received
- **THEN** `reverbTone` is updated by the engine via the standard CC routing path

#### Scenario: Reverb pre-delay responds to assigned MIDI CC

- **WHEN** a MIDI CC is assigned to `reverbPreDelay` and a CC message is received
- **THEN** `reverbPreDelay` is updated by the engine via the standard CC routing path

#### Scenario: reverbShimmer is absent from the CC map

- **WHEN** the MIDI CC map is inspected
- **THEN** there is no entry for `reverbShimmer`
