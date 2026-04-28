# Clip LED

## Purpose

Provides a small circular LED indicator component that monitors an audio peak level and lights bright red when the signal exceeds 1.0 (clipping). Used in panel headers to give the user at-a-glance feedback about signal saturation at the mixer output and master output stages.

## Requirements

### Requirement: ClipLed component renders a single circular LED indicator

The system SHALL provide a `ClipLed.svelte` component that renders a single small circular LED element. The component SHALL accept two props: `getPeak` (a function returning a `number`, defaulting to `() => 0`) and `powered` (a `boolean`, defaulting to `false`). The LED SHALL be 8×8 px, rendered as a `<div>` with `border-radius: 50%`.

#### Scenario: LED renders in dark state when not clipping

- **WHEN** the peak value returned by `getPeak` is 1.0 or below
- **THEN** the LED displays dim red (`#4a1010`) indicating the indicator is present but not triggered

#### Scenario: LED renders bright red when clipping

- **WHEN** the peak value returned by `getPeak` exceeds 1.0
- **THEN** the LED displays bright red (`#ff3333`)

#### Scenario: LED is always visible

- **WHEN** the component is mounted regardless of peak value
- **THEN** the LED element is present in the DOM with a visible colour (never transparent or display:none)

### Requirement: ClipLed polls peak on every animation frame while powered

The component SHALL call `getPeak()` on every `requestAnimationFrame` callback while `powered` is `true`. When `powered` is `false` the rAF loop SHALL be cancelled and the LED SHALL display the dark state without calling `getPeak()`.

#### Scenario: Polling starts when powered becomes true

- **WHEN** `powered` transitions to `true`
- **THEN** the rAF loop begins and the LED updates each frame

#### Scenario: Polling stops when powered becomes false

- **WHEN** `powered` transitions to `false`
- **THEN** the rAF loop is cancelled and the LED returns to dark state without further `getPeak()` calls

#### Scenario: rAF and setTimeout are cancelled on component destroy

- **WHEN** the component is unmounted
- **THEN** any pending `requestAnimationFrame` handle and any pending latch `setTimeout` are cancelled

### Requirement: ClipLed latches the clip state for 1.5 seconds

When the peak exceeds 1.0 the LED SHALL latch in the bright red state for 1.5 seconds from the most recent clip frame. Each subsequent clip frame resets the latch timer. When no clip frame occurs for 1.5 seconds the LED returns to the dark state.

#### Scenario: Single transient clip latches for 1.5 s

- **WHEN** a single frame returns `getPeak() > 1.0` and no further clips occur
- **THEN** the LED remains bright red for 1.5 s then returns to dark

#### Scenario: Sustained clipping keeps LED lit

- **WHEN** `getPeak()` returns above 1.0 on consecutive frames
- **THEN** the LED remains bright red continuously; the latch timer resets on each clip frame

#### Scenario: Latch clears after 1.5 s of no clipping

- **WHEN** clipping stops and 1.5 s elapses without another clip frame
- **THEN** the LED transitions to dark state

### Requirement: ClipLed is embedded right-aligned in the output panel label row

The `AmpEnv.svelte` component (the "output" panel) SHALL promote its `<span class="panel-label">output</span>` to a `.panel-header` flex row using the same structure as the mixer panel. A `ClipLed` SHALL be placed right-aligned in that row, receiving `getOutputPeak` (bound to the engine's `getOutputPeak()` function) and `powered` props. `AmpEnv.svelte` SHALL accept `getOutputPeak: () => number` (default `() => 0`) and `powered: boolean` (default `false`) as new props.

#### Scenario: Output panel header contains the clip LED

- **WHEN** the output panel is rendered
- **THEN** the panel label row contains both the "OUTPUT" text and a single circular LED element right-aligned

#### Scenario: Output LED lights when master output saturates

- **WHEN** the pre-master-tanh intermediate signal (`vcaOut × masterVol / 0.6`) exceeds 1.0
- **THEN** the output LED displays bright red and latches for 1.5 s

#### Scenario: Output LED goes dark when synth is powered off

- **WHEN** the synth is powered off
- **THEN** the output LED returns to dim red and polling stops
