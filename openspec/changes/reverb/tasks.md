## 1. FAUST DSP — Shimmer Reverb Stage

- [ ] 1.1 Add `reverbOn`, `reverbMix`, `reverbDecay`, and `reverbShimmer` `hslider`/`nentry` parameters to `faust/synth.dsp`
- [ ] 1.2 Implement the shimmer feedback loop: `ef.transpose(512, 256, 12)` scaled by `reverbShimmer` feeding back into `re.mono_freeverb(reverbDecay, 0.5, 1, 0)`
- [ ] 1.3 Implement wet/dry blend via `<: (dry, wet) :>` split-merge, and add `clip(0, 1)` in the `~` feedback path after `ef.transpose` to prevent unbounded buildup
- [ ] 1.4 Wire the bypass using `select2(int(reverbOn), filteredSig, shimmerOut)` between `filteredSig` and `vcaOut`, so the amp envelope is applied after the reverb stage
- [ ] 1.5 Validate FAUST DSP compiles without errors: `npm run faust:build`

## 2. Reverb UI Component

- [ ] 2.1 Create `src/components/Reverb.svelte` with on/off toggle (matching Glide button style, `reverbOn` state), mix knob (0–1, default 0.5), decay knob (0–1, default 0.5), and shimmer knob (0–1, default 0)
- [ ] 2.2 Wire the toggle to dispatch `{ param: 'reverbOn', value: 0|1 }` via `onchange`
- [ ] 2.3 Wire each knob to dispatch the correct param name (`reverbMix`, `reverbDecay`, `reverbShimmer`) via `onchange`
- [ ] 2.4 Accept and pass through `midiState` and `onknobcontextmenu` props for all three knobs
- [ ] 2.5 Run `npx eslint --fix src/components/Reverb.svelte && npx prettier --write src/components/Reverb.svelte`

## 3. App.svelte Integration

- [ ] 3.1 Import `Reverb` component in `App.svelte`
- [ ] 3.2 Add `reverbMix`, `reverbDecay`, `reverbShimmer` entries to `KNOB_PARAMS` in `App.svelte`
- [ ] 3.2b Add `reverbMix` (0–1), `reverbDecay` (0–1), and `reverbShimmer` (0–1) entries to `src/audio/midiCcMap.js` following the existing pattern
- [ ] 3.3 Add `reverbMidiState` derived state using `midiStateFor('reverbMix', 'reverbDecay', 'reverbShimmer')`
- [ ] 3.4 Mount `<Reverb>` in the `filter-output-grid` between `<Filter>` and `<AmpEnv>`, updating `grid-template-columns` from `auto auto` to `auto auto auto`
- [ ] 3.5 Run `npx eslint --fix src/App.svelte && npx prettier --write src/App.svelte`

## 4. Unit Tests

- [ ] 4.1 Create `src/components/Reverb.test.js` with tests: toggle defaults to off and dispatches `reverbOn`; each knob dispatches the correct param name; `onknobcontextmenu` is called with correct param; `midiState` externalValue drives knob display; DSP output level stays bounded (≤ 1.0 amplitude) when shimmer and decay are both at 1.0
- [ ] 4.2 Run `npx vitest run` and confirm all new and existing tests pass

## 5. Final Verification

- [ ] 5.1 Run `npm run faust:build` to confirm WASM artifacts rebuild cleanly
- [ ] 5.2 Start the dev server, power on the synth, enable reverb, and verify audible reverb tail; increase shimmer and verify octave-up harmonic buildup
- [ ] 5.3 Verify the Reverb panel appears between Filter and Amp Env in the UI layout
- [ ] 5.4 Verify MIDI CC learn works for all three reverb knobs
- [ ] 5.5 Run `npx vitest run` for final pass
