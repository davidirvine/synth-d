## Why

The SYNTH-D favicon glyph appears only as the browser-tab icon today; the app header has an empty center between the left title block and the right-hand control cluster. Rendering the brand glyph there gives the header a centered identity mark that ties the in-app chrome to the tab icon, at no cost to the existing controls.

## What Changes

- Render the favicon glyph inline in the center of the app header, sourced from the same `ø`/phi path as `public/favicon.svg`.
- Strip the favicon's black rounded-rect background — render the glyph **only**, with no badge.
- Fill the glyph `#2a2a2a` so it reads as a quiet, low-contrast mark on the `#1c1c1c` header bar (deliberately understated, not a hard badge).
- Size the glyph to match the full height of the right-hand `.status-stack` (the MIDI LED row + gap + PATCH button), preferring a height derived from the header content row over a hardcoded pixel value.
- Center the glyph horizontally across the full header width, independent of the asymmetric left (GitHub icon + title) and right (status stack + power button) content.
- Mark the glyph as decorative for assistive technology — the existing GitHub icon link already carries the brand hyperlink, so the glyph adds no new interaction.

## Capabilities

### New Capabilities

- `header-favicon`: A decorative SYNTH-D brand glyph rendered inline and centered in the app header, matching the right-hand control cluster's height and styled as a low-contrast mark.

### Modified Capabilities

<!-- None. The github-icon-link, synth-title-link, and version-display capabilities are unaffected; this adds a new centered element without changing their requirements. -->

## Impact

- `src/App.svelte`: add the inline glyph SVG to the header markup and the centering/sizing CSS; `.header` gains `position: relative`.
- No new assets, dependencies, or build changes — the glyph path is inlined (the `public/favicon.svg` tab icon is unchanged).
- No behavioral or audio impact; purely presentational.
