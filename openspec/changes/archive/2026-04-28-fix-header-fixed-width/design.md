## Context

The `.app` flex container has no explicit width, so it expands to fill the viewport. The `.header` child fills 100% of `.app`, making the header a full-viewport-width bar. The `.panels` grid below uses `justify-content: start` and `auto` column sizes, so it is content-sized and does not stretch with the viewport. This mismatch makes the header visually disconnected from the panel it labels.

Existing padding values already encode the correct overhang:
- `main` has `padding: 8px` → panels inset 8 px from the app edge
- `.header` has `padding: 12px 20px` → header content inset 20 px from the app edge
- Overhang = 20 px − 8 px = **12 px** per side (symmetric by construction)

No new magic numbers are needed.

## Goals / Non-Goals

**Goals:**
- Header width is content-driven (matches the synth panel area, not the viewport).
- Header left and right edges overhang the panel grid by equal amounts at all times.
- Fix survives future changes to panel dimensions without manual width updates.

**Non-Goals:**
- Centering the synth in the viewport (not requested).
- Responsive breakpoints or mobile layout changes.
- Any change to header internal layout, colors, or spacing.

## Decisions

### Add `width: fit-content` to `.app`

`width: fit-content` makes the flex container shrink to the width of its widest content (the panels). The header then fills that width, and the existing padding asymmetry produces the 12 px symmetric overhang automatically.

**Alternatives considered:**

| Option | Reason rejected |
|---|---|
| `display: inline-flex` on `.app` | Changes the outer formatting context; may interact with `body` layout unexpectedly. |
| Hard-coded `width` on `.app` | Breaks if panel sizes ever change. |
| Negative margins on `.header` | Hacky; requires knowing panel width at CSS-authoring time. |
| Separate fixed-width wrapper | Adds unnecessary DOM nesting. |

## Risks / Trade-offs

- **Body scroll on very narrow viewports** → `body` already has `overflow-x: hidden`; no change in behavior.
- **Wider header content (e.g., very long MIDI device name in MidiStatus)** → If header content ever grows wider than the panel area, the header would drive `.app` width and the panel would appear indented. Acceptable trade-off; the current MIDI status display is compact.

## Migration Plan

Single CSS property addition to `.app` in `src/App.svelte`. No data migration, no API change, no build configuration change. Revert by removing the property.
