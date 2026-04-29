## Context

The synth layout is a flex column inside `.main` (`8px` padding). Within `.synth`, a `.panels` 3-column grid is followed by a full-width `<Keyboard>` component, with an `8px` gap between them. The space below the keyboard is currently empty — nothing fills that row. The Oscillator Bank panel is the first column of the grid and its left edge is flush with the left edge of `.synth`, which is also the left edge of the keyboard.

## Goals / Non-Goals

**Goals:**
- Render a GitHub mark icon as a clickable anchor (`https://github.com/davidirvine/synth-d`, new tab) in the vacant area below the keyboard
- Horizontally align the icon's left edge with the left edge of the Oscillator Bank panel (i.e., flush left within `.synth`)
- Visually match the dim, muted aesthetic of the synth — not distracting

**Non-Goals:**
- No label text next to the icon
- No change to the keyboard, panels, or header geometry
- No new npm dependencies

## Decisions

**Inline SVG GitHub mark, not an external icon library**
The project has no icon library; adding one for a single icon is unnecessary weight. An inline SVG of the GitHub invertocat mark (the standard `<path>` from the GitHub branding kit) is self-contained, scalable, and can be tinted via CSS `fill: currentColor`. This follows the same approach used by other SVG elements in the synth (waveform selector icons).

**Footer row div, not absolute positioning**
Adding a `<div class="footer">` below `<Keyboard>` in the `.synth` flex column keeps the document flow clean and ensures the synth's total height expands naturally to include the icon. Absolute positioning inside the keyboard would clip or overlay keyboard UI.

**Left-align via `justify-content: flex-start` on the footer row**
Since the Oscillator Bank's left edge is the same as the `.synth` left edge, placing the icon at `align-items: flex-start` / `justify-content: flex-start` in the footer row achieves the correct position without any `margin` offset calculation.

**Icon color from CSS custom property — dim gray, brightens on hover**
Using `color: #555` (matching the `version-label` / muted text tier) with `opacity` hover transition keeps the icon unobtrusive. On hover it steps up to `#888`, consistent with how other passive UI elements behave.

**Icon size: 16px × 16px**
Matches the scale of the version label and other small UI decorations below the main controls.

## Risks / Trade-offs

- [SVG path accuracy] → Use the official GitHub invertocat SVG path from GitHub's branding page; do not simplify.
- [Future layout changes] → Because placement relies on `.synth` left edge matching the Oscillator Bank left edge, any future left padding on `.panels` would misalign the icon. Risk is low given the current rigid fixed-width layout.

## Migration Plan

No migration needed — purely additive. Rolling back requires removing the `<div class="footer">` block and its CSS rule from `App.svelte`.
