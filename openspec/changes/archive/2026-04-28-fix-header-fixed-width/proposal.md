## Why

The header strip (containing the SYNTH-D label and power button) stretches to fill the full viewport width because `.app` is an unconstrained block container. The synth panel below it is content-sized, so as the window grows the header becomes a visually disconnected floating bar with no relationship to the panel beneath it.

## What Changes

- Constrain `.app` to `width: fit-content` so the header and synth panel share the same horizontal footprint.
- The header's existing `20px` horizontal padding and the `main` area's existing `8px` padding produce a natural `12px` symmetric overhang of the header beyond the panel edges on both sides — no new values need to be introduced.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `synth-ui`: The header strip requirement is updated to specify that the header has a fixed, content-driven width and that its left and right edges overhang the panel grid below by equal amounts.

## Impact

- `src/App.svelte` — add `width: fit-content` (or `max-content`) to `.app` CSS rule.
- No API, DSP, or behavioral changes.
- No new dependencies.
