## 1. DSP — Rewrite Reverb Section

- [ ] 1.1 Remove `reverbShimmer` parameter declaration from `faust/synth.dsp`
- [ ] 1.2 Add `reverbTone` parameter: `hslider("reverbTone [unit:Hz]", 16000, 1000, 16000, 1)` in `faust/synth.dsp`
- [ ] 1.3 Add `reverbPreDelay` parameter: `hslider("reverbPreDelay [unit:s]", 0, 0, 0.1, 0.0001)` in `faust/synth.dsp`
- [ ] 1.4 Replace the shimmer reverb DSP section (the `~` feedback loop and `shimmerWet`/`shimmerOut` expressions) with a linear chain: `de.fdelay(4801, reverbPreDelayS * ma.SR) : re.mono_freeverb(reverbDecayS, 0.5, 0, 0) : fi.lowpass(1, reverbToneS) : fi.dcblocker` — freeverb `damp` fixed at `0`
- [ ] 1.5 Add smoothed signals `reverbToneS` and `reverbPreDelayS` using `si.smoo`; remove `reverbShimmerS`
- [ ] 1.6 Update the signal chain comment and `process` line to reflect the new reverb stage
- [ ] 1.7 Validate DSP compiles: `faust faust/synth.dsp -o /dev/null`

## 2. UI — Update Effects Panel

- [ ] 2.1 In `Effects.svelte`, remove the shimmer `Knob` component and its `midiState`/`onknobcontextmenu` wiring
- [ ] 2.2 Change the decay `Knob` to `scale="log"` with `min={0.01}` (was `min={0}`)
- [ ] 2.3 Add `tone` Knob: `label="tone"`, `min={1000}`, `max={16000}`, `default={16000}`, `scale="log"`, `unit="Hz"`, param `reverbTone`
- [ ] 2.4 Add `pre-delay` Knob: `label="pre-delay"`, `min={0}`, `max={0.1}`, `default={0}`, `scale="linear"`, `unit="s"`, param `reverbPreDelay`
- [ ] 2.5 Lint and format: `npx eslint --fix src/components/Effects.svelte && npx prettier --write src/components/Effects.svelte`

## 3. MIDI Registry — Update Param Maps

- [ ] 3.1 In `App.svelte` `KNOB_PARAMS`, remove `reverbShimmer` and add `reverbTone: { min: 1000, max: 16000 }` and `reverbPreDelay: { min: 0, max: 0.1 }`
- [ ] 3.2 In `App.svelte` default params array, remove `'reverbShimmer'` and add `'reverbTone'` and `'reverbPreDelay'`
- [ ] 3.3 In `src/audio/midiCcMap.js`, apply the same removals and additions as steps 3.1–3.2
- [ ] 3.4 Lint and format: `npx eslint --fix src/App.svelte && npx prettier --write src/App.svelte`
- [ ] 3.5 Lint and format: `npx eslint --fix src/audio/midiCcMap.js && npx prettier --write src/audio/midiCcMap.js`

## 4. Tests — Update Effects Tests

- [ ] 4.1 In `Effects.test.js`, remove the shimmer knob test (`reverbShimmer` dispatch and context menu)
- [ ] 4.2 Add test: tone knob double-click dispatches `reverbTone`
- [ ] 4.3 Add test: pre-delay knob double-click dispatches `reverbPreDelay`
- [ ] 4.4 Add test: tone knob defaults to 16000
- [ ] 4.5 Add test: pre-delay knob defaults to 0
- [ ] 4.6 Add test: right-click on tone knob calls `onknobcontextmenu` with `'reverbTone'`
- [ ] 4.7 Add test: right-click on pre-delay knob calls `onknobcontextmenu` with `'reverbPreDelay'`
- [ ] 4.8 Add test: shimmer knob is absent from the rendered reverb section
- [ ] 4.9 Lint and format: `npx eslint --fix src/components/Effects.test.js && npx prettier --write src/components/Effects.test.js`
- [ ] 4.10 Run `npx vitest run` and confirm all tests pass
