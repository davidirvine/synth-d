## Why

The MIDI feature has solid unit-level coverage on `MidiManager` and `MidiCcMap`, but several spec scenarios are uncovered, the App-level integration wiring is invisible to the test suite, MIDI math is excluded from mutation testing, and Playwright has zero MIDI coverage. The E2E gap is especially costly because MIDI tests don't need WASM and could therefore run in CI — unlike the existing powered-audio specs that skip in CI for lack of audio hardware. Closing these gaps before more MIDI features land prevents silent regressions in the message parsing, learn lifecycle, and pitchbend math.

## What Changes

- **Add unit/component tests** for spec scenarios that currently have no test:
  - Pitchbend "stored bend applies on next note-on" (midi spec, requirement "MIDI pitchbend handling")
  - Note-on flips MidiStatus from `connected` to `active` (midi spec, requirement "MIDI status indicator")
  - CC learn lifecycle in App: enter → assign → exit, Escape cancel, second-knob swap, mapping label visible (midi spec, requirement "CC learn mode — assignment")
- **Extract pitchbend math** into a new pure module `src/audio/pitchbend.js` (`parseBend`, `bentFreq`) and refactor `MidiManager` to use it. This is a structural prerequisite for mutation testing — not a behavior change.
- **Expand Stryker scope** to include `src/audio/midiCcMap.js` and `src/audio/pitchbend.js`. Update the testing spec's mutation-testing requirement.
- **Add Playwright MIDI coverage**: install a fake `requestMIDIAccess` via `addInitScript`, add three E2E specs (status indicator on power-on, synthetic note-on highlights key + flips dot to active, learn lifecycle binds CC label visibly). Add a new requirement to the testing spec covering this E2E surface.
- **Centralize MIDI test mocking** in `src/audio/test-helpers/midi.js` and replace duplicated mocks in `src/audio/midi.test.js`, `src/App.test.js`, and the new `e2e/midi.spec.js`.

## Capabilities

### New Capabilities

None. All work targets existing capabilities.

### Modified Capabilities

- `testing`: expand the mutation-testing target list to include `midiCcMap.js` and `pitchbend.js`; add a new requirement that Playwright covers MIDI status, note-on, and learn lifecycle.

## Impact

- **Code touched**:
  - `src/audio/midi.test.js` (+1 test)
  - `src/App.test.js` (widen MIDI mock callback type, +5 tests)
  - `src/audio/pitchbend.js` (NEW pure module)
  - `src/audio/pitchbend.test.js` (NEW)
  - `src/audio/midi.js` (refactor `_pitchBend` / `_bentFreq` to delegate to `pitchbend.js`)
  - `src/audio/test-helpers/midi.js` (NEW)
  - `e2e/midi.spec.js` (NEW)
  - `stryker.config.json` (or equivalent — expand `mutate` glob)
- **Spec changes**: `openspec/specs/testing/spec.md` — modify one requirement, add one requirement.
- **CI**: new MIDI E2E specs run in CI without WASM, broadening what CI verifies. No new dependencies.
- **No runtime behavior change**: the pitchbend extraction is a pure refactor; everything else is test-only.
