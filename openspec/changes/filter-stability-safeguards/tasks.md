## 1. FAUST DSP — filter stability

- [ ] 1.1 In `faust/synth.dsp`, add `si.smooth(ba.tau2pole(0.002))` to `cutoffMod` after the `max`/`min` clamp
- [ ] 1.2 In `faust/synth.dsp`, append `: ma.tanh` to `filteredSig` after `ve.moog_vcf`
- [ ] 1.3 Validate the DSP compiles cleanly: `faust faust/synth.dsp -o /dev/null`
- [ ] 1.4 Rebuild the WASM artefacts: `npm run faust:build`

## 2. JS engine — setParam guard

- [ ] 2.1 In `src/audio/engine.js`, add `if (!Number.isFinite(value)) return` at the top of `setParam` (after the `!node` guard)

## 3. Tests

- [ ] 3.1 In `src/audio/engine.test.js`, add a test that calls `setParam` with `NaN` and asserts `node.setParamValue` is not called
- [ ] 3.2 In `src/audio/engine.test.js`, add a test that calls `setParam` with `Infinity` and asserts `node.setParamValue` is not called
- [ ] 3.3 In `src/audio/engine.test.js`, add a test that calls `setParam` with `-Infinity` and asserts `node.setParamValue` is not called (the `Number.isFinite` guard covers both; this test makes the negative case explicit)
- [ ] 3.4 Run `npx vitest run` and confirm all tests pass

## 4. Verification

- [ ] 4.1 Power on the synth in the browser, set filterEnvAmt to max, filterAttack to minimum, resonance to 0.8, and trigger several rapid notes — confirm no crash
- [ ] 4.2 Confirm normal envelope sweeps (filterEnvAmt ~2000 Hz, attack 10–50 ms) still sound correct with no audible rounding
