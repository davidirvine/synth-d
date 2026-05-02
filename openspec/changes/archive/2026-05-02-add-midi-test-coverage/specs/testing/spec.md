## MODIFIED Requirements

### Requirement: Mutation testing runs on math-critical modules with Stryker

The system SHALL configure Stryker with the `@stryker-mutator/vitest-runner` plugin to mutation-test the following modules: `src/audio/math.js` (knob curves, mtof), `src/audio/filterGains.js` (crossfade gains), `src/audio/keyboard.js` (QWERTY map, legato logic), `src/audio/midiCcMap.js` (CC scaling and mapping), and `src/audio/pitchbend.js` (pitchbend parsing and frequency math). A minimum mutation score of 85% SHALL be required to pass.

Mutation testing SHALL NOT be run on Svelte component files, `engine.js` (AudioWorklet I/O), `midi.js` (Web MIDI I/O wrapper), or FAUST DSP source — these are excluded from the Stryker configuration.

#### Scenario: Mutation score meets threshold

- **WHEN** `npx stryker run` completes
- **THEN** reported mutation score is ≥ 85% across targeted modules

#### Scenario: Arithmetic mutation killed in mtof

- **WHEN** the subtraction in `midiNote - 69` is mutated to addition
- **THEN** at least one Vitest test fails (mutant is killed)

#### Scenario: Sign mutation killed in log curve

- **WHEN** the exponent `pos` in `Math.pow(max/min, pos)` is mutated to `1 - pos`
- **THEN** the midpoint value test fails (mutant is killed)

#### Scenario: Operator mutation killed in filter gains

- **WHEN** `max(0, 1 - mode)` lpGain formula has the subtraction mutated to addition
- **THEN** the LP boundary test (mode=0 → lpGain=1) or crossfade test fails (mutant is killed)

#### Scenario: Branch mutation killed in legato path

- **WHEN** the `currentlyActive` branch in `buildNoteOnMessages` is mutated to always return the two-message path
- **THEN** the legato test (expects one message when active) fails (mutant is killed)

#### Scenario: Arithmetic mutation killed in CC scaling

- **WHEN** the multiplication in `min + (max - min) * (raw / 127)` is mutated to division
- **THEN** the `scale CC 127 → max` test fails (mutant is killed)

#### Scenario: Boundary mutation killed in pitchbend parsing

- **WHEN** the bend center constant `8192` in `parseBend` is mutated to a different value
- **THEN** the `pitchbend center returns 0 semitones` test fails (mutant is killed)

#### Scenario: Sign mutation killed in pitchbend frequency

- **WHEN** the division in `Math.pow(2, bendSemitones / 12)` is mutated to multiplication
- **THEN** the `bentFreq with non-zero bend` test fails (mutant is killed)

---

## ADDED Requirements

### Requirement: Playwright covers MIDI status, note-on, and learn lifecycle end-to-end

The system SHALL include Playwright specs that exercise the MIDI feature end-to-end using a fake `requestMIDIAccess` installed via `page.addInitScript` before page navigation. These specs SHALL run unconditionally in CI (they MUST NOT be gated on the WASM build) because they assert only on DOM state and do not depend on the AudioWorklet or audio hardware.

The fake MIDI infrastructure SHALL expose a `window.__fakeMidi.send(bytes)` helper from inside the page so tests can dispatch synthetic MIDI messages to the running App.

#### Scenario: Page mount populates MIDI status indicator

- **WHEN** the page loads with the fake MIDI access installed and one fake input port present
- **THEN** the MIDI status dot in the header receives the `connected` class within 2000ms

(MIDI connects on app mount, independent of audio power — see App.svelte's `onMount`. The dot transitions from `unavailable` to `connected` without requiring a click on the power button.)

#### Scenario: Synthetic note-on highlights key and flips status to active

- **WHEN** a synthetic MIDI note-on message (status `0x90`, note 60, velocity 100) is dispatched after the page has loaded
- **THEN** the keyboard key with `data-midi="60"` receives the `active` class AND the MIDI status dot receives the `active` class within 1000ms

#### Scenario: Learn mode binds CC and the assigned-CC label appears on the knob

- **WHEN** the user right-clicks a knob, then a synthetic CC message is dispatched
- **THEN** an assigned-CC label (e.g., "CC 74") becomes visible on or near that knob within 1000ms
