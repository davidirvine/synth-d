## 1. Math helpers

- [x] 1.1 Implement the `'fine-center'` branch in `normalizedToValue(pos, min, max, scale)` in `src/audio/math.js` per the existing `fine-center-scale` spec: `center = (max + min) / 2`, `range = (max − min) / 2`, `t = (pos − 0.5) × 2`, return `center + sign(t) × t² × range`
- [x] 1.2 Implement the matching `'fine-center'` branch in `valueToNormalized(val, min, max, scale)`: `normT = sign(val − center) × sqrt(|val − center| / range)`, return `normT / 2 + 0.5`
- [x] 1.3 Add `detectInterval(cents)` helper to `src/audio/math.js` returning `"m3" | "M3" | "P5" | null` per the windows defined in the `knob` spec
- [x] 1.4 Add `"st"` (semitones) branch to `formatValue(value, unit)` in `src/audio/math.js`: divide cents by 100, two decimal places, suffix ` st`
- [x] 1.5 Add unit tests in `src/audio/math.test.js` (or existing equivalent) covering:
  - `normalizedToValue(0.5, -700, 700, 'fine-center') === 0`, endpoints map to ±700, and round-trip `valueToNormalized(normalizedToValue(pos, -700, 700, 'fine-center'), -700, 700, 'fine-center')` matches `pos` within floating-point precision for `pos ∈ {0, 0.1, 0.25, 0.5, 0.75, 0.9, 1}`
  - `detectInterval` at every target value (±300, ±400, ±700), both signs, just inside (e.g. ±286, ±314 for m3) and just outside (±284, ±316 for m3) each ±15¢ window
  - **P5 asymmetric window edge**: `detectInterval(700)` returns `"P5"`, `detectInterval(685)` returns `"P5"`, `detectInterval(684)` returns `null`, and `detectInterval(-700)` returns `"P5"`, `detectInterval(-685)` returns `"P5"`, `detectInterval(-684)` returns `null` — explicit test for the upper window being clipped at the slider maximum
  - `formatValue("st")` at 0, ±650, ±700
- [x] 1.6 Run `npx vitest run` and confirm new tests pass; lint and format the touched files per CLAUDE.md

## 2. Knob component — interval indicator slot

- [x] 2.1 Add `intervalIndicator` boolean prop (default `false`) to `src/components/Knob.svelte`
- [x] 2.2 When the prop is `true`, render a `<span class="interval-indicator">` inside the existing `.knob-wrap` container, positioned between the closing `</div>` of `.knob-hit` (the SVG wrapper) and the existing `<span class="knob-value">` element; populate via `detectInterval(value)`
- [x] 2.3 Style the indicator with fixed vertical reservation (e.g. `min-height: 1em` and a non-breaking-space fallback) so layout does not jump as text appears or disappears; match the typography (font family, weight, base size) of the adjacent `.knob-value` span so the rows read as one column
- [x] 2.4 Add component tests asserting: slot absent when prop omitted, slot present and blank at value 0, slot reads `m3` / `M3` / `P5` at the target values and inside their ±15¢ windows, slot blank just outside windows
- [x] 2.5 Run `npx vitest run`; lint and format

## 3. Knob component — step / fineStep quantization

- [x] 3.1 Add `step` and `fineStep` numeric props (both default `null`) to `src/components/Knob.svelte`
- [x] 3.2 In the drag handler, after computing the candidate value, if a step is active, round to the nearest multiple before assigning to `value` and firing `onchange`
- [x] 3.3 Track Shift key state during drag (pointerdown/keydown/keyup) so toggling Shift mid-drag switches between `step` and `fineStep` for subsequent updates
- [x] 3.4 Confirm the existing 10× Shift sensitivity reduction continues to apply alongside the step grid
- [x] 3.5 Add component tests: continuous behavior when neither prop set, multiples of 5 with `step={5}`, multiples of 1 with Shift held when `fineStep={1}`, returns to multiples of 5 when Shift released mid-drag
- [x] 3.6 Run `npx vitest run`; lint and format

## 4. FAUST DSP — widen slider bounds

- [x] 4.1 In `faust/synth.dsp`, change the `osc2Detune` hslider from `(0, -100, 100, 0.1)` to `(0, -700, 700, 1)` (line 15)
- [x] 4.2 In `faust/synth.dsp`, change the `osc3Detune` hslider from `(0, -100, 100, 0.1)` to `(0, -700, 700, 1)` (line 20)
- [x] 4.3 Validate FAUST compiles: `faust faust/synth.dsp -o /dev/null`
- [x] 4.4 Lint and format the touched file (note: `.dsp` is not in the prettier table; skip prettier and rely on FAUST validator only)

## 5. Oscillator wiring

- [x] 5.1 In `src/components/Oscillator.svelte`, update the OSC 2 detune knob (lines ~110–123): `label="freq"`, `min={-700}`, `max={700}`, `scale="fine-center"`, `unit="st"`, add `step={5}`, `fineStep={1}`, `intervalIndicator={true}`
- [x] 5.2 In `src/components/Oscillator.svelte`, update the OSC 3 detune knob (lines ~145–159) with the same set of changes (including `scale="fine-center"`); preserve the existing `disabled={osc3LfoMode === 1}` binding
- [x] 5.3 Lint and format `Oscillator.svelte`
- [x] 5.4 Run `npx vitest run` (full suite, not just touched files)

## 6. Visual + audio verification

- [x] 6.1 Start the dev server (`npm run dev` or repo equivalent) and load the synth in a browser
- [x] 6.2 Confirm the OSC 2 knob now reads `FREQ`, value label shows `0.00 st` at rest, and dragging steps in 5¢ increments
- [x] 6.3 Hold Shift and drag — confirm 1¢ step and that the indicator latches at `m3` / `M3` / `P5` when crossing each target ±15¢, and goes blank outside the windows
- [x] 6.4 Repeat for OSC 3, including verifying the knob disables in LFO mode and re-enables when LFO is off
- [x] 6.5 Audio check: play a held note and sweep OSC 2 freq through +400¢ and +700¢; confirm the audible interval matches a major third and a perfect fifth above the OSC 1 pitch
- [x] 6.6 Report visual + audio findings to the human and wait for explicit approval before proceeding to review gate

## 7. Review gate

- [x] 7.1 Run `roborev status` to confirm the daemon is healthy
- [x] 7.2 Run `roborev refine --max-iterations 3` and address any open findings
- [x] 7.3 Present refine results to the human and wait for explicit approval before opening the PR
