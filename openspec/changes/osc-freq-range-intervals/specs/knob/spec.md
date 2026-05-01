## ADDED Requirements

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
