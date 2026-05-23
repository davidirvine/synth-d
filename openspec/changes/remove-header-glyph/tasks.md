## 1. Remove glyph markup and styling

- [ ] 1.1 Remove the `.header-glyph` block (the `<div class="header-glyph" aria-hidden="true">` wrapper and its inline `<svg>` favicon glyph) from the header in `src/App.svelte`, then run `npx eslint --fix src/App.svelte` and `npx prettier --write src/App.svelte`
- [ ] 1.2 Remove the `.header-glyph` and `.header-glyph svg` CSS rules and their explanatory comment (absolute centering, fixed 55px square, `pointer-events: none`, purple `#a64dff` fill, `drop-shadow` glow) from `src/App.svelte`, then run `npx eslint --fix src/App.svelte` and `npx prettier --write src/App.svelte`

## 2. Remove glyph tests

- [ ] 2.1 Remove the `App — header brand glyph` describe block from `src/App.test.js`, then run `npx eslint --fix src/App.test.js` and `npx prettier --write src/App.test.js`

## 3. Verify

- [ ] 3.1 Confirm no references to `header-glyph`, `#a64dff`, or `rgba(166, 77, 255` remain anywhere in `src/`; confirm `public/favicon.svg` and the `<link rel="icon">` in `index.html` are unchanged
- [ ] 3.2 Run `npx vitest run` and confirm all unit/component tests pass with no glyph assertions remaining
- [ ] 3.3 Run `npx playwright test` and confirm E2E tests pass
- [ ] 3.4 Run `npx stryker run` and confirm the mutation score is ≥ 85%
