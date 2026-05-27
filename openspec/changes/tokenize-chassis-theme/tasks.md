## 1. Capture the pixel-identity baseline

- [x] 1.1 Add a throwaway Playwright spec that captures `page.screenshot()` at power-off and power-on and asserts via `toMatchSnapshot()` with a small pixel threshold; generate baselines against the current (pre-tokenization) build. Reach a **stable** frame before capturing: reuse the existing E2E specs' power-on pattern (`e2e/synth.spec.js`) for clicking power and awaiting readiness, and disable/await CSS transitions (or wait for the powered state to settle) so no intermediate animation frame is captured. These baselines are a refactor gate to be removed before merge
- [x] 1.2 Inventory the themeable literals: grep across `src/components/*.svelte` and `src/global.css` matching **hex, `rgba(`, and `hsl(`** plus `font-family`. Confirm the palette set (`#c87941`, `#e8dcc8`, `#2a2a2a`, `#333`, `#444`, `#1c1c1c`, `#20b040` [PowerButton + 6 panels], `#c8413a` [PatchControl], greys, mono stack). Record per-occurrence decisions for the non-hex cases: the two `rgba()` shadows (`WheelsPanel`, `PatchControl`) → tokenize if identity, else leave structural; LevelLed's `hsl()` ramp → algorithmic, out of scope. Classify `Volume.svelte` (chassis vs instrument-panel) so 3.1/4.1 picks it up consistently. Record the palette→component token mapping to follow

## 2. Author the token system

- [x] 2.1 Create `src/theme.css` defining the palette layer on `:root` (accent, text, surfaces, `--led-on` [green active], `--danger`/clip [red], `--led-off`, `--font-mono` = the full mono stack — ~10–12 tokens) with each value set to synth-d's current color, and the component-token layer referencing the palette (e.g. `--knob-arc-color: var(--accent-warm)`). Per D7: no `--led-on`/clip token is placed in LevelLed (its lit color is the algorithmic `--led-color` ramp); bare `monospace` sites are NOT folded into `--font-mono`
- [x] 2.2 Import `theme.css` in `src/main.js` so its `:root` tokens apply and cascade to all components. (Note: `var()` resolves from the cascaded `:root` rule at use time regardless of JS import order — as the existing `var(--knob-body-size)` proves — so import order is not a correctness invariant; place it alongside `global.css`)
- [x] 2.3 Verify the cascade reaches both tiers: temporarily override one palette token and confirm a chassis component (Knob) and an instrument panel (Oscillator) both pick it up; revert the override

## 3. Tokenize chassis components

- [x] 3.1 Replace identity color literals with `var(--token, <current-value>)` in the chassis components: `Knob`, `Wheel`, `WheelsPanel`, `Scope`, `PowerButton` (its `#20b040` → `--led-on`), `MidiStatus`, `PatchControl` (its `#c8413a` → `--danger`; review the `rgba()` per 1.2), `Keyboard`, `RegisterPanel`, `EmptyPanel`, `Shell` — each fallback equal to today's value. `LevelLed`: tokenize only the `#111111` off-state (`--led-off`); leave the dynamic `--led-color` HSL ramp untouched. Leave `font-family: inherit` and bare `monospace` declarations as-is (D7)
- [x] 3.2 Run `npx vitest run` on the component suite; confirm green. Rendered values are unchanged, so behavioral assertions are untouched — with one human-approved exception: two **serialization** assertions on chassis literals (`Scope.test.js` inline `background`, `Keyboard.test.js` rail `fill`) are updated to track the tokenized form, since those literals are now `var(--token, …)` references (see `inventory.md`)

## 4. Tokenize instrument panels and global.css

- [x] 4.1 Replace identity color literals with palette-token references in the instrument panels: `Oscillator`, `Mixer`, `Filter`, `AmpEnv`, `Effects`, `Modulation`, `Glide`, `Volume`, `SubtractivePanels` (the panels' `#20b040` active-state → `--led-on`), and in `src/global.css` (its mono stack → `--font-mono`) — fallbacks equal to current values. Leave `font-family: inherit` as-is (it cascades from the now-tokenized global rule)
- [x] 4.2 Run `npx vitest run`; confirm green

## 5. Verify no hardcoded identity literals remain

- [x] 5.1 Re-run the literal grep (hex, `rgba(`, `hsl(`, `font-family`) across `src/components/*.svelte` and `src/global.css`; confirm the only remaining identity color literals are the fallbacks inside `var(--token, …)` references and the definitions in `theme.css`. Documented exceptions per D7 are acceptable: LevelLed's algorithmic HSL ramp, bare `monospace`/`inherit` font declarations, and any `rgba()` shadow ruled structural in 1.2
- [x] 5.2 Spot-check that each tokenized declaration's fallback equals the corresponding `theme.css` value (D3); fix any disagreement (it is a defect, not a new look)

## 6. Pixel-identity and full regression gate

- [x] 6.1 Run the Playwright screenshot gate (task 1.1); confirm the post-tokenization render matches the pre-change baseline at power-off and power-on within threshold
- [x] 6.2 Run `npx vitest run` — all unit + component tests pass
- [x] 6.3 Run `npx stryker run` — mutation score ≥ 85%
- [x] 6.4 Run `npx playwright test` — all E2E pass
- [x] 6.5 Remove the throwaway screenshot spec and its baseline snapshots — including the generated images in the spec's snapshot directory (glob for the spec's `*.png` artifacts, honoring any `snapshotDir`/`snapshotPathTemplate` in the Playwright config) so no dead artifacts ship; confirm no assertion changed anywhere in the suite
