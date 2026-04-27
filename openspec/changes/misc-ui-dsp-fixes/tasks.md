## 1. Pink Noise Fix

- [ ] 1.1 Investigate root cause: add temporary debug logging or check Faust parameter path for `noiseType` to confirm `setParam('noiseType', 1)` reaches the DSP node when pink is selected
- [ ] 1.2 Fix the identified cause (routing, param path mismatch, or DSP issue) so that pink noise produces audible output when selected with `noiseLevel` above zero
- [ ] 1.3 Run `faust faust/synth.dsp -o /dev/null` to validate the DSP file if any DSP edits were made
- [ ] 1.4 Run `npx eslint --fix` and `npx prettier --write` on any modified JS/Svelte files
- [ ] 1.5 Run `npx vitest run` and confirm tests pass
- [ ] 1.6 Commit

## 2. D/R Lock Default On

- [ ] 2.1 In `src/components/AmpEnv.svelte`, change `let drLock = $state(0)` to `$state(1)`
- [ ] 2.2 In `src/components/AmpEnv.svelte` `reset()`, change `drLock = 0` to `drLock = 1`
- [ ] 2.3 Run `npx eslint --fix src/components/AmpEnv.svelte` then `npx prettier --write src/components/AmpEnv.svelte`
- [ ] 2.4 Run `npx vitest run` and confirm tests pass
- [ ] 2.5 Commit

## 3. Double Max Delay Time

- [ ] 3.1 In `faust/synth.dsp`, change `hslider("delayTime [unit:s]", 0.3, 0.01, 1.0, 0.001)` max to `2.0`
- [ ] 3.2 Run `faust faust/synth.dsp -o /dev/null` to validate DSP
- [ ] 3.3 Rebuild WASM: `npm run faust:build`
- [ ] 3.4 In `src/audio/engine.js`, change `new AudioContext()` to `new AudioContext({ sampleRate: 48000 })`
- [ ] 3.5 In `src/App.svelte`, change `delayTime: { min: 0.01, max: 1.0 }` to `max: 2.0`
- [ ] 3.6 In `src/components/Effects.svelte`, change the `time` knob `max={1.0}` to `max={2.0}`
- [ ] 3.7 Run `npx eslint --fix` and `npx prettier --write` on all modified JS/Svelte files
- [ ] 3.8 Run `npx vitest run` and confirm tests pass
- [ ] 3.9 Commit

## 4. Centre Oscillator Waveshape Switches

- [ ] 4.1 In `src/components/Oscillator.svelte`, add `justify-content: center` to the `.wave-row` CSS rule
- [ ] 4.2 Run `npx eslint --fix src/components/Oscillator.svelte` then `npx prettier --write src/components/Oscillator.svelte`
- [ ] 4.3 Run `npx vitest run` and confirm tests pass
- [ ] 4.4 Commit

## 5. Global Knob Value Label Fixed Width

- [ ] 5.1 In `src/components/Knob.svelte`, add `min-width`, `display: inline-block`, and `text-align: center` to the `.knob-value` CSS rule; choose a `min-width` value (in `em`) wide enough to accommodate the widest expected formatted string across all knobs
- [ ] 5.2 In `src/components/Effects.svelte`, remove the scoped `.reverb-row :global(:nth-child(2) .knob-value)` rule (and its comment) since it is now covered by the global fix — **note:** `reverb-damp-control` task 2.2 also deletes this rule; if that change has already landed, this step is a no-op
- [ ] 5.3 Run `npx eslint --fix` and `npx prettier --write` on both modified files
- [ ] 5.4 Run `npx vitest run` and confirm tests pass
- [ ] 5.5 Commit
