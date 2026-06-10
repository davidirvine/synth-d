## ADDED Requirements

### Requirement: Mouse scroll-wheel adjusts the knob value

The `Knob` component SHALL adjust its value in response to mouse `wheel` events while the pointer is over the knob (hover-to-scroll; no prior focus or click is required). Scrolling up (negative `deltaY`) SHALL increase the value and scrolling down (positive `deltaY`) SHALL decrease it. Each discrete scroll event SHALL change the value by one quantization step in the direction of `Math.sign(deltaY)`, independent of the event's `deltaY` magnitude, so behaviour is consistent across mice and trackpads. When a `step` prop is set the increment SHALL be one `step`; when the `Shift` key is held and `fineStep` is set the increment SHALL be one `fineStep`; when no `step` is set each notch SHALL move the knob's normalized position by `0.01` (1% of travel), converted to a value via the knob's `scale` (so for a nonlinear `scale` the value-space step varies across travel — this is intended). While a pointer drag is in progress the wheel handler SHALL ignore wheel events — the drag owns the cursor. When the knob's `disabled` prop is `true` the wheel handler SHALL ignore wheel events entirely (matching how a disabled knob ignores drag). The resulting value SHALL be clamped to `[min, max]` and reported via the existing `onchange` callback. The handler SHALL call `preventDefault()` on the wheel event so the page does not scroll.

#### Scenario: Scroll up increases value by one step

- **WHEN** the pointer is over a `Knob` with `step={5}` and the user scrolls up (deltaY < 0)
- **THEN** the value increases by 5 and `onchange` fires with the new value

#### Scenario: Scroll down decreases value by one step

- **WHEN** the pointer is over a `Knob` with `step={5}` and the user scrolls down (deltaY > 0)
- **THEN** the value decreases by 5 and `onchange` fires with the new value

#### Scenario: Shift+scroll uses the fine step

- **WHEN** the pointer is over a `Knob` with `step={5}` and `fineStep={1}` and the user scrolls while holding Shift
- **THEN** the value changes by 1 per scroll notch

#### Scenario: Increment is independent of deltaY magnitude

- **WHEN** two scroll events of different `deltaY` magnitudes but the same sign arrive over a `step={5}` knob
- **THEN** each event changes the value by exactly one step (5), not in proportion to `deltaY`

#### Scenario: Step-less knob uses the 1% default increment

- **WHEN** the user scrolls up one notch over a `Knob` with no `step` prop
- **THEN** the knob's normalized position increases by `0.01` and the value is the scale conversion of that position

#### Scenario: Value clamps at limits

- **WHEN** the user scrolls up on a knob already at its maximum
- **THEN** the value stays at the maximum and does not exceed it

#### Scenario: Page does not scroll while adjusting a knob

- **WHEN** the user scrolls with the pointer over a knob
- **THEN** the wheel event is consumed (default prevented) and the surrounding page does not scroll

#### Scenario: Scroll is ignored during a pointer drag

- **WHEN** a wheel event arrives while a pointer drag of the knob is in progress
- **THEN** the wheel event does not change the value (the drag continues to own the cursor)

#### Scenario: Disabled knob ignores scroll

- **WHEN** a wheel event arrives over a knob whose `disabled` prop is `true`
- **THEN** the value does not change and `onchange` does not fire

### Requirement: Knob exposes ARIA slider semantics

The `Knob` component SHALL expose `role="slider"` with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` reflecting its `min`, `max`, and current value, and SHALL provide `aria-valuetext` carrying the formatted value label, so assistive technology can read and announce the control (matching the on-screen wheels, which already expose slider semantics). The slider SHALL carry an accessible name via `aria-label` set to the knob's `label` (mirroring `Wheel.svelte`), so a screen reader does not announce an unnamed slider. The knob SHALL be keyboard-focusable (`tabindex="0"`) so the slider role is reachable.

#### Scenario: Knob announces its current value

- **WHEN** a `Knob` is rendered with min, max, and a current value
- **THEN** it exposes `role="slider"` with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` set to those values

#### Scenario: Value text reflects the formatted label

- **WHEN** a knob's value changes
- **THEN** `aria-valuetext` is updated to the same formatted string shown in the knob's value label

#### Scenario: Knob is keyboard focusable

- **WHEN** the user tabs through the controls
- **THEN** the knob receives focus (it is in the tab order with `tabindex="0"`)

#### Scenario: Slider has an accessible name

- **WHEN** a knob is rendered with a `label`
- **THEN** its `role="slider"` element exposes `aria-label` equal to that label

### Requirement: Knob responds to arrow and Home/End keys when focused

Because the `Knob` exposes `role="slider"`, it SHALL be operable from the keyboard when focused, per WAI-ARIA slider semantics. `ArrowUp` and `ArrowRight` SHALL increase the value by one increment; `ArrowDown` and `ArrowLeft` SHALL decrease it by one increment. The increment SHALL follow the same rule as scroll: one `step` (or one `fineStep` while `Shift` is held, when set), else `0.01` of normalized travel. `Home` SHALL set the value to `min` and `End` SHALL set it to `max`. Each handled key SHALL clamp to `[min, max]`, fire `onchange`, and call `preventDefault()` so the page does not scroll. Other keys SHALL be ignored, and when the knob's `disabled` prop is `true` all keys SHALL be ignored (no value change, no `onchange`).

#### Scenario: Arrow up increases the value by one step

- **WHEN** a focused `Knob` with `step={5}` receives `ArrowUp`
- **THEN** the value increases by 5 and `onchange` fires

#### Scenario: Arrow down decreases the value by one step

- **WHEN** a focused `Knob` with `step={5}` receives `ArrowDown`
- **THEN** the value decreases by 5 and `onchange` fires

#### Scenario: Shift+arrow uses the fine step

- **WHEN** a focused `Knob` with `step={5}` and `fineStep={1}` receives `ArrowUp` while Shift is held
- **THEN** the value increases by 1

#### Scenario: Home and End jump to the limits

- **WHEN** a focused `Knob` receives `Home`, then `End`
- **THEN** the value is set to `min`, then to `max`

#### Scenario: Arrow key does not scroll the page

- **WHEN** a focused `Knob` receives an arrow key it handles
- **THEN** the event's default is prevented and the surrounding page does not scroll

#### Scenario: Disabled knob ignores keyboard input

- **WHEN** a focused knob whose `disabled` prop is `true` receives an arrow, Home, or End key
- **THEN** the value does not change and `onchange` does not fire
