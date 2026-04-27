## 1. Update Modulation.svelte

- [ ] 1.1 Add `showValue={false}` to the modMix Knob call in `src/components/Modulation.svelte`
- [ ] 1.2 Add `bipolar={true}` to the modMix Knob call
- [ ] 1.3 Add `ticks={[{pos: 0, label: 'LFO'}, {pos: 1, label: 'NOISE'}]}` to the modMix Knob call
- [ ] 1.4 Run `npx eslint --fix src/components/Modulation.svelte && npx prettier --write src/components/Modulation.svelte`

## 2. Update Tests

- [ ] 2.1 Update `src/components/Modulation.test.js` to assert that the modMix knob does not render a visible value label
- [ ] 2.2 Update or add test assertions for the "LFO" and "NOISE" tick labels being present in the knob SVG
- [ ] 2.3 Run `npx eslint --fix src/components/Modulation.test.js && npx prettier --write src/components/Modulation.test.js`

## 3. Verify

- [ ] 3.1 Run `npx vitest run` and confirm all tests pass
