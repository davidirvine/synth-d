## 1. Raise the resonance ceiling

- [x] 1.1 In [faust/synth.dsp](../../../faust/synth.dsp), change `resonanceSafe = min(0.7, resonance)` (line 155) to cap at the documented stability ceiling (≈0.97) instead of 0.7, so the resonance knob reaches the near-self-oscillation squelch zone
- [x] 1.2 Validate the DSP compiles: `faust faust/synth.dsp -o /dev/null`
- [x] 1.3 Commit (`fix(filter): raise resonance ceiling to stability limit so squelch zone is reachable`)

## 2. Add fixed input drive

- [ ] 2.1 In [faust/synth.dsp](../../../faust/synth.dsp), **replace the single `filteredSig` line (line 156)** so the chain becomes `filteredSig = attach(mixerOut, mixerPeak) : _ * DRIVE : ma.tanh : ve.moog_vcf_2bn(resonanceSafe, cutoffMod) : ma.tanh;` — inserting a fixed gain `DRIVE` (`> 1` and `≤ 3`, start ≈1.5) **after** the `attach(mixerOut, mixerPeak)` expression and before the existing pre-filter `ma.tanh`. This modifies the existing binding (do not add a second `filteredSig =`); the drive sits after the `attach` so the `mixerPeak` meter still reports the undriven mixer level. Define `DRIVE` as a named constant with a comment noting it is audio-gate-tuned
- [ ] 2.2 Validate the DSP compiles: `faust faust/synth.dsp -o /dev/null`
- [ ] 2.3 Commit (`feat(filter): drive mixer signal into the ladder for saturated squelch`)

## 3. Verification

- [ ] 3.1 Run `/opsx:verify uncap-filter-resonance` and resolve any artifact/implementation mismatch before proceeding (hard gate)
- [ ] 3.2 Run the completion-gate test suite: `npx vitest run`, `npx stryker run` (mutation ≥ 85%), `npx playwright test`
- [ ] 3.3 Audio-verification gate (human): with the app running, confirm fat Moog squelch is reachable at high resonance, set the final resonance-ceiling value (≈0.92–0.97) and drive multiplier (≈1.5) by ear, and confirm low-resonance tones stay usable; if either constant changes, update [faust/synth.dsp](../../../faust/synth.dsp) and commit the tuned values (`fix(filter): tune resonance ceiling and drive to audio-gate values`)
- [ ] 3.4 Run `roborev status`, then `roborev refine --max-iterations 3`; present results and await human approval before opening the PR
