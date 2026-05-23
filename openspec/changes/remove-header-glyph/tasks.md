## 1. Remove glyph markup and styling

- [x] 1.1 Remove the `.header-glyph` block (the `<div class="header-glyph" aria-hidden="true">` wrapper and its inline `<svg>` favicon glyph) from the header in `src/App.svelte`, then run `npx eslint --fix src/App.svelte` and `npx prettier --write src/App.svelte`. Note: removing the markup before the CSS leaves the `.header-glyph` rules temporarily orphaned, so the Svelte compiler / `eslint-plugin-svelte` may emit an unused-selector warning after this step — it is expected and is resolved by task 1.2, which removes those rules
- [x] 1.2 Remove the `.header-glyph` and `.header-glyph svg` CSS rules and their explanatory comment (absolute centering, fixed 55px square, `pointer-events: none`, purple `#a64dff` fill, `drop-shadow` glow) from `src/App.svelte`, then run `npx eslint --fix src/App.svelte` and `npx prettier --write src/App.svelte`

## 2. Remove glyph tests

- [x] 2.1 Remove the `App — header brand glyph` describe block from `src/App.test.js`, then run `npx eslint --fix src/App.test.js` and `npx prettier --write src/App.test.js`

## 3. Verify

- [x] 3.1 Confirm no references to `header-glyph`, `#a64dff`, or `rgba(166, 77, 255` remain anywhere in `src/`; confirm `public/favicon.svg` and the `<link rel="icon">` in `index.html` are unchanged
- [x] 3.2 If any Playwright visual-regression or DOM-snapshot baselines capture the header (e.g. `toHaveScreenshot`/`toMatchSnapshot` against the header), update them so they no longer contain the glyph; if no such baselines exist, note that and continue
- [x] 3.3 Run `npx vitest run` and confirm all unit/component tests pass with no glyph assertions remaining
- [ ] 3.4 Run `npx playwright test` and confirm E2E tests pass
- [ ] 3.5 Run `npx stryker run` and confirm the mutation score is ≥ 85%
