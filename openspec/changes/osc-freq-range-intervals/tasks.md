## 1. Math helpers

- [ ] 1.1 Add `detectInterval(cents)` helper to `src/audio/math.js` returning `"m3" | "M3" | "P5" | null` per the windows defined in the `knob` spec
- [ ] 1.2 Add `"st"` (semitones) branch to `formatValue(value, unit)` in `src/audio/math.js`: divide cents by 100, two decimal places, suffix ` st`
- [ ] 1.3 Add unit tests in `src/audio/math.test.js` (or existing equivalent) covering `detectInterval` at every target, both signs, just inside and just outside each ±15¢ window, and `formatValue("st")` at 0, ±650, ±700
- [ ] 1.4 Run `npx vitest run` and confirm new tests pass; lint and format the touched files per CLAUDE.md

## 2. Knob component — interval indicator slot

- [ ] 2.1 Add `intervalIndicator` boolean prop (default `false`) to `src/components/Knob.svelte`
- [ ] 2.2 Render a `<span class="interval-indicator">` between the SVG (line ~211) and the value label (line ~213) when the prop is `true`; populate via `detectInterval(value)`
- [ ] 2.3 Style the indicator with fixed vertical reservation (e.g. `min-height: 1em` and a non-breaking-space fallback) so layout does not jump as text appears or disappears
- [ ] 2.4 Add component tests asserting: slot absent when prop omitted, slot present and blank at value 0, slot reads `m3` / `M3` / `P5` at the target values and inside their ±15¢ windows, slot blank just outside windows
- [ ] 2.5 Run `npx vitest run`; lint and format

## 3. Knob component — step / fineStep quantization

- [ ] 3.1 Add `step` and `fineStep` numeric props (both default `null`) to `src/components/Knob.svelte`
- [ ] 3.2 In the drag handler, after computing the candidate value, if a step is active, round to the nearest multiple before assigning to `value` and firing `onchange`
- [ ] 3.3 Track Shift key state during drag (pointerdown/keydown/keyup) so toggling Shift mid-drag switches between `step` and `fineStep` for subsequent updates
- [ ] 3.4 Confirm the existing 10× Shift sensitivity reduction continues to apply alongside the step grid
- [ ] 3.5 Add component tests: continuous behavior when neither prop set, multiples of 5 with `step={5}`, multiples of 1 with Shift held when `fineStep={1}`, returns to multiples of 5 when Shift released mid-drag
- [ ] 3.6 Run `npx vitest run`; lint and format

## 4. FAUST DSP — widen slider bounds

- [ ] 4.1 In `faust/synth.dsp`, change the `osc2Detune` hslider from `(0, -100, 100, 0.1)` to `(0, -700, 700, 1)` (line 15)
- [ ] 4.2 In `faust/synth.dsp`, change the `osc3Detune` hslider from `(0, -100, 100, 0.1)` to `(0, -700, 700, 1)` (line 20)
- [ ] 4.3 Validate FAUST compiles: `faust faust/synth.dsp -o /dev/null`
- [ ] 4.4 Lint and format the touched file (note: `.dsp` is not in the prettier table; skip prettier and rely on FAUST validator only)

## 5. Oscillator wiring

- [ ] 5.1 In `src/components/Oscillator.svelte`, update the OSC 2 detune knob (lines ~110–123): `label="freq"`, `min={-700}`, `max={700}`, `scale="fine-center"`, `unit="st"`, add `step={5}`, `fineStep={1}`, `intervalIndicator={true}`
- [ ] 5.2 In `src/components/Oscillator.svelte`, update the OSC 3 detune knob (lines ~145–159) with the same set of changes (including `scale="fine-center"`); preserve the existing `disabled={osc3LfoMode === 1}` binding
- [ ] 5.3 Lint and format `Oscillator.svelte`
- [ ] 5.4 Run `npx vitest run` (full suite, not just touched files)

## 6. Visual + audio verification

- [ ] 6.1 Start the dev server (`npm run dev` or repo equivalent) and load the synth in a browser
- [ ] 6.2 Confirm the OSC 2 knob now reads `FREQ`, value label shows `0.00 st` at rest, and dragging steps in 5¢ increments
- [ ] 6.3 Hold Shift and drag — confirm 1¢ step and that the indicator latches at `m3` / `M3` / `P5` when crossing each target ±15¢, and goes blank outside the windows
- [ ] 6.4 Repeat for OSC 3, including verifying the knob disables in LFO mode and re-enables when LFO is off
- [ ] 6.5 Audio check: play a held note and sweep OSC 2 freq through +400¢ and +700¢; confirm the audible interval matches a major third and a perfect fifth above the OSC 1 pitch
- [ ] 6.6 Report visual + audio findings to the human and wait for explicit approval before proceeding to review gate

## 7. Review gate

- [ ] 7.1 Run `roborev status` to confirm the daemon is healthy
- [ ] 7.2 Run `roborev refine --max-iterations 3` and address any open findings
- [ ] 7.3 Present refine results to the human and wait for explicit approval before opening the PR
