# Knob

## Purpose

Provides a reusable SVG rotary knob Svelte component for all synthesizer parameter controls. The knob supports vertical drag interaction with logarithmic or linear value curves, shift-key fine mode, double-click reset, and a formatted value label display.
## Requirements
### Requirement: SVG rotary knob with drag control

The system SHALL provide a reusable Svelte `Knob` component rendered as SVG. The knob SHALL display a circular track arc and a line indicator showing the current value. Dragging vertically SHALL change the knob value: upward drag increases value, downward drag decreases.

#### Scenario: Drag increases value

- **WHEN** user drags upward on a knob
- **THEN** the knob value increases and the indicator rotates clockwise

#### Scenario: Drag decreases value

- **WHEN** user drags downward on a knob
- **THEN** the knob value decreases and the indicator rotates counter-clockwise

#### Scenario: Value clamped at limits

- **WHEN** drag would move value beyond min or max
- **THEN** value stops at the limit and indicator does not move past the endpoint

---

### Requirement: Per-parameter logarithmic or linear value curve

Each knob instance SHALL accept a `scale` prop (`"log"` or `"linear"`). Logarithmic knobs SHALL map normalized drag position to value as `value = min * (max/min)^pos`. Linear knobs SHALL map as `value = min + (max - min) * pos`.

#### Scenario: Log knob midpoint

- **WHEN** a logarithmic knob with min=20, max=20000 is at normalized position 0.5
- **THEN** displayed value is approximately 632Hz (geometric mean)

#### Scenario: Linear knob midpoint

- **WHEN** a linear knob with min=0, max=1 is at normalized position 0.5
- **THEN** displayed value is 0.5

---

### Requirement: Shift key fine mode

The system SHALL reduce drag sensitivity by 10× while the Shift key is held, enabling precise adjustments.

#### Scenario: Fine mode active

- **WHEN** user holds Shift and drags the knob
- **THEN** the same pixel distance produces 1/10th the value change compared to normal drag

---

### Requirement: Double-click reset to default

The system SHALL reset a knob to its default value when the user double-clicks it.

#### Scenario: Double-click resets

- **WHEN** user double-clicks a knob that has been adjusted away from default
- **THEN** knob snaps to its default value and the indicator moves to the default position

---

### Requirement: Value label display

Each knob SHALL display its current value below the SVG graphic with appropriate units (Hz, ms, %, etc.) as a formatted string. For Hz values, the formatting SHALL depend on magnitude:
- Values ≥ 1 000 Hz: display in kHz with one decimal place (e.g., "1.2 kHz")
- Values ≥ 10 Hz and < 1 000 Hz: display as a whole number (e.g., "440 Hz")
- Values > 0 Hz and < 10 Hz: display with two decimal places (e.g., "0.10 Hz", "9.90 Hz")

#### Scenario: Frequency knob label above 1 kHz

- **WHEN** cutoff knob is set to 1200 Hz
- **THEN** label reads "1.2 kHz"

#### Scenario: Frequency knob label in mid range

- **WHEN** cutoff knob is set to 440 Hz
- **THEN** label reads "440 Hz"

#### Scenario: Frequency knob label below 10 Hz shows two decimals

- **WHEN** an LFO rate knob is set to 0.1 Hz
- **THEN** label reads "0.10 Hz" (not "0 Hz")

#### Scenario: Frequency knob label at 9.9 Hz shows two decimals

- **WHEN** an LFO rate knob is set to 9.9 Hz
- **THEN** label reads "9.90 Hz" (not "10 Hz")

#### Scenario: Time knob label

- **WHEN** attack knob is set to 250ms
- **THEN** label reads "250 ms"

---

### Requirement: Tick labels match knob label colour

Tick labels rendered inside the knob SVG SHALL use the same colour as the knob label text (`#e8dcc8`), so that all text labels in a knob group are visually consistent.

#### Scenario: Tick labels are cream-coloured

- **WHEN** the filter mode knob renders its LP, BP, and HP tick labels
- **THEN** each tick label is displayed in colour `#e8dcc8`

#### Scenario: Tick label colour matches knob label colour

- **WHEN** comparing a tick label colour to the CUTOFF or RES knob label colour
- **THEN** both colours are identical (`#e8dcc8`)

---

### Requirement: External value update from MIDI CC

The knob SHALL accept an `externalValue` prop. When `externalValue` changes, the knob SHALL snap to that value without affecting pointer drag state (i.e., an in-progress drag is not interrupted, but the next drag starts from the new value).

#### Scenario: CC drives knob position

- **WHEN** a MIDI CC message is received for a mapped parameter and `externalValue` is updated
- **THEN** the knob indicator moves to reflect the new value and the `onchange` callback fires with the scaled value

#### Scenario: Drag not interrupted by CC

- **WHEN** a pointer drag is in progress and a CC message arrives
- **THEN** the ongoing drag continues to control the knob; the CC value is applied after the drag ends

---

### Requirement: MIDI learn mode visual state

The knob SHALL accept a `learningMidi` boolean prop. When `true`, the knob SHALL display a pulsing amber highlight ring around its SVG track to indicate it is awaiting a CC assignment.

#### Scenario: Learn mode highlight shown

- **WHEN** `learningMidi` is `true`
- **THEN** a pulsing amber ring is visible around the knob track

#### Scenario: Learn mode highlight removed

- **WHEN** `learningMidi` changes from `true` to `false`
- **THEN** the pulsing ring is removed and the knob returns to its normal appearance

---

### Requirement: Assigned CC number label

When a knob has a registered MIDI CC mapping, it SHALL display the assigned CC number as a small label (e.g., "CC 74") beneath the value label, styled in a subdued colour so it does not compete with the parameter value.

#### Scenario: CC label shown when mapped

- **WHEN** a knob has a CC mapping (e.g., CC 74)
- **THEN** "CC 74" is displayed beneath the value label in a muted colour

#### Scenario: CC label hidden when no mapping

- **WHEN** a knob has no CC mapping
- **THEN** no CC label is shown

---

### Requirement: Arc suppression via showArc prop

The `Knob` component SHALL accept a `showArc` boolean prop (default `true`). When `false`, the colored active arc SHALL NOT be rendered. The grey background track arc SHALL remain visible regardless of `showArc`.

#### Scenario: Arc hidden when showArc is false

- **WHEN** a `Knob` is rendered with `showArc={false}`
- **THEN** no colored arc element is present in the SVG output

#### Scenario: Track visible when showArc is false

- **WHEN** a `Knob` is rendered with `showArc={false}`
- **THEN** the grey track arc is still rendered at full sweep

#### Scenario: Arc shown by default

- **WHEN** a `Knob` is rendered without a `showArc` prop
- **THEN** the colored active arc is present in the SVG output

---

### Requirement: Bipolar arc from sweep center via bipolar prop

The `Knob` component SHALL accept a `bipolar` boolean prop (default `false`). When `true`, the active arc SHALL be drawn from the 12 o'clock position (the midpoint of the total sweep) to the current indicator position, rather than from the sweep start. For values above the midpoint the arc SHALL extend clockwise; for values below the midpoint the arc SHALL extend counter-clockwise; at exactly the midpoint no arc SHALL be drawn.

#### Scenario: Positive bipolar value arcs clockwise from center

- **WHEN** a `Knob` with `bipolar={true}` has a normalized position greater than 0.5
- **THEN** the arc extends clockwise from 12 o'clock to the indicator position

#### Scenario: Negative bipolar value arcs counter-clockwise from center

- **WHEN** a `Knob` with `bipolar={true}` has a normalized position less than 0.5
- **THEN** the arc extends counter-clockwise from 12 o'clock to the indicator position

#### Scenario: Zero bipolar value renders no arc

- **WHEN** a `Knob` with `bipolar={true}` has a normalized position of exactly 0.5
- **THEN** no arc is drawn

#### Scenario: Non-bipolar knob arc unaffected

- **WHEN** a `Knob` is rendered without `bipolar` prop (or with `bipolar={false}`)
- **THEN** the arc sweeps from the 7 o'clock start position to the indicator as before

### Requirement: Spring animation on external value changes
The Knob component SHALL animate its visual indicator and arc smoothly to a new position when the value changes via the `externalValue` prop (MIDI CC input or reset). The animation SHALL use a spring with tuned stiffness and damping so the sweep completes in approximately 400–600ms. During pointer drag the spring SHALL be bypassed entirely — the visual position SHALL track the pointer directly with no lag. The logical value (reported via `onchange`) SHALL update immediately on any value change, independent of the visual animation.

#### Scenario: Knob springs to new external value
- **WHEN** the externalValue prop changes (e.g., from a power-on reset)
- **THEN** the knob indicator and arc animate smoothly to the new position over approximately 400–600ms

#### Scenario: No spring lag during drag
- **WHEN** the user drags the knob
- **THEN** the visual indicator tracks the pointer position directly with no spring delay

#### Scenario: onchange fires immediately regardless of animation
- **WHEN** externalValue changes
- **THEN** onchange is called with the new value immediately, before the spring animation completes

### Requirement: springEnabled prop controls indicator animation on external value changes

The `Knob` component SHALL accept a `springEnabled` boolean prop (default `false`). When `springEnabled` is `false`, all calls to `springPos.set()` triggered by `externalValue` changes SHALL use `{ instant: true }`, snapping the indicator to the new position immediately. When `springEnabled` is `true`, `springPos.set()` SHALL animate naturally via the configured spring parameters. The `springEnabled` prop SHALL NOT affect drag interaction — drag always snaps the indicator instantly regardless of `springEnabled`.

#### Scenario: External value snaps instantly when springEnabled is false

- **WHEN** a `Knob` receives an updated `externalValue` and `springEnabled` is `false`
- **THEN** the visual indicator moves to the new position instantly without spring animation

#### Scenario: External value animates when springEnabled is true

- **WHEN** a `Knob` receives an updated `externalValue` and `springEnabled` is `true`
- **THEN** the visual indicator animates to the new position via the Svelte spring store

#### Scenario: Drag always instant regardless of springEnabled

- **WHEN** the user drags a knob while `springEnabled` is `true`
- **THEN** the visual indicator tracks the drag position instantly (no spring lag)

#### Scenario: springEnabled defaults to false

- **WHEN** a `Knob` is rendered without a `springEnabled` prop
- **THEN** external value changes snap the indicator instantly (spring is inactive)

### Requirement: Opt-in interval indicator slot above the value label

The `Knob` component SHALL accept an `intervalIndicator` boolean prop (default `false`). When `true`, the component SHALL render a text indicator slot between the SVG body and the value label. The slot SHALL occupy fixed vertical space whether or not it currently displays text, so that knob layout does not jump as the displayed interval changes. The indicator content SHALL be derived from the current knob value via the `detectInterval(cents)` helper in `src/audio/math.js`, which SHALL return one of `"m3"`, `"M3"`, `"P5"`, or `null`. When `null`, the slot SHALL be visually blank. The mapping from value to interval SHALL be:

- `|cents| ∈ [285, 315]` → `"m3"` (target ±300¢, ±15¢ window)
- `|cents| ∈ [385, 415]` → `"M3"` (target ±400¢, ±15¢ window)
- `|cents| ∈ [685, 700]` → `"P5"` (target +700¢ window clipped at slider maximum; symmetric for −700¢)
- otherwise → `null`

The indicator SHALL be opt-in so existing knobs without the prop continue to render with no additional vertical space and no behavior change.

#### Scenario: Indicator absent by default
- **WHEN** a `Knob` is rendered without an `intervalIndicator` prop (or with `intervalIndicator={false}`)
- **THEN** no interval slot is rendered and the layout is identical to the prior single-column knob layout

#### Scenario: Indicator slot present and blank when value is outside windows
- **WHEN** a `Knob` is rendered with `intervalIndicator={true}` and value = 0 cents
- **THEN** the interval slot is present in the DOM but visually blank
- **AND** the value label below the slot is unchanged in position

#### Scenario: Indicator lights at minor third
- **WHEN** an `intervalIndicator={true}` knob value is set to +300 cents
- **THEN** the indicator slot displays `m3`

#### Scenario: Indicator lights at major third — symmetric
- **WHEN** an `intervalIndicator={true}` knob value is set to −400 cents
- **THEN** the indicator slot displays `M3`

#### Scenario: Indicator lights at perfect fifth at travel limit
- **WHEN** an `intervalIndicator={true}` knob value is set to +700 cents
- **THEN** the indicator slot displays `P5`

#### Scenario: Indicator latches inside the ±15¢ window
- **WHEN** an `intervalIndicator={true}` knob value is set to +413 cents (within +400 ± 15)
- **THEN** the indicator slot displays `M3`

#### Scenario: Indicator does not latch outside the ±15¢ window
- **WHEN** an `intervalIndicator={true}` knob value is set to +420 cents (outside +400 ± 15)
- **THEN** the indicator slot is blank

### Requirement: Drag step quantization with optional fine step

The `Knob` component SHALL accept an optional `step` numeric prop and an optional `fineStep` numeric prop. When `step` is provided, drag-induced value changes SHALL be quantized to the nearest multiple of `step`. When the Shift key is held during drag and `fineStep` is also provided, the active step SHALL be `fineStep` for the duration of the modifier press. When neither prop is set the knob SHALL behave as today (continuous value, no quantization). Step quantization SHALL apply to the *logical* value reported via `onchange`; the existing Shift-fine sensitivity reduction (10× pixels-per-unit) SHALL remain in effect independently of the step grid.

Quantization SHALL apply to drag input. The double-click reset path SHALL assign `defaultValue` directly without quantization (callers are responsible for choosing a default value that aligns with their step grid; for the freq knobs `defaultValue=0` aligns with every multiple). Values arriving via the `externalValue` MIDI/automation path SHALL NOT be re-quantized inside the knob — upstream sources are expected to respect the underlying parameter's own step (e.g. the FAUST hslider step).

#### Scenario: No step prop preserves continuous behavior
- **WHEN** a `Knob` is rendered without a `step` prop
- **THEN** drag updates report the raw continuous value with no quantization, exactly as today

#### Scenario: Step prop quantizes drag values
- **WHEN** a `Knob` is rendered with `step={5}` and dragged from rest
- **THEN** every value reported via `onchange` is an integer multiple of 5

#### Scenario: Shift switches to fine step
- **WHEN** a `Knob` with `step={5}` and `fineStep={1}` is dragged while the Shift key is held
- **THEN** every value reported via `onchange` is an integer multiple of 1
- **AND** the existing 10× sensitivity reduction continues to apply

#### Scenario: Releasing Shift mid-drag returns to coarse step
- **WHEN** the user begins a Shift-held drag on a `step={5}, fineStep={1}` knob, then releases Shift mid-drag
- **THEN** subsequent drag updates report values quantized to multiples of 5 again

### Requirement: Semitone value-label format

The `formatValue(value, unit)` helper in `src/audio/math.js` SHALL accept a `unit` argument of `"st"` (semitones). When the unit is `"st"`, the helper SHALL treat the supplied value as cents and SHALL return the value divided by 100, formatted to two decimal places, with the suffix ` st` (e.g. `−6.50 st`, `0.00 st`, `7.00 st`).

#### Scenario: Semitone format converts cents to semitones
- **WHEN** `formatValue(−650, "st")` is called
- **THEN** the result is `"−6.50 st"`

#### Scenario: Semitone format at zero
- **WHEN** `formatValue(0, "st")` is called
- **THEN** the result is `"0.00 st"`

#### Scenario: Semitone format at full range
- **WHEN** `formatValue(700, "st")` is called
- **THEN** the result is `"7.00 st"`

#### Scenario: Semitone format does not affect existing units
- **WHEN** `formatValue` is called with units `"Hz"`, `"ms"`, `"%"`, or `"c"`
- **THEN** the existing formatting behavior is preserved unchanged
