## Context

`Filter.svelte` renders the key track column as a `flex-column` with a `<span class="key-track-label">` on top and a button-wrap div beneath it. The `knob-row` uses `align-items: flex-start`, so all children align to their top edge. Because the label sits above the button-wrap, the button ends up displaced downward by the label's height (~12 px) relative to the knob SVGs. Removing the label and making the button self-labelled restores top-alignment between the button-wrap and the knob bodies.

## Goals / Non-Goals

**Goals:**
- Button reads "KEY TRACK" in both the active and inactive state
- Separate `key-track-label` span is removed entirely
- Button top edge aligns with the cutoff and resonance knob SVG tops (no CSS rewrite needed — removing the label achieves this automatically given the existing `align-items: flex-start` on `.knob-row`)
- Accessibility preserved via `aria-label` and `aria-pressed`

**Non-Goals:**
- No change to button styling, colours, or active/inactive visual treatment
- No change to toggle logic or `keyTrack` parameter emission
- No DSP or FAUST changes

## Decisions

### Button text is constant "KEY TRACK", not state-dependent

The previous "on"/"off" text was supplementary to the separate label. Now that the button IS the label, it must name the control in both states. The `aria-pressed` attribute already communicates the boolean state to assistive technology, so the visible text does not need to change.

**Alternative considered:** Show "KEY TRACK ON" / "KEY TRACK OFF". Rejected — verbose, inconsistent with how other boolean controls in the synth are labelled, and `aria-pressed` already handles state semantics.

### No layout changes beyond removing the label span

The `.key-track-btn-wrap` already has `height: var(--knob-body-size, 48px)` with `align-items: center`, which vertically centres the button within the same height as the knob SVG. Removing the label span means the btn-wrap starts at the very top of `.key-track-col`, aligning with the knob tops. No additional CSS adjustments are needed.

## Risks / Trade-offs

- **[Risk] Test assertions on button text break** → Tests that check for text "on" or "off" inside the button will fail. Update those assertions to check for "KEY TRACK". Tests using `getByRole('button', { name: /key track/i })` continue to match because the button text now IS "KEY TRACK".
- **[Risk] Button widens slightly** → "KEY TRACK" is longer than "on"/"off". The button has `width: auto` and `min-width: 32px`, so it will expand to fit the text. Visually acceptable and consistent with the control's new purpose as a labelled toggle.
