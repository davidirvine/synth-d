## 1. Render and position the glyph

Done as a single step so there is no known-broken intermediate commit: the glyph is mispositioned (a flex child shoved between the title and `.header-right`) until the absolute-positioning CSS is applied, so the markup and the centering CSS land together.

- [ ] 1.1 In `src/App.svelte`, add the centered glyph in a single commit. All of the following land together (the glyph is mispositioned until the CSS is applied, so do not split):
  - [ ] Copy the glyph `<path>` verbatim from `public/favicon.svg` (the `fill-rule="evenodd"` path), omitting the `<rect>` background.
  - [ ] Add it as an inline `<svg>` in the header with `viewBox="0 0 256 256"` (the source favicon's viewBox — the path coordinates are absolute to it; a wrong/missing viewBox clips or distorts the glyph). DOM position is irrelevant once absolutely positioned.
  - [ ] Set the glyph fill via the SVG `fill="#2a2a2a"` attribute (matching the GitHub-icon precedent, which uses a `fill` attribute), not a CSS class.
  - [ ] Mark the `<svg>` `aria-hidden="true"`.
  - [ ] Add `pointer-events: none` so it never intercepts header clicks.
  - [ ] Ensure it is not wrapped in a link or any interactive element.
  - [ ] Set `position: relative` on `.header`.
  - [ ] Position the glyph with `position: absolute; left: 50%; transform: translateX(-50%)` so it centers across the full header width without entering the flex flow.

## 2. Size the glyph

- [ ] 2.1 Size the glyph to match the `.status-stack` height by pinning `top: 12px; bottom: 12px` on the positioned element (the header's symmetric vertical padding) so its box height derives from the content row. Do NOT set an explicit `height` on the positioned wrapper — top/bottom pinning defines it; set `height: 100%` on the inner `<svg>` to fill that box. Keep the `viewBox` square so width tracks height. Use an explicit height matching the stack only as a fallback if pinning is awkward.
- [ ] 2.2 Verify the glyph does not grow the header height (compare `.header`'s computed height in the dev server before vs. after the change — it must be unchanged) and does not shift the GitHub icon, title block, version label, status stack, or power button.

## 3. Quality gate

- [ ] 3.1 Run `npx eslint --fix src/App.svelte` then `npx prettier --write src/App.svelte`.
- [ ] 3.2 Run `npx vitest run` and confirm the existing App/header tests still pass; add or update a test asserting the glyph is present, decorative (`aria-hidden="true"`), filled `#2a2a2a` via its SVG `fill` attribute (`getAttribute('fill')`, since fill is set as an attribute, not CSS), and carries the centering/`pointer-events: none` styles. Visual centering is verified at the human gate, not in the unit test — jsdom does not compute layout, so assert the positioning CSS/class is present rather than the rendered position.
