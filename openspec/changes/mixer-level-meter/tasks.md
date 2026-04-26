## 1. Spike — Validate bargraph read access

- [ ] 1.1 Add a temporary `vbargraph("mixerPeak [unit:linear]", 0, 4, abs(mixerOut))` to `faust/synth.dsp` and rebuild WASM (`npm run faust:build`)
- [ ] 1.2 In browser devtools, call `node.getParamValue('/synth/mixerPeak')` while audio plays and confirm a non-zero value is returned
- [ ] 1.3 If bargraph read fails, investigate alternative (e.g. output as a separate hslider written by the DSP, or use a second AnalyserNode) and update design.md before proceeding

## 2. DSP — Add mixer peak bargraph

- [ ] 2.1 Add `mixerPeak = vbargraph("mixerPeak [unit:linear]", 0, 4, abs(mixerOut))` to `faust/synth.dsp` at the mixer output, before the `ma.tanh` soft clipper
- [ ] 2.2 Validate DSP compiles: `faust faust/synth.dsp -o /dev/null`
- [ ] 2.3 Rebuild WASM: `npm run faust:build`

## 3. Engine — getMixerPeak

- [ ] 3.1 Add `export function getMixerPeak()` to `src/audio/engine.js` that returns `node ? node.getParamValue(PARAM_PREFIX + 'mixerPeak') : 0`
- [ ] 3.2 Run `npx eslint --fix src/audio/engine.js && npx prettier --write src/audio/engine.js`

## 4. LevelMeter Component

- [ ] 4.1 Create `src/components/LevelMeter.svelte` with props: `getPeak` (function), `powered` (boolean)
- [ ] 4.2 Implement 8-segment vertical LED strip rendered as CSS divs
- [ ] 4.3 Define segment thresholds: segments 1–4 green (0–0.5), 5–6 yellow (0.5–0.85), 7 orange (0.85–1.0), 8 red clip (>1.0)
- [ ] 4.4 Implement `requestAnimationFrame` polling loop that calls `getPeak()` and updates lit segment count each frame
- [ ] 4.5 Implement clip latch: when peak > 1.0 set a `clipLit` flag and schedule a `setTimeout` of 1500ms to clear it; refreshing the timeout on each new clip event
- [ ] 4.6 Stop polling and set all segments dark when `powered` is false
- [ ] 4.7 Cancel `rAF` and any pending `setTimeout` in `onDestroy`
- [ ] 4.8 Run `npx eslint --fix src/components/LevelMeter.svelte && npx prettier --write src/components/LevelMeter.svelte`

## 5. Integrate into Mixer

- [ ] 5.1 Import `LevelMeter` in `src/components/Mixer.svelte`
- [ ] 5.2 Add `getPeak` and `powered` props to the Mixer component signature
- [ ] 5.3 Add `LevelMeter` to the mixer layout as a vertical column alongside the source knobs
- [ ] 5.4 Run `npx eslint --fix src/components/Mixer.svelte && npx prettier --write src/components/Mixer.svelte`

## 6. Wire up in App.svelte

- [ ] 6.1 Import `getMixerPeak` from `src/audio/engine.js` in `src/App.svelte`
- [ ] 6.2 Pass `getPeak={getMixerPeak}` and `powered={powered}` to the `Mixer` component
- [ ] 6.3 Run `npx eslint --fix src/App.svelte && npx prettier --write src/App.svelte`

## 7. Tests

- [ ] 7.1 Create `src/components/LevelMeter.test.js` covering: all segments unlit when powered=false, clip segment lights when peak > 1.0, clip latch persists after peak drops
- [ ] 7.2 Run `npx vitest run` and confirm all tests pass
