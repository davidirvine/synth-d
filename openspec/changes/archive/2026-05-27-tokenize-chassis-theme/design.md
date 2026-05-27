## Context

After `refactor-synth-d-chassis`, synth-d has an instrument-agnostic chassis (engine, MIDI, keyboard, store, generic UI) joined to the subtractive instrument by the parameter-schema seam. But the chassis still hardcodes synth-d's **look**: a survey finds a small, coherent palette repeated across ~25 components and `global.css` — `#c87941` (orange accent, 29×), `#e8dcc8` (cream text, 25×), greys/surfaces (`#2a2a2a`, `#333`, `#444`, `#1c1c1c`), `#20b040` (green LED), `#c8413a` (red clip), and a few more. Notably, `Knob.svelte` already reads `var(--knob-body-size, 48px)` — the exact custom-property-with-fallback pattern this change generalizes to color and font.

This is the **third seam**. The first two (behavioral param-schema, structural Shell/instrument) were made explicit by the chassis refactor; this one makes the *visual* identity overridable. The motivation is the same: `sync-kernel.sh` (Phase 2) will overwrite chassis component source, so a synth must be able to restyle the chassis **without editing it** — which only CSS custom properties achieve (they pierce Svelte's style scoping and need no knowledge of internal class names).

Scope decided with the human: **whole-app** tokenization (chassis components + instrument panels + `global.css` all consume one palette, so a swap reskins coherently) and **pixel-identical** (every token's fallback equals synth-d's current value; no demonstration alt-theme).

## Goals / Non-Goals

**Goals:**

- Establish a layered design-token system (palette → component) as the chassis's styling contract.
- Add one `src/theme.css` holding synth-d's palette — the single instrument-side override point.
- Replace hardcoded color/font literals across chassis components, instrument panels, and `global.css` with `var(--token, <current-value>)` references whose fallback equals today's value.
- Keep the app pixel-identical at the default palette; existing suites + a throwaway screenshot gate are the contract.
- Document the token catalog (the theme contract) as the chassis's public, versioned styling API.

**Non-Goals:**

- No visual change at the default palette; no second/demo theme; no light-dark or theme-switching UI.
- No tokenization of layout/spacing/geometry literals — those are structural, not identity. Only color, font-family, and the existing size token are themeable here.
- No restructuring of components or markup; this is a styling-only refactor.
- No creation of the Phase-2 chassis preset or the `theme-contract` spec's home in the kernel repo (the catalog is authored here as a capability; promoting it travels with Phase 2).

## Decisions

### D1 — Two token layers: palette (identity) → component (cascade)

Define a small **palette** layer — the synth's identity, ~10–12 tokens — and a **component** layer that references it:

```
PALETTE (the synth sets these — its whole identity)      COMPONENT (cascade; override only for fine control)
  --accent-warm: #c87941;                        ──▶  --knob-arc-color: var(--accent-warm);
  --text-primary: #e8dcc8;                        ──▶  --control-label-color: var(--text-primary);
  --surface-panel: #2a2a2a;                       ──▶  --knob-track-color: var(--surface-track);
  --led-on: #20b040;  --led-clip: #c8413a;        ──▶  --level-led-on-color: var(--led-on);
  --font-mono: monospace; ...
```

**Why layered over a flat per-property token set:** a flat scheme would force a synth to set dozens of tokens to reskin. With layers, a synth overrides ~10 palette tokens and the component tokens cascade automatically; deep control remains available by overriding a specific component token. **Alternative considered:** a single flat namespace (`--knob-arc-color` etc. set directly). Rejected — it makes the common case (swap the palette) verbose and error-prone.

### D2 — One `src/theme.css`, applied at `:root`, imported globally

synth-d's palette and the component-token defaults live in `src/theme.css`, defining tokens on `:root` so the cascade reaches every component (chassis and instrument panels alike, regardless of Svelte scoping). It is imported once at the global entry (alongside `global.css`). This single file is the override point: a future synth replaces only its palette block.

**Why `:root`/global over the Shell root:** instrument panels and chassis components both need the tokens, and putting them at `:root` guarantees cascade everywhere without threading a wrapper. (The existing `--knob-body-size` set on `.app` continues to work; it can move to `theme.css` or stay — it is a size token, not part of the color palette.)

### D3 — Fallback equals current value (the pixel-identity gate)

Every tokenized declaration uses `var(--token, <exact-current-value>)`, and `theme.css` sets `--token` to that same current value. This makes the change invisible by construction and mirrors the param-schema refactor's "derive, then assert equality before deleting" discipline: the fallback *is* the equality assertion, inlined. If a fallback and the `theme.css` value ever disagree, that is a bug to fix, not a new look to accept.

### D4 — The token catalog is the chassis's public styling contract

The set of tokens a synth may set — names, meaning, layer — is documented as the **theme contract**, the visual analog of the param-schema behavioral contract. It is a versioned public API: renaming a token upstream breaks every synth's `theme.css` on the next `sync-kernel.sh`, so token names carry the same governance discipline as the kernel. The **reusable** contract is the *chassis* component tokens + palette; synth-d's instrument panels additionally consume the palette for whole-app coherence, but that is synth-d's own styling, not part of the inherited contract. This catalog is authored here (as the `chassis-theming` capability) and travels with the Phase-2 chassis preset as a `theme-contract` spec.

### D5 — Pixel-identity is verified, not asserted by eye

A throwaway Playwright screenshot gate captures the app at power-off and power-on **before** tokenization and asserts the post-change render matches via `toMatchSnapshot()` with a small threshold. These baselines are a refactor gate, discarded after merge (not a permanent test). The full `vitest`/`stryker`/`playwright` suites must pass unchanged; `stryker` mutates JS, not CSS, so token plumbing does not affect mutation score.

### D6 — Only identity literals are tokenized

Tokenize **color** values (hex/rgb/rgba used as fills, strokes, text, borders, shadows) and **font-family** literals, plus the existing size token. Leave layout, spacing, sizing geometry, transitions, and opacity as plain CSS — they are structure, not identity, and tokenizing them would balloon the surface without serving "visual identity." A semi-transparent shadow like `rgba(0,0,0,0.5)` is tokenized only if it reads as an identity choice; otherwise left inline. The inventory grep (task 1.2/5.1) MUST match `hsl(` and `rgba(` as well as hex, so non-hex color literals are not missed. The token count is intentionally kept small (~12 palette tokens); this is a deliberate ceiling, not an oversight.

### D7 — Component-specific scoping (grounded in the actual code)

A survey of the current code corrects three naive assumptions and fixes where each token actually applies:

- **LevelLed is already effectively tokenized and its lit color is algorithmic.** `LevelLed.svelte` computes its color from the peak value as an HSL ramp (`hsl(hue, 100%, 50%)`) and drives it via an inline `style:--led-color` binding; its only static literal is the `#111111` off-state, already expressed as `var(--led-color, #111111)`. So LevelLed gets only a `--led-off` token for the off-state; **the HSL ramp is algorithmic, not identity, and is out of scope** (tokenizing its endpoints is a possible future refinement, not this change).
- **The LED/active-state colors live elsewhere.** `#20b040` (green "active") is in `PowerButton` and the six instrument panels (Filter, Oscillator, Modulation, AmpEnv, Effects, Glide); `#c8413a` (red) is in `PatchControl`. So `--led-on`/active-state and the red `--danger`/clip tokens are scoped to those components, **not** LevelLed.
- **Fonts: preserve the existing split, don't collapse it.** `global.css` uses a rich mono stack (`'JetBrains Mono', 'Cascadia Code', …, monospace`); several components use bare `font-family: monospace`; eleven use `font-family: inherit`. To stay pixel-identical: tokenize the global stack into `--font-mono` (and `inherit` sites keep cascading from it, left as-is); **do not** rewrite bare `monospace` sites to `var(--font-mono)`, since that would swap them to the full stack and change their rendering if any stack font resolves. Bare `monospace` is left as-is (a pre-existing choice, not identity we are centralizing here).

## Risks / Trade-offs

- **A hardcoded value is missed, leaving a surface un-reskinnable** → After tokenizing, re-run the color-literal grep across chassis components; any remaining color literal (outside `theme.css` and intentional non-identity cases) is either tokenized or explicitly justified in review. The grep that scoped this change is the checklist.
- **Fallback drifts from `theme.css` value, causing a silent visual change** → D3 makes them equal by construction; the D5 screenshot gate catches any divergence at power-off/power-on.
- **Token applied at wrong scope so cascade misses a component** → D2 puts the palette at `:root`; verify both a chassis component (Knob) and an instrument panel (Oscillator) pick up a palette override in a quick manual check.
- **Scope creep into theme-switching or a second theme** → Explicit non-goal; only the default palette and the contract are delivered. A demo theme waits for a real second synth.
- **Tokenizing instrument panels couples synth-d's panels to the palette** → Intended (whole-app coherence). The reusable contract (D4) is only the chassis tokens; the panels are synth-d's own consumers and impose nothing on future synths.

## Migration Plan

Styling-only, no runtime/data migration; rollback is reverting the branch. Sequencing: (1) capture the screenshot baselines; (2) author `theme.css` with the palette + component tokens set to current values; (3) tokenize chassis components; (4) tokenize instrument panels + `global.css`; (5) run the screenshot gate + full suites; commit per group so each stays reviewable and revertible.

## Open Questions

- Exact token names and the palette/component split boundary — to finalize while authoring `theme.css`; not load-bearing for the approach.
- Whether `--knob-body-size` moves into `theme.css` or stays on `.app` — cosmetic; either preserves behavior.
