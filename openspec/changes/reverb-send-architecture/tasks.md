## 1. DSP rewrite

> **Note**: Sections 1–3 form a single atomic rename across DSP, application registry, and UI. Vitest assertions that reference `reverbMix` will fail intermediately; the suite is expected to return to green only after section 4 has updated the tests. Each task step is still committed individually so the diff is reviewable, but full-suite green is only required at the section 6 gate.

- [x] 1.1 Rename `reverbMix` parameter to `reverbSend` in `faust/synth.dsp` (slider declaration and all references), keeping the 0–1 range and changing the default from 0.5 to 0.3. Validate with `faust faust/synth.dsp -o /dev/null`. Commit: `feat(reverb): rename reverbMix to reverbSend with 0.3 default`
- [x] 1.2 Change `reverbPreDelay` default in `faust/synth.dsp` from `0` to `0.015`. Validate with `faust`. Commit: `feat(reverb): set reverbPreDelay default to 15 ms`
- [x] 1.3 Insert `fi.highpass(2, 180)` between the pre-delay line and `re.mono_freeverb` in the `reverbWet` definition. Validate with `faust`. Commit: `feat(reverb): high-pass send path at 180 Hz`
- [x] 1.4 Replace the dry/wet crossfade `delayStage <: (_ * (1 - reverbMixS), reverbWet * reverbMixS) :> _` with the send-style sum `delayStage + reverbWet * reverbSendS`. Verify the `select2(int(reverbOn), delayStage, reverbOut)` bypass still passes the unattenuated dry signal when `reverbOn = 0`. Validate with `faust`. Commit: `feat(reverb): replace crossfade with send-style routing`
- [x] 1.5 Validate that the DSP recompiles cleanly and the WASM artifact is producible (e.g., `npm run faust:build` or the project's equivalent). JS tests referencing `reverbMix` are expected to fail at this point because the application-layer rename has not landed yet — this is acceptable. Skip running `npx vitest run` until section 2 is complete. No commit unless the build script touches generated artifacts.

## 2. Application layer rename

- [x] 2.1 Update `src/App.svelte` at all three `reverbMix` sites: `KNOB_PARAMS` registry (line 41), `DEFAULTS` (line 129, change value from 0.5 to 0.3), and the `midiStateFor(...)` call list (line 312); replace `reverbMix` with `reverbSend` in each. Also change `DEFAULTS.reverbPreDelay` (line 132) from `0` to `0.015` so the App-level default matches the DSP default and the new Knob default introduced in 3.2 (Decision 4). Run lint+format on the file. Commit: `feat(reverb): register reverbSend across App.svelte`
- [x] 2.2 Add a load-time translation in `src/audio/midiCcMap.js`: in `MidiCcMap#load()`, when a stored entry has `param === 'reverbMix'`, load it into the in-memory maps under `param: 'reverbSend'` without rewriting `localStorage`. Implement as a small lookup table so future renames can be added without restructuring. Run lint+format. Commit: `feat(reverb): translate stale reverbMix CC assignments on load`
- [x] 2.3 Search the codebase for any remaining `reverbMix` string references using project tooling (`rg "reverbMix" src/ e2e/` or equivalent) and audit each. Anything outside test files should be renamed; test references will be updated in section 4. Commit if non-test files were updated: `refactor(reverb): remove residual reverbMix references`

## 3. UI layer rename and defaults

- [x] 3.1 Update `src/components/Effects.svelte`: rename the first reverb knob's label from `mix` to `send`, change the param name in `onchange` and `oncontextmenu` payloads from `reverbMix` to `reverbSend`, update `midiState.reverbMix` references to `midiState.reverbSend`, and change the knob's default value from 0.5 to 0.3. Run lint+format. Commit: `feat(reverb): rename mix knob to send with 0.3 default`
- [x] 3.2 Update the pre-delay knob default in `src/components/Effects.svelte` from 0 to 0.015. Run lint+format. Commit: `feat(reverb): set pre-delay knob default to 15 ms`
- [x] 3.3 Verify that no CSS rule in `src/components/Effects.svelte` targets a fixed width on a reverb knob value element (a prior change appears to have removed it; the spec now requires its absence). If found, remove it; if absent, no edit is required. Commit only if changes: `style(reverb): clean up stale mix-knob selectors`

## 4. Tests

- [x] 4.1 Update `src/components/Effects.test.js`: rename `reverbMix` assertions to `reverbSend`, change expected default from 0.5 to 0.3, change pre-delay expected default from 0 to 0.015, update knob-label assertions from `mix` to `send`, and update `onchange` payload assertions. Run `npx vitest run src/components/Effects.test.js`. Commit: `test(reverb): cover reverbSend knob and updated defaults`
- [x] 4.2 Update `src/App.test.js`: rename any `reverbMix` references to `reverbSend`, update expected defaults if asserted. Run `npx vitest run src/App.test.js`. Commit: `test(reverb): update App-level reverb param assertions`
- [x] 4.3 Update any Playwright specs in `e2e/` that target the reverb mix knob label or default value. Run `npx playwright test` only for affected specs. Commit if changes: `test(reverb): update e2e assertions for send knob`
- [x] 4.4 Add a unit test that asserts the engine forwards `reverbSend` from JS to the worklet. Mirror the pattern used for `delayMix` forwarding in `src/App.test.js` (find the existing `delayMix` forwarding assertion and clone it for `reverbSend`). Run `npx vitest run src/App.test.js`. Commit: `test(reverb): assert reverbSend forwards to worklet`
- [x] 4.5 Add a unit test for `MidiCcMap` covering the load-time translation: stored `reverbMix` resolves as `reverbSend`, the underlying `localStorage` entry is not rewritten, and a stored `reverbSend` entry loads unchanged. Mirror the existing `MidiCcMap` test setup (mock `localStorage`, instantiate, assert). Run `npx vitest run`. Commit: `test(reverb): cover MidiCcMap reverbMix→reverbSend translation`

## 5. Spec sync

- [x] 5.1 After all sections above pass, run `openspec status --change reverb-send-architecture` and confirm all artifacts are `done`. No commit (read-only check).

## 6. Section completion gate

- [ ] 6.1 Run `npx vitest run` for the whole suite and confirm green.
- [ ] 6.2 Run `roborev status` to confirm the daemon is healthy. If not running, halt and report.
- [ ] 6.3 Run `roborev refine --max-iterations 3` and present results to the human.
- [ ] 6.4 Wait for explicit human approval covering: visual verification of the reverb knob label and defaults, audio verification that engaging reverb no longer cuts dry low-end, and approval to open the PR. The PR description MUST mention the +6 dB output level change at default settings under the new send law.
- [ ] 6.5 On approval, run `stax ss --yes --no-prompt` to push and open the PR. Report the PR URL.
