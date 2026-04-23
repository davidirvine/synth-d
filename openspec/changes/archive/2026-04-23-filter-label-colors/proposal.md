## Why

The LP, BP, HP tick labels on the filter mode knob are styled with a dim grey (`#555`), while the CUTOFF and RES knob labels use the warm cream colour (`#e8dcc8`) that matches the rest of the panel typography. This visual inconsistency makes the filter mode options harder to read and breaks the colour cohesion of the filter panel.

## What Changes

- Update `.tick-label` fill colour in `Knob.svelte` from `#555` to `#e8dcc8` so LP/BP/HP labels match the CUTOFF and RES label colour.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `knob`: Tick label colour changes from dim grey to cream to match knob label colour.

## Impact

- `src/components/Knob.svelte` — single CSS property change to `.tick-label { fill }`.
- Visual only; no behaviour, API, or test-logic changes.
