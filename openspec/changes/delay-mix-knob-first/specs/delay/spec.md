## MODIFIED Requirements

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
