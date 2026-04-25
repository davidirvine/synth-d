## 1. FAUST DSP — Tape Delay Stage

- [ ] 1.1 Add `delayOn`, `delayTime`, `delayFeedback`, and `delayMix` parameters to `faust/synth.dsp` (`nentry` for `delayOn`; `hslider` for the others with ranges: time 0.01–1.0 s, feedback 0–0.9, mix 0–1)
- [ ] 1.2 Define the tape delay model: `maxDelayLen = 96000`; wow LFO `wowLfo = os.osc(0.5) * 0.003`; `tapeTime = min(maxDelayLen - 1, max(1, delayTime * ma.SR + wowLfo * delayTime * ma.SR))`; `delayFeedbackSafe = delayFeedback : ba.clip(0, 0.9)`; feedback path `feedbackPath = _ * delayFeedbackSafe : fi.lowpass(1, 6000) : ma.tanh`; `delayInput = masterOut * int(delayOn)` (feeds zeros to buffer when `delayOn = 0`); `delayWet = delayInput : +~(de.fdelay(maxDelayLen, tapeTime) : feedbackPath)`
- [ ] 1.3 Implement wet/dry blend: `delayOut = masterOut * (1 - delayMix) + delayWet * delayMix`; bypass: `delayStage = select2(int(delayOn), masterOut, delayOut)`
- [ ] 1.4 Wire `delayStage` as the input to the shimmer reverb stage (in place of `masterOut`), so the signal chain becomes `masterOut → delayStage → shimmerOut → process`
- [ ] 1.5 Validate FAUST DSP compiles without errors: `npm run faust:build`

## 2. Effects UI Component

- [ ] 2.1 Create `src/components/Effects.svelte` with a single outer `div.panel` labelled "EFFECTS" (`span.panel-label`)
- [ ] 2.2 Add the DELAY sub-section: `span.sub-label` "DELAY", then a row with an on/off toggle (matching Glide button style, `delayOn` state), time knob (0.01–1.0 s, log scale, default 0.3 s), feedback knob (0–0.9, linear, default 0.3), and mix knob (0–1, linear, default 0.3)
- [ ] 2.3 Add a `div.section-divider` between the DELAY and REVERB sub-sections (matching the `AmpEnv.svelte` divider)
- [ ] 2.4 Add the REVERB sub-section: `span.sub-label` "REVERB", then a row with the reverb on/off toggle, mix knob, decay knob, and shimmer knob — identical to the controls that were in `Reverb.svelte`
- [ ] 2.5 Wire the delay toggle to dispatch `{ param: 'delayOn', value: 0|1 }` and each delay knob to dispatch `delayTime`, `delayFeedback`, `delayMix`; wire the reverb toggle to dispatch `reverbOn` and each reverb knob to dispatch `reverbMix`, `reverbDecay`, `reverbShimmer`
- [ ] 2.6 Accept and pass through `midiState` and `onknobcontextmenu` props for all six learnable knobs
- [ ] 2.7 Run `npx eslint --fix src/components/Effects.svelte && npx prettier --write src/components/Effects.svelte`
- [ ] 2.8 Delete `src/components/Reverb.svelte` (the component is fully superseded by `Effects.svelte`); `Reverb.test.js` is NOT deleted here — it continues to guard reverb control behaviour until task 4.1 provides equivalent coverage in `Effects.test.js`

## 3. App.svelte Integration

- [ ] 3.1 Import `Effects` and remove the `Reverb` import in `App.svelte`
- [ ] 3.2 Add `delayTime` (0.01–1.0), `delayFeedback` (0–0.9), and `delayMix` (0–1) entries to `KNOB_PARAMS` in `App.svelte`
- [ ] 3.3 Merge delay and reverb MIDI state: replace `reverbMidiState` with `effectsMidiState` derived from `midiStateFor('reverbMix', 'reverbDecay', 'reverbShimmer', 'delayTime', 'delayFeedback', 'delayMix')`
- [ ] 3.4 Replace `<Reverb>` with `<Effects midiState={effectsMidiState} onchange={onParamChange} onknobcontextmenu={onKnobContextMenu} />` in the template
- [ ] 3.5 Run `npx eslint --fix src/App.svelte && npx prettier --write src/App.svelte`

## 4. Unit Tests

- [ ] 4.1 Create `src/components/Effects.test.js` with tests: delay toggle defaults to off and dispatches `delayOn`; reverb toggle defaults to off and dispatches `reverbOn`; each delay knob dispatches the correct param name; each reverb knob dispatches the correct param name; `onknobcontextmenu` is called with the correct param for all six knobs; `midiState.delayTime.externalValue` drives the time knob display — then delete `src/components/Reverb.test.js` once all reverb scenarios are confirmed green in `Effects.test.js`
- [ ] 4.2 Run `npx vitest run` and confirm all new and existing tests pass with `Reverb.test.js` removed

## 5. Final Verification

- [ ] 5.1 Run `npm run faust:build` to confirm WASM artifacts rebuild cleanly
- [ ] 5.2 Start the dev server, enable delay, play a note, and verify audible tape-delay repeats (warm, slightly wavering); confirm repeats continue and feed into reverb after note release
- [ ] 5.3 Verify the combined EFFECTS panel shows "DELAY" above "REVERB" with a divider between them
- [ ] 5.4 Verify MIDI CC learn works for all three delay knobs and all three reverb knobs
- [ ] 5.5 Run `npx vitest run` for final pass
