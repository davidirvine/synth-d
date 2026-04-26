## 1. DSP Fix

- [ ] 1.1 In `faust/synth.dsp`, in the Modulation section, replace `no.noise` with `noiseSrc` in the `modSrc` expression: `modSrc = osc3Signal * (1 - modMix) + noiseSrc * modMix`
- [ ] 1.2 Validate the DSP compiles cleanly: `faust faust/synth.dsp -o /dev/null`

## 2. Rebuild WASM Artifacts

- [ ] 2.1 Run `npm run faust:build` to regenerate `public/synth.wasm`, `public/synth.js`, and related artifacts
- [ ] 2.2 Confirm the dev server starts and audio initialises without errors in the browser console

## 3. Verification

- [ ] 3.1 In the browser, set mixer noise type to pink, raise mod mix toward noise, enable a mod route (e.g. filter), and confirm the modulation character changes relative to white noise
- [ ] 3.2 Run `npx vitest run` and confirm all tests pass
