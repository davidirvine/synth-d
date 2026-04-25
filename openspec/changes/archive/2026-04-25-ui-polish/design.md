## Context

The synth UI top-level layout (`App.svelte`) uses a CSS flexbox container (`.panels`) with `flex-wrap: wrap` and `align-items: flex-start`. The three top-level children are `<Oscillator>`, `<Mixer>`, and a `.filter-output-grid` div. The filter-output-grid is itself a 3-column CSS grid containing two rows of panels (Filter/AmpEnv/Effects on row 1; Modulation+Glide/Scope/(empty) on row 2). Because Oscillator and Mixer are sized to their natural content height and the filter-output-grid spans two rows, the right-hand column is taller — the second row of panels extends below the bottom of Oscillator and Mixer. The `flex-wrap: wrap` also causes the three columns to reflow at narrow viewport widths.

## Goals / Non-Goals

**Goals:**

- All three top-level panel columns reach the same bottom edge
- The layout does not change when the browser window is resized (no reflow/wrap)
- Outer spacing around the synth matches the `8px` inter-panel gap
- Product name reads `SYNTH-D` in both the header and the browser tab
- The delay and reverb on/off toggle buttons appear on the same row as their "DELAY" / "REVERB" section labels
- The Key Track control is a binary on/off switch, not a continuous knob
- All on/off toggle switches (Key Track, Glide, Delay, Reverb) use the same active green (`#20b040`) as the power button

**Non-Goals:**

- Responsive / mobile layout
- Changes to the filter-output-grid's internal grid structure
- Any change to knob layout within the delay or reverb sections
- MIDI learn or CC assignment on the Key Track switch

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

### Toggle button co-located with section label

**Decision:** In `Effects.svelte`, wrap each section label and its toggle button together in a flex row (e.g. `.section-header { display: flex; align-items: center; justify-content: space-between }`). Remove the toggle button from `.effects-row`, which will then contain only knobs.

**Rationale:** Placing the on/off control next to the label makes the enable/disable action visually associated with the section name rather than appearing as a peer of the knobs. It also cleans up the knob row, which no longer needs to accommodate a differently-sized element. No layout change is needed for the knobs themselves.

### Key Track as a binary switch

**Decision:** Remove the `key trk` `<Knob>` from `Filter.svelte` and replace it with a toggle button labeled "Key Track" that emits `keyTrack: 0.0` when off and `keyTrack: 1.0` when on. Default state is off (0.0).

**Rationale:** Key tracking is a boolean feature on this instrument — either the filter cutoff tracks the played note or it does not. Offering a continuous 0–1 range implies partial tracking behaviour that the DSP engine does not use. A switch more accurately represents the control's semantics and is consistent with the glide and effects on/off switches.

### Active switch color

**Decision:** Change the active (on) state CSS for all toggle switches — Key Track, Glide, Delay, Reverb — to use `color: #20b040; border-color: #20b040` (dropping the amber `#c87941` currently used). Background remains dark; no glow is added.

**Rationale:** The power button uses `#20b040` (green) to indicate an active powered state. Using the same hue for all on/off controls creates a consistent visual language: green means active. The amber used by the delay/reverb and glide buttons today has no distinct semantic meaning and conflicts with the power button's established color.

## Risks / Trade-offs

- `grid-template-columns: auto auto auto` sizes columns to their content. If the filter-output-grid ever becomes wider or narrower than the Oscillator/Mixer columns, the proportions will shift. This is acceptable for a fixed instrument layout where column widths are determined by component content.
- Removing `flex-wrap` means the UI overflows horizontally on very narrow viewports. Per Non-Goals, responsive layout is out of scope and the synth is designed for desktop use.
