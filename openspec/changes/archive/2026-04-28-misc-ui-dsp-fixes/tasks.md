## 1. Pink Noise Fix

- [x] 1.1 Investigate root cause: confirmed `/synth/noiseType` parameter path is correct and `setParam('noiseType', 1)` reaches the DSP node when pink is selected
- [x] 1.2 No fix required — pink noise is working correctly; `no.pink_noise` compiles and plays as intended
- [x] 1.3 No DSP edits made
- [x] 1.4 No JS/Svelte files modified
- [x] 1.5 Run `npx vitest run` and confirm tests pass
- [x] 1.6 Commit

## 2. D/R Lock Default On

- [x] 2.1 In `src/components/AmpEnv.svelte`, change `let drLock = $state(0)` to `$state(1)`
- [x] 2.2 In `src/components/AmpEnv.svelte` `reset()`, change `drLock = 0` to `drLock = 1`
- [x] 2.3 Run `npx eslint --fix src/components/AmpEnv.svelte` then `npx prettier --write src/components/AmpEnv.svelte`
- [x] 2.4 Run `npx vitest run` and confirm tests pass
- [x] 2.5 Commit

## 3. Double Max Delay Time

- [x] 3.1 In `faust/synth.dsp`, change `hslider("delayTime [unit:s]", 0.3, 0.01, 1.0, 0.001)` max to `2.0`
- [x] 3.2 Run `faust faust/synth.dsp -o /dev/null` to validate DSP
- [x] 3.3 Rebuild WASM: `npm run faust:build`
- [x] 3.4 In `src/audio/engine.js`, change `new AudioContext()` to `new AudioContext({ sampleRate: 48000 })`
- [x] 3.5 In `src/App.svelte`, change `delayTime: { min: 0.01, max: 1.0 }` to `max: 2.0`
- [x] 3.6 In `src/components/Effects.svelte`, change the `time` knob `max={1.0}` to `max={2.0}`
- [x] 3.7 Run `npx eslint --fix` and `npx prettier --write` on all modified JS/Svelte files
- [x] 3.8 Run `npx vitest run` and confirm tests pass
- [x] 3.9 Commit

## 4. Centre Oscillator Waveshape Switches

- [x] 4.1 Centring added then reverted per user request — wave buttons remain left-aligned
- [x] 4.2 Run `npx eslint --fix src/components/Oscillator.svelte` then `npx prettier --write src/components/Oscillator.svelte`
- [x] 4.3 Run `npx vitest run` and confirm tests pass
- [x] 4.4 Commit

## 5. Global Knob Value Label Fixed Width

- [x] 5.1 In `src/components/Knob.svelte`, add `min-width: 5.5em`, `display: inline-block`, and `text-align: center` to the `.knob-value` CSS rule (5.5em matches the existing scoped override in `Effects.svelte` that this global rule replaces)
- [x] 5.2 In `src/components/Effects.svelte`, remove the scoped `.reverb-row :global(:nth-child(2) .knob-value)` rule (and its comment) since it is now covered by the global fix — **note:** `reverb-damp-control` task 2.2 also deletes this rule; if that change has already landed, this step is a no-op
- [x] 5.3 Run `npx eslint --fix` and `npx prettier --write` on both modified files
- [x] 5.4 Run `npx vitest run` and confirm tests pass
- [x] 5.5 Commit
