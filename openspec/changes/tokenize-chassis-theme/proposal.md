## Why

synth-d's visual identity is hardcoded directly into component styles: `#c87941` (the orange accent) appears 29 times, `#e8dcc8` (cream text) 25 times, and a handful of greys/surfaces/LED colors are scattered across ~25 components and `global.css`. Because the chassis components (Knob, Wheel, Scope, LEDs, PowerButton, etc.) are the reusable surface a future synth inherits — and `sync-kernel.sh` will overwrite them — a synth cannot give itself a distinct look without editing chassis source, which would be clobbered on the next sync. This change establishes the **third seam** (after the param-schema behavioral seam and the Shell/instrument structural seam): a design-token contract that lets each synth express its visual identity from a single override point, without touching chassis component source.

## What Changes

- Introduce a layered **design-token system** expressed as CSS custom properties: a small **palette** layer (accent, text, surfaces, LED on/clip, etc. — ~10–12 tokens derived from the existing hardcoded values) and a **component** layer that cascades from the palette (e.g. `--knob-arc-color: var(--accent-warm)`).
- Add a single `src/theme.css` holding synth-d's palette — the one instrument-side override point. Each token's value is exactly synth-d's current color, so the rendered app is unchanged.
- Replace hardcoded color (and other themeable visual) literals in **chassis components** with `var(--token, <current-value>)` references, where the fallback equals today's value.
- Route synth-d's **instrument panels** (Oscillator, Mixer, Filter, AmpEnv, Effects, Modulation, Glide, Volume) and `global.css` through the same palette tokens, so a palette change reskins the **whole app** coherently (whole-app scope).
- Document the **theme contract** — the catalog of tokens a synth may set, with their meaning — as the public, versioned styling API of the chassis (the visual analog of the param-schema contract).
- NOT a visual change. With the default palette, the app is pixel-identical; the existing `vitest` + `stryker` + `playwright` suites (plus a before/after screenshot gate) are the regression contract.

## Capabilities

### New Capabilities

- `chassis-theming`: A synth's visual identity is expressed entirely through a documented, layered set of CSS custom-property design tokens with a single override point (`theme.css`), not through hardcoded constants in components. Defines the requirements that keep the chassis re-skinnable: chassis components reference tokens (never hardcoded visual literals); a palette is the single source of identity and cascades to component tokens; setting the palette reskins the whole app; and the default palette renders pixel-identically to the pre-tokenization app. This is the visual seam, parallel to `chassis-architecture`'s behavioral seam.

### Modified Capabilities

<!-- None. This is a pure tokenization refactor with no visual change at the default palette.
     chassis-architecture (the behavioral seam) is orthogonal and unaffected — token names
     are not parameter names, so the chassis-purity test is not impacted. -->

## Impact

- **Code (new):** `src/theme.css` (palette + component tokens for synth-d).
- **Code (modified):** chassis components (`Knob`, `Wheel`, `WheelsPanel`, `Scope`, `LevelLed`, `PowerButton`, `MidiStatus`, `PatchControl`, `Keyboard`, `RegisterPanel`, `EmptyPanel`, `Shell`), instrument panels (`Oscillator`, `Mixer`, `Filter`, `AmpEnv`, `Effects`, `Modulation`, `Glide`, `Volume`, `SubtractivePanels`), and `src/global.css` — each hardcoded visual literal becomes a token reference with a fallback equal to its current value.
- **Tests:** `vitest` + `stryker` (≥85%) + `playwright` are the no-regression contract. A throwaway before/after Playwright screenshot gate verifies pixel-identity at power-off and power-on. No assertion should change; component tests asserting computed colors (if any) continue to pass because the rendered values are unchanged.
- **No behavior, dependency, API, or build changes.** Token plumbing is CSS-only.
- **Downstream (out of scope here):** the `theme-contract` token catalog becomes a spec that travels with the Phase-2 chassis preset; a future synth sets its own `theme.css` to reskin. Not implemented here.
