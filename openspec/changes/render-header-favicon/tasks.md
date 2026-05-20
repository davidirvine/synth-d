## 1. Render and position the glyph

Done as a single step so there is no known-broken intermediate commit: the glyph is mispositioned (a flex child shoved between the title and `.header-right`) until the absolute-positioning CSS is applied, so the markup and the centering CSS land together.

- [x] 1.1 In `src/App.svelte`, add the centered glyph in a single commit. All of the following land together (the glyph is mispositioned until the CSS is applied, so do not split):
  - [x] Copy the glyph `<path>` verbatim from `public/favicon.svg` (the `fill-rule="evenodd"` path), omitting the `<rect>` background.
  - [x] Add it as an inline `<svg>` in the header with `viewBox="0 0 256 256"` (the source favicon's viewBox — the path coordinates are absolute to it; a wrong/missing viewBox clips or distorts the glyph). DOM position is irrelevant once absolutely positioned.
  - [x] Set the glyph fill via the SVG `fill="#2a2a2a"` attribute (matching the GitHub-icon precedent, which uses a `fill` attribute), not a CSS class.
  - [x] Mark the `<svg>` `aria-hidden="true"`.
  - [x] Add `pointer-events: none` so it never intercepts header clicks.
  - [x] Ensure it is not wrapped in a link or any interactive element.
  - [x] Set `position: relative` on `.header`.
  - [x] Position the glyph with `position: absolute; left: 50%; transform: translateX(-50%)` so it centers across the full header width without entering the flex flow.

## 2. Size the glyph

- [x] 2.1 Size the glyph to a fixed 55px square (`width: 55px; height: 55px`) and center it in both axes (`top: 50%; left: 50%; transform: translate(-50%, -50%)`). Keep the `viewBox` square and let the inner `<svg>` fill its box (`width: 100%; height: 100%`) so the glyph stays square. 55px fits within the header bar, so it must not grow the header.
- [x] 2.2 Verify the glyph does not grow the header height (compare `.header`'s computed height in the dev server before vs. after the change — it must be unchanged) and does not shift the GitHub icon, title block, version label, status stack, or power button.

## 3. Quality gate

- [x] 3.1 Run `npx eslint --fix src/App.svelte` then `npx prettier --write src/App.svelte`.
- [x] 3.2 Run `npx vitest run` and confirm the existing App/header tests still pass; add or update a test asserting the glyph is present, decorative (`aria-hidden="true"`), filled `#2a2a2a` via its SVG `fill` attribute (`getAttribute('fill')`, since fill is set as an attribute, not CSS), and carries the centering/`pointer-events: none` styles. Visual centering is verified at the human gate, not in the unit test — jsdom does not compute layout, so assert the positioning CSS/class is present rather than the rendered position.
