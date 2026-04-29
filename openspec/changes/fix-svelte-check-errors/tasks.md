## 1. Global declaration file

- [x] 1.1 Create `src/global.d.ts` declaring `Window.__audioCtx` augmentation

## 2. Fix `$props()` annotation in Svelte components

- [x] 2.1 Fix `src/components/Knob.svelte` — move `@type` from cast to variable declaration
- [x] 2.2 Fix `src/components/LevelLed.svelte`
- [x] 2.3 Fix `src/components/PowerButton.svelte`
- [x] 2.4 Fix `src/components/Volume.svelte`
- [x] 2.5 Fix `src/components/Oscillator.svelte`
- [x] 2.6 Fix `src/components/Filter.svelte`
- [x] 2.7 Fix `src/components/Effects.svelte`
- [x] 2.8 Fix `src/components/AmpEnv.svelte`
- [x] 2.9 Fix `src/components/Modulation.svelte`
- [x] 2.10 Fix `src/components/Glide.svelte`
- [x] 2.11 Fix `src/components/Mixer.svelte`
- [x] 2.12 Fix `src/components/Keyboard.svelte`
- [x] 2.13 Fix `src/components/MidiStatus.svelte`
- [x] 2.14 Fix `src/components/RegisterPanel.svelte`
- [x] 2.15 Fix `src/components/Scope.svelte`
- [x] 2.16 Fix `src/components/WheelPanel.svelte`

## 3. JSDoc parameter types — audio modules

- [x] 3.1 Add `@param` annotations to all functions in `src/audio/math.js`
- [x] 3.2 Add `@param` and variable type annotations to `src/audio/engine.js`
- [x] 3.3 Add `@param` annotations to `src/audio/midi.js`; fix Uint8Array iterator typing
- [x] 3.4 Add `@param` annotations to `src/audio/keyboard.js`

## 4. JSDoc parameter types — App and components

- [x] 4.1 Add `@param` annotations to untyped callbacks in `src/App.svelte`
- [x] 4.2 Add `@param` annotations to untyped functions in `src/components/Knob.svelte`
- [x] 4.3 Add `@param` annotations to untyped functions in `src/components/WheelPanel.svelte`

## 5. Null safety — main.js and test-setup.js

- [ ] 5.1 Add non-null assertion to `document.getElementById('app')` in `src/main.js`
- [ ] 5.2 Complete the MediaQueryList stub in `src/test-setup.js` with missing properties

## 6. Null safety — test files

- [ ] 6.1 Fix null/Element type errors in `src/components/Knob.test.js`
- [ ] 6.2 Fix null/Element type errors in `src/components/LevelLed.test.js`
- [ ] 6.3 Fix null/Element type errors in `src/components/WheelPanel.test.js`
- [ ] 6.4 Fix null/Element type errors in `src/components/Effects.test.js`
- [ ] 6.5 Fix null/Element type errors in `src/components/Oscillator.test.js`
- [ ] 6.6 Fix null/Element type errors in `src/components/AmpEnv.test.js`
- [ ] 6.7 Fix null/Element type errors in `src/components/Filter.test.js` (if any)
- [ ] 6.8 Fix null/Element type errors in remaining test files (`App.test.js`, `Mixer.test.js`, `Modulation.test.js`, `Glide.test.js`, `Scope.test.js`, `Keyboard.test.js`, `MidiStatus.test.js`, `PowerButton.test.js`, `RegisterPanel.test.js`, `EmptyPanel.test.js`, `midiCcMap.test.js`, `engine.test.js`, `midi.test.js`, `filter-stability.integration.test.js`)

## 7. Verify zero errors

- [ ] 7.1 Run `npx svelte-check` and confirm 0 errors
- [ ] 7.2 Run `npx vitest run` and confirm all 402 tests still pass
