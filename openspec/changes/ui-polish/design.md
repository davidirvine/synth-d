## Context

The synth UI top-level layout (`App.svelte`) uses a CSS flexbox container (`.panels`) with `flex-wrap: wrap` and `align-items: flex-start`. The three top-level children are `<Oscillator>`, `<Mixer>`, and a `.filter-output-grid` div. The filter-output-grid is itself a 3-column CSS grid containing two rows of panels (Filter/AmpEnv/Effects on row 1; Modulation+Glide/Scope/(empty) on row 2). Because Oscillator and Mixer are sized to their natural content height and the filter-output-grid spans two rows, the right-hand column is taller — the second row of panels extends below the bottom of Oscillator and Mixer. The `flex-wrap: wrap` also causes the three columns to reflow at narrow viewport widths.

## Goals / Non-Goals

**Goals:**
- All three top-level panel columns reach the same bottom edge
- The layout does not change when the browser window is resized (no reflow/wrap)
- Outer spacing around the synth matches the `8px` inter-panel gap
- Product name reads `SYNTH-D` in both the header and the browser tab

**Non-Goals:**
- Responsive / mobile layout
- Any change to the internal layout of individual panel components
- Changes to the filter-output-grid's internal grid structure

## Decisions

### Grid instead of flex for `.panels`

**Decision:** Replace `display: flex; flex-wrap: wrap; align-items: flex-start` with `display: grid; grid-template-columns: auto auto auto` on `.panels`.

**Rationale:** CSS grid rows stretch all cells to the tallest cell by default (`align-items: stretch`). This gives Oscillator and Mixer the same height as the filter-output-grid without any explicit `height` values on the components themselves. The grid does not wrap — removing `flex-wrap` as a side effect. An alternative of keeping flex and adding `align-items: stretch` was considered, but it requires `height: 100%` on the `.panel` elements inside components, spreading the change across multiple files. The grid approach is self-contained in App.svelte.

### Outer padding equals inter-panel gap

**Decision:** Change `main { padding: 20px }` to `padding: 8px`.

**Rationale:** The gap between panels is `8px`. Matching the outer padding to the gap gives uniform spacing all around the synth without special-casing any edge. The original `20px` was wider than the inter-panel gap with no design intent behind the difference.

### Product name update

**Decision:** Update the literal string `SYNTH-1` → `SYNTH-D` in `App.svelte` and `<title>` in `index.html`.

**Rationale:** Two-character change, no architectural consequence.

## Risks / Trade-offs

- `grid-template-columns: auto auto auto` sizes columns to their content. If the filter-output-grid ever becomes wider or narrower than the Oscillator/Mixer columns, the proportions will shift. This is acceptable for a fixed instrument layout where column widths are determined by component content.
- Removing `flex-wrap` means the UI overflows horizontally on very narrow viewports. Per Non-Goals, responsive layout is out of scope and the synth is designed for desktop use.
