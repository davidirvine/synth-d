## ADDED Requirements

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

The Effects panel delay sub-section SHALL contain two rows. The first row is unchanged: `time`, `feedback`, `mix` knobs. A second row SHALL appear immediately below it containing a **MOD** on/off toggle button followed by two `Knob` components: **rate** (param `delayModRate`, range 0.1–10 Hz, default 0.5, log scale, unit "Hz") and **depth** (param `delayModDepth`, range 0–0.025 s, default 0, linear scale, unit "s"). The MOD toggle SHALL use the same visual style as the existing delay and reverb on/off toggles (amber active, grey inactive). `delayModOn` is not MIDI-learnable. Both knobs SHALL participate in the MIDI CC learn workflow.

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
