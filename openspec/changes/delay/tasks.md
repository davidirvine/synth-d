## 1. FAUST DSP — Feedback Delay Stage

- [ ] 1.1 Add `delayOn`, `delayTime`, `delayFeedback`, and `delayMix` parameters to `faust/synth.dsp` (`nentry` for `delayOn`; `hslider` for the others with ranges: time 0.01–1.0 s, feedback 0–0.9, mix 0–1)
- [ ] 1.2 Define the gated delay input and feedback circuit together: `delayFeedbackSafe = delayFeedback : ba.clip(0, 0.9)`; `delayInput = vcaOut * int(delayOn)` (feeds zeros to buffer when `delayOn = 0`); `delayWet = delayInput : +~(de.sdelay(96000, 1024, delayTime * ma.SR) * delayFeedbackSafe)`
- [ ] 1.3 Implement wet/dry blend: `delayOut = vcaOut * (1 - delayMix) + delayWet * delayMix`, where `delayWet` is the signal from the feedback circuit defined in 1.2
- [ ] 1.4 Wire the bypass: `select2(int(delayOn), vcaOut, delayOut)` post-VCA, before `* masterVol`
- [ ] 1.5 Validate FAUST DSP compiles without errors: `npm run faust:build`

## 2. Delay UI Component

- [ ] 2.1 Create `src/components/Delay.svelte` with on/off toggle (matching Glide button style, `delayOn` state), time knob (0.01–1.0 s, log scale, default 0.3 s), feedback knob (0–0.9, linear, default 0.3), and mix knob (0–1, linear, default 0.3)
- [ ] 2.2 Wire the toggle to dispatch `{ param: 'delayOn', value: 0|1 }` via `onchange`
- [ ] 2.3 Wire each knob to dispatch the correct param name (`delayTime`, `delayFeedback`, `delayMix`) via `onchange`
- [ ] 2.4 Accept and pass through `midiState` and `onknobcontextmenu` props for all three knobs
- [ ] 2.5 Run `npx eslint --fix src/components/Delay.svelte && npx prettier --write src/components/Delay.svelte`

## 3. App.svelte Integration

- [ ] 3.1 Import `Delay` component in `App.svelte`
- [ ] 3.2 Add `delayTime` (0.01–1.0), `delayFeedback` (0–0.9), and `delayMix` (0–1) entries to `KNOB_PARAMS` in `App.svelte`
- [ ] 3.3 Add `delayMidiState` derived state using `midiStateFor('delayTime', 'delayFeedback', 'delayMix')`
- [ ] 3.4 Mount `<Delay>` in the `filter-output-grid` at column 2, row 2 (directly below `<Reverb>`); adjust `grid-column` spans on the Modulation+Glide row as needed to keep the bottom row correct
- [ ] 3.5 Run `npx eslint --fix src/App.svelte && npx prettier --write src/App.svelte`

## 4. Unit Tests

- [ ] 4.1 Create `src/components/Delay.test.js` with tests: toggle defaults to off and dispatches `delayOn`; each knob dispatches the correct param name; `onknobcontextmenu` is called with the correct param; `midiState.delayTime.externalValue` drives the time knob display
- [ ] 4.2 Run `npx vitest run` and confirm all new and existing tests pass

## 5. Final Verification

- [ ] 5.1 Run `npm run faust:build` to confirm WASM artifacts rebuild cleanly
- [ ] 5.2 Start the dev server, enable delay, play a note, and verify audible repeats; confirm repeats continue after note release (post-VCA behavior)
- [ ] 5.3 Verify the Delay panel appears directly below the Reverb panel in the UI
- [ ] 5.4 Verify MIDI CC learn works for all three delay knobs
- [ ] 5.5 Run `npx vitest run` for final pass
