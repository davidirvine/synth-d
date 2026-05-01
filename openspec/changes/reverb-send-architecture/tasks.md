## 1. DSP rewrite

- [ ] 1.1 Rename `reverbMix` parameter to `reverbSend` in `faust/synth.dsp` (slider declaration and all references), keeping the 0–1 range and changing the default from 0.5 to 0.3. Validate with `faust faust/synth.dsp -o /dev/null`. Commit: `feat(reverb): rename reverbMix to reverbSend with 0.3 default`
- [ ] 1.2 Change `reverbPreDelay` default in `faust/synth.dsp` from `0` to `0.015`. Validate with `faust`. Commit: `feat(reverb): set reverbPreDelay default to 15 ms`
- [ ] 1.3 Insert `fi.highpass(2, 180)` between the pre-delay line and `re.mono_freeverb` in the `reverbWet` definition. Validate with `faust`. Commit: `feat(reverb): high-pass send path at 180 Hz`
- [ ] 1.4 Replace the dry/wet crossfade `delayStage <: (_ * (1 - reverbMixS), reverbWet * reverbMixS) :> _` with the send-style sum `delayStage + reverbWet * reverbSendS`. Verify the `select2(int(reverbOn), delayStage, reverbOut)` bypass still passes the unattenuated dry signal when `reverbOn = 0`. Validate with `faust`. Commit: `feat(reverb): replace crossfade with send-style routing`
- [ ] 1.5 Run `npx vitest run` to confirm DSP-adjacent JS tests still load and the rebuild produces a valid worklet. Commit only if changes are required: `chore(reverb): refresh derived DSP artifacts`

## 2. Application layer rename

- [ ] 2.1 Update `src/App.svelte` `KNOB_PARAMS` registry: replace the `reverbMix` entry with `reverbSend` (preserve range 0–1, set default 0.3). Run lint+format on the file. Commit: `feat(reverb): register reverbSend in KNOB_PARAMS`
- [ ] 2.2 Update `src/lib/midiCcMap.js`: replace `reverbMix` entry with `reverbSend` (range 0–1). Run lint+format. Commit: `feat(reverb): map reverbSend in midiCcMap`
- [ ] 2.3 Search the codebase for any remaining `reverbMix` string references (`grep -rn "reverbMix" src/ e2e/`) and audit each. Anything outside test files should be renamed; test references will be updated in section 3. Commit if non-test files were updated: `refactor(reverb): remove residual reverbMix references`
- [ ] 2.4 Verify whether MIDI CC assignments persist across reloads (e.g., `localStorage` or similar). If they do, add a one-time read-side filter that ignores stale `reverbMix` keys; document the decision inline. If they don't, note in the PR description that no migration was required. Commit only if code changes: `feat(reverb): ignore stale reverbMix MIDI assignments`

## 3. UI layer rename and defaults

- [ ] 3.1 Update `src/components/Effects.svelte`: rename the first reverb knob's label from `mix` to `send`, change the param name in `onchange` and `oncontextmenu` payloads from `reverbMix` to `reverbSend`, update `midiState.reverbMix` references to `midiState.reverbSend`, and change the knob's default value from 0.5 to 0.3. Run lint+format. Commit: `feat(reverb): rename mix knob to send with 0.3 default`
- [ ] 3.2 Update the pre-delay knob default in `src/components/Effects.svelte` from 0 to 0.015. Run lint+format. Commit: `feat(reverb): set pre-delay knob default to 15 ms`
- [ ] 3.3 Verify no orphan CSS rule remains for the old mix knob position; remove any stale selectors. Run lint+format. Commit only if changes: `style(reverb): clean up stale mix-knob selectors`

## 4. Tests

- [ ] 4.1 Update `src/components/Effects.test.js`: rename `reverbMix` assertions to `reverbSend`, change expected default from 0.5 to 0.3, change pre-delay expected default from 0 to 0.015, update knob-label assertions from `mix` to `send`, and update `onchange` payload assertions. Run `npx vitest run src/components/Effects.test.js`. Commit: `test(reverb): cover reverbSend knob and updated defaults`
- [ ] 4.2 Update `src/App.test.js`: rename any `reverbMix` references to `reverbSend`, update expected defaults if asserted. Run `npx vitest run src/App.test.js`. Commit: `test(reverb): update App-level reverb param assertions`
- [ ] 4.3 Update any Playwright specs in `e2e/` that target the reverb mix knob label or default value. Run `npx playwright test` only for affected specs. Commit if changes: `test(reverb): update e2e assertions for send knob`
- [ ] 4.4 Add a unit test that asserts the engine forwards `reverbSend` from JS to the worklet (mirroring how other params are tested). Run vitest. Commit: `test(reverb): assert reverbSend forwards to worklet`

## 5. Spec sync

- [ ] 5.1 After all sections above pass, run `openspec status --change reverb-send-architecture` and confirm all artifacts are `done`. No commit (read-only check).

## 6. Section completion gate

- [ ] 6.1 Run `npx vitest run` for the whole suite and confirm green.
- [ ] 6.2 Run `roborev status` to confirm the daemon is healthy. If not running, halt and report.
- [ ] 6.3 Run `roborev refine --max-iterations 3` and present results to the human.
- [ ] 6.4 Wait for explicit human approval covering: visual verification of the reverb knob label and defaults, audio verification that engaging reverb no longer cuts dry low-end, and approval to open the PR.
- [ ] 6.5 On approval, run `stax ss --yes --no-prompt` to push and open the PR. Report the PR URL.
