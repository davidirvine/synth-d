## Context

The filter mode knob in `src/components/Knob.svelte` renders LP/BP/HP tick labels as SVG `<text>` elements styled by the `.tick-label` CSS class. Currently `.tick-label` uses `fill: #555` (dim grey). The `.knob-label` class used by CUTOFF and RES uses `color: #e8dcc8` (warm cream). The single-property fix aligns tick label colour with knob label colour.

## Goals / Non-Goals

**Goals:**
- Make LP, BP, HP tick labels the same colour as CUTOFF and RES labels (`#e8dcc8`).

**Non-Goals:**
- Changing any other visual property (font size, weight, position, opacity).
- Altering tick label behaviour on any knob other than the filter mode knob.
- Modifying the knob label colour itself.

## Decisions

**Change `.tick-label { fill }` from `#555` to `#e8dcc8`.**

The tick labels are SVG text, so they use the SVG `fill` property rather than CSS `color`. The target value `#e8dcc8` is already the established label colour token used by `.knob-label` throughout the same component; no new colour is introduced.

## Risks / Trade-offs

- Any other knob that uses `ticks` will also get cream-coloured tick labels. Currently only the filter mode knob uses ticks, so there is no unintended side-effect. If future knobs need different tick colouring a per-instance prop would be required — acceptable deferral given current scope.
