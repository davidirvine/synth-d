## Why

The filter mode knob's colored active arc is meaningless for a discrete selector — it implies a continuous range from zero when the parameter is categorical (LP/BP/HP). The filter env amount knob's arc also starts from the wrong origin: an amount centered at zero should visually read from 12 o'clock outward, not from the 7 o'clock start position.

## What Changes

- **Filter mode knob**: suppress the colored arc that sweeps from the start position to the indicator; keep the outer grey track arc unchanged
- **Filter env amount knob**: draw the active arc from 12 o'clock (the center of the sweep) outward to the indicator in whichever direction the value deviates from zero

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `knob`: add `showArc` prop (hides the active arc while keeping the track) and `bipolar` prop (draws the arc from the sweep center rather than the start)

## Impact

- `src/components/Knob.svelte` — new props + updated arc rendering logic
- `src/components/Filter.svelte` — pass `showArc={false}` to the mode knob
- `src/components/FilterEnv.svelte` — pass `bipolar={true}` to the amount knob
- `src/components/Knob.test.js` — new tests for both props
- `openspec/specs/knob/spec.md` — delta spec for the two new requirements
