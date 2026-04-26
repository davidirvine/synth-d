## 1. Update Modulation.svelte

- [x] 1.1 Add `showValue={false}` to the modMix Knob call in `src/components/Modulation.svelte`
- [x] 1.2 Add `bipolar={true}` to the modMix Knob call
- [x] 1.3 Add `ticks={[{pos: 0, label: 'LFO'}, {pos: 1, label: 'NOISE'}]}` to the modMix Knob call
- [x] 1.4 Run `npx eslint --fix src/components/Modulation.svelte && npx prettier --write src/components/Modulation.svelte`

## 2. Update Tests

- [x] 2.1 Update `src/components/Modulation.test.js` to assert that the modMix knob does not render a visible value label
- [x] 2.2 Update or add test assertions for the "LFO" and "NOISE" tick labels being present in the knob SVG
- [x] 2.3 Run `npx eslint --fix src/components/Modulation.test.js && npx prettier --write src/components/Modulation.test.js`

## 3. Verify

- [x] 3.1 Run `npx vitest run` and confirm all tests pass
