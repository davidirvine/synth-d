## 1. Tier 1 — Plug spec gaps with unit/component tests

- [x] 1.1 Add test in `src/audio/midi.test.js`: pitchbend with no active note is stored, then applied on next note-on (verifies midi spec "Pitchbend with no active note" scenario).
- [x] 1.2 Widen the `MidiManager` mock callback type in `src/App.test.js` to include `onNoteOn`, `onNoteOff`, and `onCc` (the constructor already captures all callbacks; only the JSDoc needs updating).
- [ ] 1.3 Add test in `src/App.test.js`: driving `lastMidiCallbacks.onNoteOn` flips the rendered MidiStatus dot from `connected` to `active`.
- [ ] 1.4 Add test in `src/App.test.js`: right-click a knob → drive `lastMidiCallbacks.onCc` → assert `engine.setParam` is called with the scaled value AND the assigned-CC label is visible on the knob.
- [ ] 1.5 Add test in `src/App.test.js`: enter learn mode, press Escape, then drive `lastMidiCallbacks.onCc` → no `midiCcMap.assign` mapping is created (Escape cancelled).
- [ ] 1.6 Add test in `src/App.test.js`: right-click knob A, then right-click knob B before any CC arrives → drive `onCc` → mapping is created for B only, A has no assigned CC.
- [ ] 1.7 Add test in `src/App.test.js`: pre-seed `localStorage` with a `midiCc:74 → cutoff` entry, render App → assert the knob renders with the assigned-CC label visible.

## 2. Tier 2 — Bring MIDI math under Stryker

- [ ] 2.1 Create `src/audio/pitchbend.js` exporting `parseBend(raw)` returning a value in `[-2, +2]` semitones, `bentFreq(noteFreq, bendSemitones)` returning the bent frequency, and the `BEND_CENTER` / `BEND_SEMITONES` constants. No imports.
- [ ] 2.2 Create `src/audio/pitchbend.test.js` with cases: `parseBend(8192) === 0`, `parseBend(16383) === 2`, `parseBend(0)` ≈ `-2`, `bentFreq(440, 0) === 440`, `bentFreq(440, 2)` ≈ `440 * 2^(2/12)`, `bentFreq(440, -12) === 220`.
- [ ] 2.3 Refactor `src/audio/midi.js` `_pitchBend` and `_bentFreq` to delegate to `pitchbend.js`. Remove the local `BEND_SEMITONES` and `BEND_CENTER` constants. Verify all existing `midi.test.js` cases pass unchanged.
- [ ] 2.4 Locate the Stryker config (`stryker.conf.json`, `stryker.conf.cjs`, or inline in `package.json` — confirm at apply time) and add `src/audio/midiCcMap.js` and `src/audio/pitchbend.js` to the `mutate` glob list.
- [ ] 2.5 Run `npx stryker run` and iterate on `midiCcMap.test.js` until the score for that file is ≥85%. Add scenarios as needed (suggested gaps: `scale` at intermediate values, `getAssignedCc` after overwrite, the rename-pass tie-break logic).
- [ ] 2.6 Run `npx stryker run` and iterate on `pitchbend.test.js` until the score for that file is ≥85%. If equivalent mutants prevent the threshold, document the per-file override decision in `design.md` (Open Questions section) and apply it in the Stryker config.

## 3. Tier 3 — End-to-end MIDI in Playwright

- [ ] 3.1 Create `e2e/midi.spec.js` with a `beforeEach` that calls `page.addInitScript` to install a fake `requestMIDIAccess` exposing one fake port and a `window.__fakeMidi.send(bytes)` helper.
- [ ] 3.2 Add E2E spec: power on the synth → assert `.midi-status .dot.connected` becomes visible within 2000ms.
- [ ] 3.3 Add E2E spec: power on, then `__fakeMidi.send([0x90, 60, 100])` → assert `[data-midi="60"].active` AND `.midi-status .dot.active` are both visible within 1000ms.
- [ ] 3.4 Add E2E spec: power on, right-click a knob (e.g., the cutoff knob), then `__fakeMidi.send([0xb0, 74, 64])` → assert the knob's assigned-CC label (e.g., text matching `/CC 74/`) becomes visible within 1000ms.
- [ ] 3.5 Confirm the new specs do NOT use `test.skip(!wasmBuilt, …)` — they must run unconditionally in CI per the testing spec delta.

## 4. Tier 4 — Centralize MIDI mocking helper

- [ ] 4.1 Create `src/audio/test-helpers/midi.js` exporting `makeFakeMidiAccess(ports)`, `makePort(id, name)`, `bytes(messageName, ...args)` (semantic byte builder), and `installFakeMidiOnNavigator(target)` returning a teardown function.
- [ ] 4.2 Replace the inline mock helpers in `src/audio/midi.test.js` with imports from `test-helpers/midi.js`. All tests still pass unchanged.
- [ ] 4.3 Use `bytes()` from the helper in the new `e2e/midi.spec.js` `addInitScript` body (serialized into the page) so byte literals live in one place.
- [ ] 4.4 Leave `App.test.js`'s class-level `MidiManager` mock in place — it operates at a different abstraction layer and does not consume the fake-port helpers.

## 5. Verification

- [ ] 5.1 `npx vitest run` passes (unit + component, including all new Tier 1 tests).
- [ ] 5.2 `npx stryker run` passes with score ≥85% across all targeted modules including the newly added `midiCcMap.js` and `pitchbend.js`.
- [ ] 5.3 `npx playwright test` passes locally including the new `e2e/midi.spec.js` specs.
- [ ] 5.4 `roborev refine --max-iterations 3` resolves all open review findings on the branch.
- [ ] 5.5 Present results to the human and wait for explicit approval before opening the PR (per CLAUDE.md "Implementation Completion").
