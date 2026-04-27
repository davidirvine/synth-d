## 1. DSP — Replace post-filter with internal damping

- [ ] 1.1 In `faust/synth.dsp`, replace `reverbTone = hslider(...)` with `reverbDamp = hslider("reverbDamp", 0.5, 0, 1, 0.001)` and replace `reverbToneS = reverbTone : si.smoo` with `reverbDampS = reverbDamp : si.smoo`
- [ ] 1.2 In `faust/synth.dsp`, update `re.mono_freeverb(reverbDecayS, 0.5, 0, 0)` to `re.mono_freeverb(reverbDecayS, 0.5, reverbDampS, 0)` and remove the `fi.lowpass(1, reverbToneS)` line from the `reverbWet` chain
- [ ] 1.3 Validate the updated DSP file compiles with `faust faust/synth.dsp -o /dev/null`
- [ ] 1.4 Rebuild WASM artefacts: `npm run faust:build`

## 2. UI — Update the DAMP knob in Effects.svelte

- [ ] 2.1 In `src/components/Effects.svelte`, change the `LPF` knob: set `label="damp"`, `min={0}`, `max={1}`, `default={0.5}`, `scale="linear"`, remove `unit="Hz"`, add `showValue={false}`, change the param from `reverbTone` to `reverbDamp` in both `onchange` and `oncontextmenu` handlers, and update the `externalValue`, `learningMidi`, and `assignedCc` props to reference `midiState?.reverbDamp`
- [ ] 2.2 In `src/components/Effects.svelte`, remove the `.reverb-row :global(:nth-child(2) .knob-value)` CSS rule (no longer needed once `showValue={false}`) — **note:** `misc-ui-dsp-fixes` task 5.2 also deletes this rule; if that change has already landed, this step is a no-op
- [ ] 2.3 Run `npx eslint --fix src/components/Effects.svelte && npx prettier --write src/components/Effects.svelte`

## 3. App — Update KNOB_PARAMS and DEFAULTS registries

- [ ] 3.1 In `src/App.svelte`, replace `reverbTone: { min: 1000, max: 16000 }` with `reverbDamp: { min: 0, max: 1 }` in `KNOB_PARAMS`
- [ ] 3.2 In `src/App.svelte`, replace the `reverbTone` default value entry in `DEFAULTS` with `reverbDamp: 0.5`
- [ ] 3.3 Run `npx eslint --fix src/App.svelte && npx prettier --write src/App.svelte`

## 4. MIDI — Update midiCcMap.js

- [ ] 4.1 In `src/audio/midiCcMap.js`, replace the `reverbTone` entry with `reverbDamp: { min: 0, max: 1, default: 0.5 }`
- [ ] 4.2 Run `npx eslint --fix src/audio/midiCcMap.js && npx prettier --write src/audio/midiCcMap.js`

## 5. Tests — Update Effects test suite

- [ ] 5.1 In `src/components/Effects.test.js`, rename all references to `reverbTone` → `reverbDamp` (param names, midiState keys, and test descriptions)
- [ ] 5.2 Update the `LPF knob defaults to 4000 Hz` test: rename to `damp knob defaults to 0.5` and assert the default value is `0.5` (not `4000`)
- [ ] 5.3 Update any midiState fixture objects that reference `reverbTone` to use `reverbDamp` with an appropriate numeric value in range 0–1
- [ ] 5.4 Add a test asserting the damp knob has `showValue={false}` (i.e. the knob value element is not visible / not rendered)
- [ ] 5.4b Add a test asserting `midiCcMap` does not contain a `reverbTone` key (covering the spec scenario "reverbTone is absent from the CC map")
- [ ] 5.5 Run `npx eslint --fix src/components/Effects.test.js && npx prettier --write src/components/Effects.test.js`
- [ ] 5.6 Run `npx vitest run` and confirm all tests pass
