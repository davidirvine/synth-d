## Context

`PowerButton.svelte` currently accepts two props — `powered` (boolean) and `loading` (boolean) — and maps them to two visual states: an unlit icon when off and an amber icon with glow when on. During loading the button is disabled and rendered at 70% opacity, but the icon color stays the same dark `#3a3a3a` as the off state. There is no distinct visual signal for the loading phase, so users cannot distinguish "off" from "starting up."

The change is confined to a single presentational component with no API surface beyond its existing props. No parent components, stores, or DSP engine code need to change.

## Goals / Non-Goals

**Goals:**

- Map the existing `(powered, loading)` prop combination to three distinct icon colors: orange (off), yellow (loading), green (on)
- Fade smoothly between colors on state transitions using a CSS `stroke` transition (~0.3 s)
- Remove the `opacity: 0.7` disabled-state rule so the yellow loading color stands alone as the signal
- Keep button dimensions, layout, and interaction behavior identical

**Non-Goals:**

- Changing the `powered` / `loading` prop interface
- Adding pulsing, spinning, or keyframe animations during loading
- Altering parent components, stores, or the DSP engine lifecycle

## Decisions

### Decision: CSS class for three-state color instead of inline styles

Map `(powered, loading)` to a single CSS class (`off` / `loading` / `on`) added to the `.power-icon` element. Each class sets `stroke` and `filter`. This avoids conditional inline style bindings and keeps all color values in the `<style>` block where they are easy to audit.

Alternative considered: add a `status` prop computed in the parent. Rejected — the mapping is deterministic from existing props, so computing it inside the component avoids leaking presentation logic upward.

### Decision: Color values

| State   | Stroke             | Filter                             |
| ------- | ------------------ | ---------------------------------- |
| Off     | `#e07820` (orange) | `drop-shadow(0 0 0px transparent)` |
| Loading | `#e0c020` (yellow) | `drop-shadow(0 0 0px transparent)` |
| On      | `#20b040` (green)  | `drop-shadow(0 0 3px #20b040)`     |

Orange and green are chosen to read clearly against the dark `#1c1c1c` button body. Yellow carries the conventional "transitional/warning" meaning and matches the traffic-light metaphor. Glow is preserved for the on state only — it reinforces active audio output without making loading feel celebratory.

### Decision: Persistent filter layer for position stability

Off and loading states use `filter: drop-shadow(0 0 0px transparent)` rather than `filter: none`. Switching between `filter: none` and an active `drop-shadow` causes the browser to allocate/deallocate a compositing layer, which produces a sub-pixel position shift on the icon. Keeping a zero-radius transparent shadow means the layer is always present, and the icon position stays constant across all state transitions.

### Decision: CSS transition duration of 0.3 s

The existing `.power-icon` rule already has `transition: stroke 0.15s, filter 0.15s`. This is extended to 0.3 s so the fade is perceptible across all three color shifts (including the larger orange→yellow and yellow→green jumps). The transition fires automatically when the browser computes a new `stroke` value from the active class — no JavaScript animation is needed.

Alternative considered: separate per-transition durations (faster for on→off, slower for off→loading). Rejected — uniform duration keeps the rule simple and the behavior predictable.

### Decision: Remove opacity dimming on disabled state

The `opacity: 0.7` rule on `.power-btn:disabled` is removed. The yellow color is sufficient to indicate the non-interactive loading state. Keeping opacity dimming would wash out the yellow and partially negate the tri-state signal.

## Risks / Trade-offs

- **Color contrast against dark body** — orange and yellow both need to meet at least 3:1 against `#1c1c1c`. The chosen hex values pass at roughly 4:1 and 5:1 respectively. → Verify with a contrast checker during implementation.
- **Breaking spec expectations** — existing tests assert the amber `#c87941` on-state color. Those tests must be updated. → Covered in tasks.
- **User familiarity** — users familiar with the amber/dark scheme may be surprised by the color change. → Acceptable; the new scheme is more intuitive and aligns with traffic-light conventions.
