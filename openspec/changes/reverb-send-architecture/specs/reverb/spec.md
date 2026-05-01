## MODIFIED Requirements

### Requirement: Reverb DSP stage with pre-delay, diffusion, and tone filter

The system SHALL implement a reverb DSP stage in `faust/synth.dsp` positioned after the tape delay stage. The reverb signal chain SHALL be: pre-delay line → 2nd-order high-pass filter at 180 Hz → `re.mono_freeverb` (diffusion body) → `fi.dcblocker`. The high-pass filter SHALL be implemented with `fi.highpass(2, 180)` and SHALL be applied only to the wet send path; the dry path SHALL pass through unfiltered. The `fi.lowpass` post-filter stage SHALL NOT be present. The freeverb internal `damp` argument SHALL be wired to the `reverbDamp` parameter (smoothed).

The reverb SHALL use a send-style architecture: the dry signal SHALL pass through unattenuated and the wet signal SHALL be added in parallel scaled by `reverbSend`. The output SHALL be `dry + wet * reverbSend` (i.e. `delayStage + reverbWet * reverbSendS`). The dry path SHALL NOT be attenuated as a function of `reverbSend`. The send amount SHALL be controlled by `reverbSend` (0–1, default 0.3).

Tail length SHALL be controlled by `reverbDecay` (DSP range 0–1, mapped to freeverb `fb1`, default 0.5); the UI clamps the minimum to 0.01 to prevent a completely dead reverb tail. High-frequency decay rate of the reverb tail SHALL be controlled by `reverbDamp` (0–1, default 0.5), where 0 is undamped (bright) and 1 is fully damped (dark). The `reverbTone` parameter and the `fi.lowpass` post-filter SHALL be removed. Time before signal enters the diffusion body SHALL be controlled by `reverbPreDelay` (0–0.1 s, default 0.015). A `reverbOn` parameter (0 or 1, default 0) SHALL bypass the entire reverb stage when 0; when bypassed, the dry signal SHALL pass through unmodified.

All four continuous parameters (`reverbSend`, `reverbDamp`, `reverbDecay`, `reverbPreDelay`) SHALL be smoothed with `si.smoo` before use. The pre-delay buffer SHALL be sized at 4801 samples, implemented with `de.fdelay`. The `reverbMix` parameter SHALL NOT be present.

> Note: The freeverb room-size coefficient `fb2` is set to `0.5` in the implementation. This is an internal DSP constant not surfaced as a user-facing parameter; it is a non-normative implementation detail and does not impose a testable requirement.

> Note: The implementation targets 48 kHz; the 4801-sample buffer must be resized for other sample rates. This is a non-normative observation and does not impose a testable requirement.

#### Scenario: reverbOn at zero bypasses the reverb

- **WHEN** `reverbOn` is 0
- **THEN** the tape delay output passes directly to the stereo split with no reverb processing applied

#### Scenario: reverbOn at one activates the reverb

- **WHEN** `reverbOn` is 1 and `reverbSend` is greater than 0
- **THEN** the reverb wet signal is audible in the output, added to the unattenuated dry signal

#### Scenario: Send at zero produces no wet signal

- **WHEN** `reverbOn` is 1 and `reverbSend` is 0
- **THEN** the output is identical to the dry tape-delay-stage signal with no reverb tail

#### Scenario: Engaging reverb does not attenuate dry signal

- **WHEN** `reverbOn` toggles from 0 to 1 with `reverbSend` greater than 0
- **THEN** the dry signal level in the output is unchanged; only added wet content differs

#### Scenario: Decay controls tail length

- **WHEN** `reverbOn` is 1, `reverbSend` is greater than 0, and `reverbDecay` is increased from 0.01 to 1
- **THEN** the reverb tail grows longer

#### Scenario: Damp at 0 produces a bright reverb tail

- **WHEN** `reverbOn` is 1, `reverbSend` is greater than 0, and `reverbDamp` is 0
- **THEN** the wet signal retains full high-frequency content throughout the tail decay

#### Scenario: Damp at 1 produces a dark reverb tail

- **WHEN** `reverbOn` is 1, `reverbSend` is greater than 0, and `reverbDamp` is 1
- **THEN** the wet signal has significantly reduced high-frequency content compared to `reverbDamp` at 0

#### Scenario: Increasing damp darkens the reverb tail

- **WHEN** `reverbOn` is 1, `reverbSend` is greater than 0, and `reverbDamp` is increased from 0 to 0.8
- **THEN** the high-frequency content of the reverb tail decreases

#### Scenario: reverbTone parameter is absent

- **WHEN** the DSP is compiled
- **THEN** there is no `reverbTone` parameter in the parameter list

#### Scenario: reverbMix parameter is absent

- **WHEN** the DSP is compiled
- **THEN** there is no `reverbMix` parameter in the parameter list

#### Scenario: fi.lowpass post-filter is absent from the reverb chain

- **WHEN** the DSP is compiled
- **THEN** the reverb wet path does not include a `fi.lowpass` call after `re.mono_freeverb`

#### Scenario: High-pass filter on the send path

- **WHEN** the DSP is compiled
- **THEN** the reverb wet path includes a `fi.highpass(2, 180)` call between the pre-delay line and `re.mono_freeverb`

#### Scenario: Low-frequency content does not enter the reverb tail

- **WHEN** `reverbOn` is 1, `reverbSend` is at maximum (1.0), and the input contains pure low-frequency content below 60 Hz
- **THEN** the reverb tail content below 60 Hz is attenuated by at least 18 dB relative to the input level (corresponding to the 2nd-order 180 Hz high-pass response)

#### Scenario: Pre-delay defaults to 15 ms

- **WHEN** the DSP is compiled with no parameter overrides
- **THEN** `reverbPreDelay` reads as 0.015

#### Scenario: Pre-delay at zero produces no gap before reverb onset

- **WHEN** `reverbOn` is 1, `reverbSend` is greater than 0, and `reverbPreDelay` is 0
- **THEN** the reverb tail begins immediately with the dry signal onset

#### Scenario: Pre-delay above zero introduces a gap before reverb onset

- **WHEN** `reverbOn` is 1, `reverbSend` is greater than 0, and `reverbPreDelay` is 0.05
- **THEN** the reverb tail onset is delayed by approximately 50 ms relative to the dry signal

#### Scenario: Reverb tail rings freely after amp envelope closes

- **WHEN** `reverbOn` is 1, `reverbSend` is greater than 0, and the amp release is short (e.g. 0.05 s)
- **THEN** the reverb tail continues to decay after the VCA closes; tail length is governed by `reverbDecay`

#### Scenario: No shimmer parameter exists

- **WHEN** the DSP is compiled
- **THEN** there is no `reverbShimmer` parameter in the parameter list

---

### Requirement: Reverb UI panel with on/off toggle and four MIDI-learnable knobs

The system SHALL provide reverb controls inside `Effects.svelte`. The reverb section SHALL contain an on/off toggle button (controlling `reverbOn`) and four `Knob` components: `send` (linear, 0–1, default 0.3, param `reverbSend`), `damp` (linear, 0–1, default 0.5, param `reverbDamp`, `showValue={false}`), `decay` (log-reverse, 0.01–1, default 0.5, param `reverbDecay`), and `pre-delay` (linear, 0–0.1 s, default 0.015, param `reverbPreDelay`). The `mix` knob (param `reverbMix`) SHALL NOT be present. The `LPF` knob (param `reverbTone`) SHALL NOT be present. The `damp` knob SHALL NOT display a value label. The toggle SHALL use the existing amber active / grey inactive button style. The four knobs SHALL participate in the MIDI CC learn workflow via `midiState` and `onknobcontextmenu` props. The `reverbOn` toggle SHALL NOT be MIDI-learnable. The `reverbShimmer` knob SHALL NOT be present. No CSS rule SHALL target a fixed width on a reverb knob value element.

#### Scenario: Toggle defaults to off

- **WHEN** the Effects panel is rendered with no external state
- **THEN** the reverb toggle displays "off" and `reverbOn` is 0

#### Scenario: Toggle sends reverbOn param on activation

- **WHEN** the reverb toggle is clicked from the off state
- **THEN** `onchange` is called with `{ param: 'reverbOn', value: 1 }`

#### Scenario: Toggle sends reverbOn param on deactivation

- **WHEN** the reverb toggle is clicked from the on state
- **THEN** `onchange` is called with `{ param: 'reverbOn', value: 0 }`

#### Scenario: Send knob defaults to 0.3

- **WHEN** the Effects panel is rendered with no external state
- **THEN** the send knob displays a value of 0.3

#### Scenario: Send knob is labelled "send"

- **WHEN** the Effects panel is rendered
- **THEN** the first reverb knob's label reads "send"

#### Scenario: Mix knob is absent

- **WHEN** the Effects panel is rendered
- **THEN** no knob labelled "mix" is present in the reverb section

#### Scenario: Damp knob defaults to 0.5

- **WHEN** the Effects panel is rendered with no external state
- **THEN** the damp knob position corresponds to 0.5

#### Scenario: Damp knob does not display a numeric value label

- **WHEN** the Effects panel is rendered
- **THEN** the damp knob value element is not visible

#### Scenario: LPF knob is absent

- **WHEN** the Effects panel is rendered
- **THEN** no knob labelled "LPF" is present in the reverb section

#### Scenario: Decay knob defaults to 0.5

- **WHEN** the Effects panel is rendered with no external state
- **THEN** the decay knob displays a value of 0.5

#### Scenario: Pre-delay knob defaults to 0.015

- **WHEN** the Effects panel is rendered with no external state
- **THEN** the pre-delay knob displays a value of 0.015

#### Scenario: Knob change dispatches correct param name for send

- **WHEN** the send knob is adjusted
- **THEN** `onchange` is called with `{ param: 'reverbSend', value: <new value> }`

#### Scenario: Knob change dispatches correct param name for damp

- **WHEN** the damp knob is adjusted
- **THEN** `onchange` is called with `{ param: 'reverbDamp', value: <new value> }`

#### Scenario: Knob change dispatches correct param name for pre-delay

- **WHEN** the pre-delay knob is adjusted
- **THEN** `onchange` is called with `{ param: 'reverbPreDelay', value: <new value> }`

#### Scenario: MIDI learn context menu triggers for each knob

- **WHEN** the user right-clicks any of the four reverb knobs
- **THEN** `onknobcontextmenu` is called with the corresponding param name (`reverbSend`, `reverbDamp`, `reverbDecay`, or `reverbPreDelay`)

#### Scenario: Shimmer knob is absent

- **WHEN** the Effects panel is rendered
- **THEN** no knob labelled "shimmer" is present in the reverb section

---

### Requirement: Reverb parameters registered in MIDI CC map

The system SHALL register `reverbSend` (0–1), `reverbDecay` (0.01–1), `reverbDamp` (0–1), and `reverbPreDelay` (0–0.1) in the `KNOB_PARAMS` registry in `App.svelte` and in `midiCcMap.js`. `reverbMix` SHALL NOT be present in either registry. `reverbTone` SHALL NOT be present in either registry. `reverbShimmer` SHALL NOT be present. `reverbOn` SHALL NOT be registered.

#### Scenario: Reverb send responds to assigned MIDI CC

- **WHEN** a MIDI CC is assigned to `reverbSend` and a CC message is received
- **THEN** `reverbSend` is updated by the engine via the standard CC routing path

#### Scenario: Reverb damp responds to assigned MIDI CC

- **WHEN** a MIDI CC is assigned to `reverbDamp` and a CC message is received
- **THEN** `reverbDamp` is updated by the engine via the standard CC routing path

#### Scenario: Reverb pre-delay responds to assigned MIDI CC

- **WHEN** a MIDI CC is assigned to `reverbPreDelay` and a CC message is received
- **THEN** `reverbPreDelay` is updated by the engine via the standard CC routing path

#### Scenario: reverbMix is absent from the CC map

- **WHEN** the MIDI CC map is inspected
- **THEN** there is no entry for `reverbMix`

#### Scenario: reverbTone is absent from the CC map

- **WHEN** the MIDI CC map is inspected
- **THEN** there is no entry for `reverbTone`

#### Scenario: reverbShimmer is absent from the CC map

- **WHEN** the MIDI CC map is inspected
- **THEN** there is no entry for `reverbShimmer`

## ADDED Requirements

### Requirement: MIDI CC assignments persisted under `reverbMix` are translated to `reverbSend` on load

To preserve MIDI CC mappings learned under the prior `reverbMix` parameter name, `MidiCcMap#load()` in `src/audio/midiCcMap.js` SHALL translate persisted assignments whose stored `param` field is `"reverbMix"` into in-memory entries with `param: "reverbSend"`. The underlying `localStorage` entry SHALL NOT be rewritten by this translation. After translation, both `MidiCcMap#resolve(cc)` for the original CC and `MidiCcMap#getAssignedCc('reverbSend')` SHALL behave as if the assignment had originally been made under the new name.

This translation is rollback-safe: if the change is reverted, the unchanged `localStorage` entry is read by the prior code as `reverbMix` and continues to work without further migration.

#### Scenario: Stored reverbMix entry is loaded as reverbSend

- **WHEN** `localStorage` contains an entry with key `midiCc:42` and value `{"param":"reverbMix","min":0,"max":1}`, and a new `MidiCcMap` is constructed
- **THEN** `resolve(42)` returns `{ param: 'reverbSend', min: 0, max: 1 }` and `getAssignedCc('reverbSend')` returns `42`

#### Scenario: Translation does not rewrite localStorage

- **WHEN** `localStorage` contains a `reverbMix` entry, a new `MidiCcMap` is constructed, and no further `assign()` calls are made for the corresponding CC or for `reverbSend`
- **THEN** the `localStorage` entry remains unchanged (still under the same key, still with `param: "reverbMix"`)

#### Scenario: Stored reverbSend entry loads unchanged

- **WHEN** `localStorage` contains an entry whose `param` is `"reverbSend"` and a new `MidiCcMap` is constructed
- **THEN** `resolve(...)` returns the entry unchanged with `param: 'reverbSend'`
