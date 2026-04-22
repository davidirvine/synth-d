## ADDED Requirements

### Requirement: Pure function modules are unit tested with Vitest
The system SHALL extract all math-critical logic into pure, side-effect-free functions in dedicated modules. These SHALL be tested with Vitest. Tests SHALL assert exact or near-exact values, not just that functions return without throwing.

#### Scenario: mtof produces correct frequencies
- **WHEN** `mtof(69)` is called
- **THEN** result equals exactly 440Hz

#### Scenario: mtof octave relationship
- **WHEN** `mtof(n+12)` is compared to `mtof(n)` for any n
- **THEN** result is exactly double (one octave up)

#### Scenario: Log knob curve at boundaries
- **WHEN** `normalizedToValue(0, 20, 20000, 'log')` is called
- **THEN** result equals 20 (minimum)

#### Scenario: Log knob curve at maximum
- **WHEN** `normalizedToValue(1, 20, 20000, 'log')` is called
- **THEN** result equals 20000 (maximum)

#### Scenario: Log knob curve at midpoint
- **WHEN** `normalizedToValue(0.5, 20, 20000, 'log')` is called
- **THEN** result is approximately 632Hz (geometric mean, within 1Hz)

#### Scenario: Linear knob curve midpoint
- **WHEN** `normalizedToValue(0.5, 0, 1, 'linear')` is called
- **THEN** result equals exactly 0.5

#### Scenario: Knob curve round-trip
- **WHEN** `normalizedToValue(valueToNormalized(v, min, max, scale), min, max, scale)` is called for any valid v
- **THEN** result equals v within floating-point precision

#### Scenario: Filter LP gain at mode 0
- **WHEN** `filterGains(0)` is called
- **THEN** lpGain=1, bpGain=0, hpGain=0

#### Scenario: Filter BP gain at mode 1
- **WHEN** `filterGains(1)` is called
- **THEN** lpGain=0, bpGain=1, hpGain=0

#### Scenario: Filter HP gain at mode 2
- **WHEN** `filterGains(2)` is called
- **THEN** lpGain=0, bpGain=0, hpGain=1

#### Scenario: Filter crossfade at LP-BP midpoint
- **WHEN** `filterGains(0.5)` is called
- **THEN** lpGain=0.5, bpGain=0.5, hpGain=0

#### Scenario: Filter crossfade at BP-HP midpoint
- **WHEN** `filterGains(1.5)` is called
- **THEN** lpGain=0, bpGain=0.5, hpGain=0.5

#### Scenario: QWERTY Z key maps to correct MIDI note
- **WHEN** the QWERTY map is queried for key `"z"`
- **THEN** the returned MIDI note produces the lowest C on the keyboard

#### Scenario: QWERTY S key maps to C-sharp
- **WHEN** the QWERTY map is queried for key `"s"`
- **THEN** the returned MIDI note is one semitone above the Z key note

#### Scenario: Retrigger sends gate=0 before gate=1
- **WHEN** `noteOn` is called while a note is already active
- **THEN** the engine receives `gate=0` followed by `gate=1` in that order, with freq set before the gate transitions

---

### Requirement: Svelte components are tested with @testing-library/svelte
The system SHALL test Svelte component behavior using `@testing-library/svelte` with Vitest as the runner. Tests SHALL verify rendered structure and interactive behavior without testing visual styling.

#### Scenario: Keyboard renders 25 keys
- **WHEN** the Keyboard component is rendered
- **THEN** exactly 25 key elements are present in the DOM

#### Scenario: Key press applies active state
- **WHEN** a keyboard key element receives a pointerdown event
- **THEN** the key element receives the active CSS class or attribute

#### Scenario: Key release removes active state
- **WHEN** a keyboard key is released (pointerup)
- **THEN** the active CSS class or attribute is removed

#### Scenario: Knob double-click resets to default
- **WHEN** a Knob component with value=800 and default=2000 receives a dblclick event
- **THEN** the component's value becomes 2000 and a change event is dispatched with value=2000

#### Scenario: Knob emits change event on drag
- **WHEN** a Knob receives a pointerdown followed by pointermove with upward movement
- **THEN** a change event is dispatched with a value greater than the starting value

---

### Requirement: Mutation testing runs on math-critical modules with Stryker
The system SHALL configure Stryker with the `@stryker-mutator/vitest-runner` plugin to mutation-test the following modules: `src/audio/math.js` (knob curves, mtof), `src/audio/filterGains.js` (crossfade gains), `src/audio/keyboard.js` (QWERTY map, retrigger logic). A minimum mutation score of 85% SHALL be required to pass.

Mutation testing SHALL NOT be run on Svelte component files, engine.js (AudioWorklet I/O), or FAUST DSP source — these are excluded from the Stryker configuration.

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

#### Scenario: Deletion mutation killed in retrigger
- **WHEN** the `gate=0` statement in the retrigger path is deleted
- **THEN** the retrigger ordering test fails (mutant is killed)

---

### Requirement: Playwright smoke test verifies UI interaction end-to-end
The system SHALL include a Playwright test that launches the synth in a real browser, triggers the start gesture, presses a keyboard key, and verifies that the keyboard UI responds correctly (active key highlight).

#### Scenario: AudioContext starts after click
- **WHEN** the start overlay is clicked
- **THEN** the browser's AudioContext state becomes "running" within 500ms

#### Scenario: Key press activates key highlight
- **WHEN** a keyboard key is pressed after AudioContext is running
- **THEN** the corresponding key element receives the active CSS class (amber highlight) within 1000ms
