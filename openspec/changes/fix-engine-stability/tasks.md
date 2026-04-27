## 1. DSP Signal Chain Fixes

- [x] 1.1 In `faust/synth.dsp`, add `resonanceSafe = min(0.97, resonance)` and pass `resonanceSafe` to `ve.moog_vcf` instead of `resonance`
- [x] 1.2 In `faust/synth.dsp`, apply `ma.tanh` to `mixerOut` before the filter: `filteredSig = mixerOut : ma.tanh : ve.moog_vcf(resonanceSafe, cutoffMod)`
- [x] 1.3 In `faust/synth.dsp`, replace `masterOut = vcaOut * masterVol` with output saturation: `masterOut = vcaOut * (masterVol / 0.6) : ma.tanh`
- [x] 1.4 Validate DSP compiles: `faust faust/synth.dsp -o /dev/null`
- [x] 1.5 Rebuild WASM: `npm run faust:build` (or equivalent) and confirm `public/dsp-module.wasm` and `public/dsp-meta.json` are updated

## 2. Engine Lifecycle

- [x] 2.1 Remove the `initialized` flag and all early-return logic from `src/audio/engine.js`
- [x] 2.2 Rewrite `powerOff()` to disconnect the node, call `ctx.close()`, and null `ctx`, `node`, and `analyserNode`
- [x] 2.3 Rewrite `powerOn()` to always create a new AudioContext, fetch WASM, compile, create the node, and connect the graph
- [x] 2.4 Run `npx eslint --fix src/audio/engine.js && npx prettier --write src/audio/engine.js`

## 3. Knob Spring Animation

- [x] 3.1 Import `spring` from `svelte/motion` in `src/components/Knob.svelte`
- [x] 3.2 Create a spring store for the visual display position, seeded from the initial `pos`
- [x] 3.3 Add a `$effect` that updates the spring target when `externalValue` changes (not during drag)
- [x] 3.4 Derive `indicatorEnd` and `activePath` from the spring value rather than directly from `pos`
- [x] 3.5 Ensure spring is bypassed during pointer drag (visual tracks pointer directly)
- [x] 3.6 Tune spring stiffness and damping so animation completes in approximately 400–600ms
- [x] 3.7 Run `npx eslint --fix src/components/Knob.svelte && npx prettier --write src/components/Knob.svelte`

## 4. App.svelte — DEFAULTS and Reset Wiring

- [x] 4.1 Add a `DEFAULTS` constant to `src/App.svelte` covering every continuous param (matching FAUST defaults and UI initial values)
- [x] 4.2 Add a `resetCounter` reactive state variable (integer, starts at 0)
- [x] 4.3 After `powerOn()` resolves, flush DEFAULTS into `ccExternalValues` so all continuous knobs receive their default via `externalValue`
- [x] 4.4 After `powerOn()` resolves, increment `resetCounter`
- [x] 4.5 Pass `resetCounter` as a `reset` prop to `Oscillator`, `Mixer`, `Filter`, `AmpEnv`, `Modulation`, `Glide`, and `Effects`
- [x] 4.6 Run `npx eslint --fix src/App.svelte && npx prettier --write src/App.svelte`

## 5. Panel Component Reset Props

- [x] 5.1 Add `reset` prop and `$effect` to `src/components/Oscillator.svelte` — resets wave selectors, OSC ranges, detune to 0, fires `onchange` for each
- [x] 5.2 Add `reset` prop and `$effect` to `src/components/Mixer.svelte` — resets noise type to 0, fires `onchange`
- [x] 5.3 Add `reset` prop and `$effect` to `src/components/Filter.svelte` — resets keyTrack to off, fires `onchange`
- [x] 5.4 Add `reset` prop and `$effect` to `src/components/AmpEnv.svelte` — resets drLock to off, fires `onchange`
- [x] 5.5 Add `reset` prop and `$effect` to `src/components/Modulation.svelte` — resets modToOsc1, modToOsc2, modToFilter to 0, fires `onchange` for each
- [x] 5.6 Add `reset` prop and `$effect` to `src/components/Glide.svelte` — resets glideOn to off, fires `onchange`
- [x] 5.7 Add `reset` prop and `$effect` to `src/components/Effects.svelte` — resets delayOn and reverbOn to off, fires `onchange` for each
- [x] 5.8 Run eslint + prettier on each modified component file

## 6. Update Tests

- [x] 6.1 Update `src/audio/engine.test.js` to reflect always-init powerOn and full-teardown powerOff behaviour
- [x] 6.2 Add or update tests for the reset prop in at least `Modulation.test.js` and `Oscillator.test.js`
- [x] 6.3 Run `npx vitest run` and confirm all tests pass
