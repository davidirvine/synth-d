## 1. DSP range

- [x] 1.1 In `faust/synth.dsp`, change the `filterEnvAmt` hslider minimum from `0` to `-10000` (keep default 0, max 10000, step 1); leave the cutoff summation and `max(20, min(18000, …))` clamp unchanged
- [x] 1.2 Validate the DSP compiles: `faust faust/synth.dsp -o /dev/null`

## 2. Param registry and reset wiring

- [ ] 2.1 In `src/App.svelte`, change the `filterEnvAmt` registry entry min to `-10000` (max stays `10000`)
- [ ] 2.2 In `src/App.svelte`, add `'filterEnvAmt'` to the `BIPOLAR_PARAMS` set

## 3. Filter panel knob

- [ ] 3.1 In `src/components/Filter.svelte`, set the amount knob `min={-10000}` and add `bipolar={true}`; keep `scale="linear"`, `default={0}`, `unit="Hz"`
- [ ] 3.2 In `src/components/Filter.svelte`, widen the reserved value-display width so a negative reading (`-10.0 kHz`) fits without layout shift
- [ ] 3.3 Lint/format the edited files (`npx eslint --fix` then `npx prettier --write` on the `.svelte` files)

## 4. Tests

- [ ] 4.1 Add/update a unit test asserting the `filterEnvAmt` param range is `-10000 … 10000` and the knob renders in bipolar mode
- [ ] 4.2 Add/update a power-on/off-reset test asserting `filterEnvAmt` resets to `0` (centre), not `-10000` (min)
- [ ] 4.3 Add/update a UI test asserting the amount value display fits `-10.0 kHz` with no layout shift
- [ ] 4.4 Run the completion-gate test suite (`npx vitest run`, then the mutation + E2E checks per STACK.md)

## 5. Verification

- [ ] 5.1 Manual audio check: positive amount opens the filter on attack; negative amount closes it on attack and recovers toward a below-base sustain; 0 has no envelope effect
