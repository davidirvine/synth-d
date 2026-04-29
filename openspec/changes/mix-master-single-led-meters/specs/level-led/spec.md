## ADDED Requirements

### Requirement: LevelLed component renders a single circular LED with continuous color mapping

The system SHALL provide a `LevelLed.svelte` component that renders a single small circular LED element. The component SHALL accept two props: `getPeak` (a function returning a `number`, defaulting to `() => 0`) and `powered` (a `boolean`, defaulting to `false`). The LED SHALL be 8×8 px, rendered as a `<div>` with `border-radius: 50%`.

The LED color SHALL map continuously from the peak value to a hue spectrum as follows:

| Peak range | Color   | Approximate hue |
|------------|---------|-----------------|
| 0.0        | dim/off | very dark, no glow |
| 0.0 – 0.5  | green   | hsl ~120        |
| 0.5 – 0.85 | yellow  | hsl ~60         |
| 0.85 – 1.0 | orange  | hsl ~30         |
| > 1.0      | red     | hsl 0, latched  |

#### Scenario: LED is dim when signal is silent

- **WHEN** `getPeak` returns 0.0
- **THEN** the LED displays a very dim neutral state (no visible glow)

#### Scenario: LED is green for low levels

- **WHEN** `getPeak` returns 0.25
- **THEN** the LED displays a green color

#### Scenario: LED is yellow for moderate levels

- **WHEN** `getPeak` returns 0.65
- **THEN** the LED displays a yellow color

#### Scenario: LED is orange approaching clip

- **WHEN** `getPeak` returns 0.9
- **THEN** the LED displays an orange color

#### Scenario: LED is red when clipping

- **WHEN** `getPeak` returns above 1.0
- **THEN** the LED displays bright red

#### Scenario: LED is always present in the DOM

- **WHEN** the component is mounted regardless of peak value
- **THEN** the LED element is present in the DOM (never `display:none`)

### Requirement: LevelLed polls peak on every animation frame while powered

The component SHALL call `getPeak()` on every `requestAnimationFrame` callback while `powered` is `true`. When `powered` is `false` the rAF loop SHALL be cancelled and the LED SHALL display the dim/off state without calling `getPeak()`.

#### Scenario: Polling starts when powered becomes true

- **WHEN** `powered` transitions to `true`
- **THEN** the rAF loop begins and the LED color updates each frame

#### Scenario: Polling stops when powered becomes false

- **WHEN** `powered` transitions to `false`
- **THEN** the rAF loop is cancelled and the LED returns to dim state without further `getPeak()` calls

#### Scenario: rAF and setTimeout are cancelled on component destroy

- **WHEN** the component is unmounted
- **THEN** any pending `requestAnimationFrame` handle and any pending latch `setTimeout` are cancelled

### Requirement: LevelLed latches the red clip state for 1.5 seconds

When the peak exceeds 1.0 the LED SHALL latch in the bright red state for 1.5 seconds from the most recent clip frame. Each subsequent clip frame resets the latch timer. When no clip frame occurs for 1.5 seconds the LED returns to the non-latched color for the current peak level.

#### Scenario: Single transient clip latches for 1.5 s

- **WHEN** a single frame returns `getPeak() > 1.0` and no further clips occur
- **THEN** the LED remains bright red for 1.5 s then returns to the color for the actual peak

#### Scenario: Sustained clipping keeps LED red

- **WHEN** `getPeak()` returns above 1.0 on consecutive frames
- **THEN** the LED remains bright red continuously; the latch timer resets on each clip frame

#### Scenario: Latch clears after 1.5 s of no clipping

- **WHEN** clipping stops and 1.5 s elapses without another clip frame
- **THEN** the LED transitions to the color matching the current non-clip peak level

### Requirement: LevelLed is used in both the mixer and output panel headers

The `Mixer.svelte` component SHALL use `LevelLed` (not `ClipLed`) in its `panel-header` row, receiving `getPeak` bound to `getMixerPeak` and `powered`. The `AmpEnv.svelte` component SHALL use `LevelLed` (not `ClipLed`) in its `panel-header` row, receiving `getPeak` bound to `getOutputPeak` and `powered`. The prop interface at call sites is unchanged.

#### Scenario: Mixer panel header contains the level LED

- **WHEN** the mixer panel is rendered
- **THEN** the panel label row contains both the "MIXER" text and a single circular LED element right-aligned

#### Scenario: Output panel header contains the level LED

- **WHEN** the output panel is rendered
- **THEN** the panel label row contains both the "OUTPUT" text and a single circular LED element right-aligned

#### Scenario: Mixer LED reflects pre-filter signal level

- **WHEN** the mixer output is at moderate level (e.g. 0.4 linear)
- **THEN** the mixer LED displays a green color

#### Scenario: Output LED reflects post-VCA signal level

- **WHEN** the output signal is approaching clip (e.g. 0.9 linear)
- **THEN** the output LED displays an orange color
