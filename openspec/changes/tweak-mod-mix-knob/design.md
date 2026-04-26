## Context

The modulation mix knob in `Modulation.svelte` blends between LFO and Noise as modulation sources. It is rendered using the shared `Knob` component, which already supports:

- `showValue` prop to hide/show the numeric value label
- `ticks` prop to place SVG text labels at positions around the arc (used elsewhere for range markers)
- `bipolar` prop to switch the arc highlight from "start to current" to "center to current"

The `bipolarArcPath` function in `Knob.svelte` anchors its highlight at `pos=0.5` of the normalized sweep, which corresponds to the 12 o'clock position — exactly the neutral center-mix point. No changes to `Knob.svelte` are needed.

## Goals / Non-Goals

**Goals:**
- Remove the value label from the mod mix knob
- Add "LFO" and "NOISE" labels at the arc endpoints
- Change arc highlight to span from indicator tip to 12 o'clock

**Non-Goals:**
- Changing the knob's value range or default
- Modifying `Knob.svelte` (changes are prop-only)
- Changing any other knob in the UI

## Decisions

**Use `bipolar={true}` for the arc highlight anchor**

The `bipolarArcPath` function already implements "highlight from center to current position." The center (pos=0.5) coincides exactly with 12 o'clock on this knob (225° + 135° = 360° = top). No new code path is needed. Alternative considered: a new `arcAnchor` prop on `Knob` — rejected as overengineering for a case where `bipolar` already models the intended behavior.

**Use `ticks` prop for arc-endpoint labels**

The existing `ticks` mechanism renders SVG `<text>` elements at arc positions using `polarToXY`. Positioning at `pos=0` (LFO, lower-left) and `pos=1` (NOISE, lower-right) places labels at the arc endpoints. The SVG has `overflow: visible` so labels outside the 48×48 viewBox render correctly. Alternative considered: wrapping text in the parent component layout — rejected because `ticks` keeps label geometry tied to the knob's own coordinate system.

**Use `showValue={false}` rather than removing the value span**

The `showValue` prop already exists and simply applies `visibility: hidden` rather than removing the element, preserving layout stability. No DOM structure changes needed.

## Risks / Trade-offs

- "NOISE" at `pos=1` is 9 characters at 7px — may be tight at small knob sizes. The knob size in the modulation panel is standard (48px SVG body), and `overflow: visible` gives it room. → Acceptable; verify visually.
- `bipolar={true}` on a knob with `default={0}` means the arc highlights a large span at rest (from pos=0 all the way to 12 o'clock). This is intentional and communicates clearly how far from center the current mix sits.
