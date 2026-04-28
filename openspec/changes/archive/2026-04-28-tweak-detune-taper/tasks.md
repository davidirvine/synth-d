## 1. Add fine-center scale to math.js

- [x] 1.1 Confirm `engine.js` stores detune state as raw cents (not normalized pos) to rule out preset-loading regression
- [x] 1.2 Add `'fine-center'` branch to `normalizedToValue` in `src/audio/math.js`
- [x] 1.3 Add `'fine-center'` branch to `valueToNormalized` in `src/audio/math.js`
- [x] 1.4 Run `npx prettier --write src/audio/math.js`

## 2. Add math.js tests for fine-center scale

- [x] 2.1 Add unit tests to `src/audio/math.test.js` covering: center→0, min→min, max→max, pos≈0.342→≈−10 cents, and round-trip invertibility
- [x] 2.2 Run `npx prettier --write src/audio/math.test.js`

## 3. Update Oscillator.svelte

- [x] 3.1 Change `scale="linear"` to `scale="fine-center"` on the OSC 2 detune Knob in `src/components/Oscillator.svelte`
- [x] 3.2 Change `scale="linear"` to `scale="fine-center"` on the OSC 3 detune Knob in `src/components/Oscillator.svelte`
- [x] 3.3 Run `npx eslint --fix src/components/Oscillator.svelte && npx prettier --write src/components/Oscillator.svelte`

## 4. Verify

- [x] 4.1 Run `npx vitest run` and confirm all tests pass
