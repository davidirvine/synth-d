## 1. Hz Display Precision Fix

- [ ] 1.1 In `src/audio/math.js` `formatValue`, add a `< 10` Hz branch that uses `val.toFixed(1)` instead of `Math.round(val)`
- [ ] 1.2 Update any test in the codebase that asserts `"0 Hz"` or a whole-number Hz label for a sub-10 Hz input to expect the decimal form

## 2. Mod Wheel Default Sync

- [ ] 2.1 In `faust/synth.dsp`, change the `modWheel` hslider default from `0` to `0.5`
- [ ] 2.2 In `src/components/Modulation.svelte`, change `let modWheel = $state(0)` to `$state(0.5)`
- [ ] 2.3 Run `npm run faust:build` to rebuild WASM artifacts after the DSP change

## 3. filterModHz Smoother

- [ ] 3.1 In `faust/synth.dsp`, wrap `filterModHz` in a one-pole smoother: replace `filterModHz = modSig * modToFilter * modFilterDepth;` with a two-line form that applies `si.smooth(ba.tau2pole(0.005))`
- [ ] 3.2 Run `npm run faust:build` to rebuild WASM artifacts
- [ ] 3.3 Validate `faust/synth.dsp` compiles cleanly: `faust faust/synth.dsp -o /dev/null`

## 4. Verification

- [ ] 4.1 Run `npx vitest run` — all tests pass
- [ ] 4.2 Manual check: LFO rate knob at 0.5 Hz shows "0.5 Hz" in the label (not "0 Hz" or "1 Hz")
- [ ] 4.3 Manual check: mod wheel initialises at the 50% position on a fresh page load
- [ ] 4.4 Manual check: OSC 3 in audio mode routed to filter produces no pops or runaway resonance at high resonance settings
