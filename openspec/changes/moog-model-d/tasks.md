## 1. Branch Setup

- [x] 1.1 Create branch `moog-model-d` from `develop`
- [x] 1.2 Run `npx vitest run` — confirm baseline tests pass before any changes

## 2. FAUST DSP — Three-Oscillator Bank

- [x] 2.1 Replace single oscillator with OSC 1: six waveforms (triangle, reverse-sawtooth, sawtooth, square, wide pulse, narrow pulse) via `ba.selectn(6, osc1Wave)`, octave range parameter `osc1Range`
- [x] 2.2 Add OSC 2 with same six waveforms, `osc2Wave`, `osc2Range`, and `osc2Detune` (±100 cents): `osc2Freq = glideFreq * pow(2, osc2Range) * pow(2, osc2Detune / 1200)`
- [x] 2.3 Add OSC 3 with same six waveforms, `osc3Wave`, `osc3Range`, `osc3Detune`, `osc3LfoMode` toggle, and `osc3LfoRate` (0.1–20 Hz); when `osc3LfoMode=1` OSC 3 frequency = `osc3LfoRate`
- [x] 2.4 Run `faust faust/synth.dsp -o /dev/null` — no errors

## 3. FAUST DSP — Mixer

- [x] 3.1 Add level parameters `osc1Level`, `osc2Level`, `osc3Level`, `noiseLevel` (0–1 each); OSC 3 level is gated to zero when `osc3LfoMode=1`: `osc3Mix = osc3Signal * osc3Level * (1 - osc3LfoMode)`
- [x] 3.2 Add `noiseType` parameter (0 = white `no.noise`, 1 = pink `no.pink_noise`); mixer noise = `select2(noiseType, no.noise, no.pink_noise) * noiseLevel`
- [x] 3.3 Sum all four sources into a single mixer output feeding the filter
- [x] 3.4 Run `faust faust/synth.dsp -o /dev/null` — no errors

## 4. FAUST DSP — Ladder Filter

- [x] 4.1 Replace SEM SVF (`fi.lowpass`/`fi.highpass` crossfade) with `ve.moog_vcf(resonance, cutoffMod, signal)`
- [x] 4.2 Remove `filterMode` parameter entirely
- [x] 4.3 Add `keyTrack` parameter (0–1); compute `cutoffMod = cutoff + keyTrack * (freq - 261.63) + filterEnvOut * filterEnvAmt`
- [x] 4.4 Change `filterEnvAmt` range to 0–10 000 Hz (positive-only)
- [x] 4.5 Run `faust faust/synth.dsp -o /dev/null` — no errors

## 5. FAUST DSP — ADSR Envelopes

- [x] 5.1 Replace filter `en.ar(filterAttack, filterDecay)` with `en.adsr(filterAttack, filterDecay, filterSustain, filterRelease, gate)`; add parameters `filterSustain` (0–1) and `filterRelease` (0.001–8 s)
- [x] 5.2 Replace amp `en.ar(ampAttack, ampDecay)` with `en.adsr(ampAttack, ampDecay, ampSustain, ampRelease, gate)`; add parameters `ampSustain` (0–1) and `ampRelease` (0.001–8 s)
- [x] 5.3 Add `drLock` parameter (0/1); when 1: `effectiveAmpRelease = ampDecay`, when 0: `effectiveAmpRelease = ampRelease`
- [x] 5.4 Run `faust faust/synth.dsp -o /dev/null` — no errors

## 6. FAUST DSP — Glide

- [x] 6.1 Add `glideOn` (0/1) and `glideRate` (0–5 s) parameters
- [x] 6.2 Apply portamento to the keyboard frequency before pitch calculation: `glideFreq = freq : ba.portamento(glideOn * glideRate)`; all three oscillators use `glideFreq` as their base pitch
- [x] 6.3 Run `faust faust/synth.dsp -o /dev/null` — no errors

## 7. FAUST DSP — Modulation Routing

- [x] 7.1 Add `modMix` (0–1), `modWheel` (0–1), `modToOsc1` (0/1), `modToOsc2` (0/1), `modToFilter` (0/1) parameters
- [x] 7.2 Compute modulation source: `modSrc = osc3Signal * (1 - modMix) + no.noise * modMix`; compute modulation signal: `modSig = modSrc * modWheel`
- [x] 7.3 Apply pitch modulation to OSC 1 and OSC 2 as multiplicative factor: `pitchFactor(sig) = pow(2, sig * 2 / 12)`; OSC 1 freq multiplied by `pitchFactor(modSig) * modToOsc1` (guard: when `modToOsc1=0` factor = 1)
- [x] 7.4 Apply filter modulation: add `modSig * modToFilter * modFilterDepth` (fixed depth constant, e.g. 2000 Hz) to `cutoffMod`
- [x] 7.5 Run `faust faust/synth.dsp -o /dev/null` — no errors

## 8. DSP Build

- [ ] 8.1 Run `npm run faust:build` — produces `public/synth.wasm` and `public/synth.json` without errors
- [ ] 8.2 Commit `faust/synth.dsp`, `public/synth.wasm`, `public/synth.json`
- [ ] 8.3 Run `npx vitest run` — all tests pass

## 9. Oscillator Component Redesign

- [ ] 9.1 Rewrite `Oscillator.svelte`: three sub-sections (OSC 1 / OSC 2 / OSC 3), each with a six-option waveform selector (tri / rev-saw / saw / sq / wide / narrow) and an octave range stepper (±2)
- [ ] 9.2 Add bipolar detune `Knob` (±100 cents, `bipolar={true}`) to OSC 2 and OSC 3 sub-sections
- [ ] 9.3 Add LFO mode toggle switch and LFO rate `Knob` (0.1–20 Hz) to OSC 3 sub-section; rate knob is disabled when LFO mode is off
- [ ] 9.4 Emit `onchange` events for all new parameters (`osc1Wave`, `osc1Range`, `osc2Wave`, `osc2Range`, `osc2Detune`, `osc3Wave`, `osc3Range`, `osc3Detune`, `osc3LfoMode`, `osc3LfoRate`)
- [ ] 9.5 Run `npx eslint --fix src/components/Oscillator.svelte && npx prettier --write src/components/Oscillator.svelte`
- [ ] 9.6 Run `npx vitest run` — all tests pass

## 10. New Components — Mixer, Modulation, Glide

- [ ] 10.1 Create `Mixer.svelte`: four `Knob` components for `osc1Level`, `osc2Level`, `osc3Level`, `noiseLevel`; white/pink toggle switch emitting `noiseType`; standard `onchange` + `midiState` + `onknobcontextmenu` props
- [ ] 10.2 Create `Modulation.svelte`: `modMix` knob; three toggle switches (`modToOsc1`, `modToOsc2`, `modToFilter`); vertical slider for `modWheel` (virtual mod wheel); standard props
- [ ] 10.3 Create `Glide.svelte`: on/off toggle for `glideOn`; `Knob` for `glideRate` (0–5 s, log); rate knob visually disabled when glide is off; standard props
- [ ] 10.4 Run eslint + prettier on all three new files
- [ ] 10.5 Run `npx vitest run` — all tests pass

## 11. Update Existing Components + App.svelte Wiring

- [ ] 11.1 Update `Filter.svelte`: remove `filterMode` knob; add `keyTrack` knob (0–1, linear)
- [ ] 11.2 Update `FilterEnv.svelte`: add `filterSustain` knob (0–1, linear) and `filterRelease` knob (0.001–8 s, log); change `filterEnvAmt` range to 0–10 000 Hz (remove `bipolar` prop)
- [ ] 11.3 Update `AmpEnv.svelte`: add `ampSustain` knob (0–1, linear) and `ampRelease` knob (0.001–8 s, log); add D/R lock toggle switch emitting `drLock`; disable release knob when `drLock` is on
- [ ] 11.4 Update `App.svelte` `KNOB_PARAMS` registry: remove `filterMode`; add all new parameters with correct min/max ranges; add `modWheel` CC 1 mapping
- [ ] 11.5 Import and mount `Mixer`, `Modulation`, `Glide` in `App.svelte`; add derived `midiState` objects for each new component
- [ ] 11.6 Wire MIDI CC 1 to `modWheel`: incoming CC 1 updates `ccExternalValues.modWheel` which flows to the `Modulation` virtual wheel
- [ ] 11.7 Run eslint + prettier on all modified files
- [ ] 11.8 Run `npx vitest run` — all tests pass

## 12. Unit Tests

- [ ] 12.1 Update `Oscillator.test.js`: cover three-osc waveform selection, detune, LFO mode toggle, LFO rate enable/disable
- [ ] 12.2 Write `Mixer.test.js`: cover level knob rendering, noise type toggle, `onchange` emission for all four levels and noise type
- [ ] 12.3 Write `Modulation.test.js`: cover mod mix knob, three routing switches, virtual mod wheel drag and CC 1 sync
- [ ] 12.4 Write `Glide.test.js`: cover toggle switch, rate knob enable/disable based on toggle state
- [ ] 12.5 Run `npx vitest run` — all tests pass

## 13. Component Tests

- [ ] 13.1 Update `Filter.test.js`: assert `filterMode` knob absent; assert `keyTrack` knob present
- [ ] 13.2 Update `FilterEnv.test.js` (or create): assert sustain and release knobs present; assert `filterEnvAmt` range is 0–10 000 (no `bipolar` prop)
- [ ] 13.3 Update `AmpEnv.test.js` (or create): assert sustain and release knobs present; assert D/R lock switch present; assert release knob disabled when D/R lock on
- [ ] 13.4 Update `App.test.js`: assert all eight panels render; assert MIDI CC 1 updates mod wheel external value
- [ ] 13.5 Run `npx vitest run` — all tests pass

## 14. Stryker Mutation Tests

- [ ] 14.1 Run `npx stryker run` — mutation score ≥ 85%

## 15. Playwright Tests

- [ ] 15.1 Update Playwright smoke test: update parameter name assertions for new DSP params; add assertions for at least one interaction with mixer, modulation, and glide panels
- [ ] 15.2 Run `npx playwright test` — all tests pass

## 16. Final Verification

- [ ] 16.1 Run `npx vitest run` — all tests pass
- [ ] 16.2 Run `npx stryker run` — mutation score ≥ 85%
- [ ] 16.3 Run `npx playwright test` — all tests pass
- [ ] 16.4 Run `openspec archive --change moog-model-d` after all verification passes
