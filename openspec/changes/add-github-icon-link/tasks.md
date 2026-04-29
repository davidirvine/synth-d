## 1. Add GitHub Icon to App.svelte

- [ ] 1.1 Add a `<div class="footer">` row after `<Keyboard>` in `App.svelte` containing an `<a>` element with the GitHub invertocat SVG (16×16, `fill="currentColor"`) linking to `https://github.com/davidirvine/synth-d` with `target="_blank" rel="noopener noreferrer"`
- [ ] 1.2 Add `.footer` CSS rule: `display: flex; align-items: center;` so the icon sits at the left edge of `.synth` (flush with the Oscillator Bank panel left edge)
- [ ] 1.3 Add `.footer a` CSS rule: `color: #555; text-decoration: none; line-height: 0; transition: color 0.15s;` and `.footer a:hover { color: #888; }` and `.footer a:focus:not(:focus-visible) { outline: none; }` (pointer users see no flash; keyboard users retain the browser `:focus-visible` ring)

## 2. Verify

- [ ] 2.1 Confirm in browser that the icon appears below the keyboard, left-aligned with the Oscillator Bank panel left edge
- [ ] 2.2 Confirm clicking the icon opens `https://github.com/davidirvine/synth-d` in a new tab
- [ ] 2.3 Confirm hover color transition from `#555` to `#888`
- [ ] 2.4 Run `npx eslint --fix src/App.svelte && npx prettier --write src/App.svelte` and confirm no errors

## 3. Automated Test

- [ ] 3.1 Create `src/components/GitHubIconLink.test.js` (or add to `App.test.js`) asserting: the `<a>` renders with `href="https://github.com/davidirvine/synth-d"`, `target="_blank"`, and `rel="noopener noreferrer"`
- [ ] 3.2 Run `npx vitest run` and confirm tests pass
