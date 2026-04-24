## Context

The `Knob` component renders a colored active arc that sweeps from the 7 o'clock start position clockwise to the indicator. This works for continuous parameters (cutoff, resonance, attack, decay) but is incorrect for two specific knobs:

- **Filter mode knob** — a discrete selector (LP / BP / HP). The arc implies a continuous range from a zero baseline, which is misleading.
- **Filter env amount knob** — a bipolar parameter centered at zero (-10000 to +10000 Hz). The arc should read from 12 o'clock outward rather than from 7 o'clock, so positive and negative deviation are visually symmetric.

No mechanism currently exists to suppress the arc or change its sweep origin.

## Goals / Non-Goals

**Goals:**
- Add a `showArc` prop to `Knob` that suppresses the colored active arc while preserving the grey track
- Add a `bipolar` prop to `Knob` that draws the active arc from the midpoint of the sweep (12 o'clock) rather than from the start
- Apply `showArc={false}` to the filter mode knob in `Filter.svelte`
- Apply `bipolar={true}` to the filter env amount knob in `FilterEnv.svelte`

**Non-Goals:**
- Changing the arc color or stroke width
- Modifying any other knob's behavior
- Supporting a custom arc origin angle beyond the center

## Decisions

### `showArc` prop (boolean, default `true`)

When `false`, the `<path class="arc">` element is not rendered. The grey `<path class="track">` is always rendered regardless.

_Alternative considered_: A CSS class toggle. Rejected — the element would still exist in the DOM and be invisible, not absent. Conditional rendering is cleaner and matches the existing `learningMidi` conditional pattern.

### `bipolar` prop (boolean, default `false`)

When `true`, a new `bipolarArcPath(pos)` function computes the arc. The center of the knob sweep is at `START_ANGLE + 0.5 * SWEEP = 360°` which is exactly 12 o'clock. The arc logic:

- `pos > 0.5`: draw a clockwise arc from center to indicator (positive deviation)
- `pos < 0.5`: draw a clockwise arc from indicator to center (negative deviation, visually counterclockwise from center)
- `|pos − 0.5| < 0.001`: return empty string (no arc at dead center)

The large-arc-flag is set when the angular span exceeds 180°.

_Alternative considered_: A generic `arcOrigin` numeric prop. Rejected — the only real use case is centering, and a boolean is simpler to document and test.

### No change to the `showValue` / `showLabel` props

The mode knob already uses `showLabel={false}` and `showValue={false}`. These props are orthogonal and unchanged.

## Risks / Trade-offs

- [Bipolar arc at exact center renders no arc] → Acceptable; a 0 Hz amount knob has no meaningful deviation to show. The indicator line still points to 12 o'clock.
- [Large negative amounts sweep more than 180°] → Handled by the large-arc-flag in `bipolarArcPath`.
