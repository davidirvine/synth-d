## 1. FAUST DSP — filter stability

- [x] 1.1 In `faust/synth.dsp`, add `si.smooth(ba.tau2pole(0.002))` to `cutoffMod` after the `max`/`min` clamp
- [x] 1.2 In `faust/synth.dsp`, append `: ma.tanh` to `filteredSig` after `ve.moog_vcf`
- [x] 1.3 Validate the DSP compiles cleanly: `faust faust/synth.dsp -o /dev/null`
- [x] 1.4 Rebuild the WASM artefacts: `npm run faust:build`

## 2. JS engine — setParam guard

<<<<<<< bugfix/filter-stability-safeguards
- [x] 2.1 In `src/audio/engine.js`, add `if (!Number.isFinite(value)) return` at the top of `setParam` (after the `!node` guard)
=======
- [ ] 2.1 In `src/audio/engine.js`, add `if (!Number.isFinite(value)) return` at the top of `setParam` (after the `!node` guard)
- [ ] 2.2 Run `npx eslint --fix src/audio/engine.js && npx prettier --write src/audio/engine.js`
>>>>>>> develop

## 3. Tests

- [x] 3.1 In `src/audio/engine.test.js`, add a test that calls `setParam` with `NaN` and asserts `node.setParamValue` is not called
- [x] 3.2 In `src/audio/engine.test.js`, add a test that calls `setParam` with `Infinity` and asserts `node.setParamValue` is not called
- [x] 3.3 In `src/audio/engine.test.js`, add a test that calls `setParam` with `-Infinity` and asserts `node.setParamValue` is not called (the `Number.isFinite` guard covers both; this test makes the negative case explicit)
- [x] 3.4 Run `npx vitest run` and confirm all tests pass

- [x] 3.5 In `src/audio/engine.test.js`, add a regression test that powers on the engine, sets `cutoff` to 18 000 Hz and `resonance` to 0.97, triggers a note, and asserts `node.setParamValue` was called with finite values throughout (guards against NaN/Infinity reaching the DSP at extreme settings)
- [ ] 3.6 Add an offline Vitest fixture that drives the DSP with an impulse at `cutoffMod = 18000`, `resonance = 0.97` and asserts `|output| ≤ 1.0` at every sample — formally verifies the `ma.tanh` output guard contains any residual instability

## 4. Verification

- [x] 4.1 Power on the synth in the browser, set filterEnvAmt to max, filterAttack to minimum, resonance to 0.8, and trigger several rapid notes — confirm no crash
- [x] 4.2 Confirm normal envelope sweeps (filterEnvAmt ~2000 Hz, attack 10–50 ms) still sound correct with no audible rounding
- [ ] 4.3 (future) Add an offline signal-level test: render a loud transient through the filter at near-maximum resonance with a cutoff sweep and assert peak output ≤ 1.0 — this would formally close the post-filter `ma.tanh` stability guard goal
