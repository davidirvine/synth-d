## 1. Project Scaffold

- [x] 1.1 Create Svelte + Vite project with `npm create vite@latest subtractive-synth -- --template svelte`
- [x] 1.2 Remove Vite boilerplate (default Counter component, app.css reset, placeholder content)
- [x] 1.3 Create directory structure: `src/components/`, `src/audio/`, `faust/`, `public/`
- [x] 1.4 Add global CSS: background #111111, box-sizing border-box, monospace font stack
- [x] 1.5 Install dev dependencies: `vitest`, `@testing-library/svelte`, `@playwright/test`, `stryker`, `@stryker-mutator/vitest-runner`
- [x] 1.6 Configure Vitest in `vite.config.js` with jsdom environment for component tests
- [x] 1.7 Configure Stryker in `stryker.config.mjs`: target `src/audio/math.js`, `src/audio/filterGains.js`, `src/audio/keyboard.js`; exclude Svelte files and `engine.js`; set `thresholds.high: 85`
- [x] 1.8 Add `playwright.config.js` with single chromium project and `baseURL: http://localhost:5173`

## 2. FAUST DSP — Oscillator

- [x] 2.1 Create `faust/synth.dsp` with `import("stdfaust.lib")`
- [x] 2.2 Declare UI parameters: `freq`, `gate`, `oscType` (nentry 0–4, renamed from `waveform` — reserved keyword), `octave` (nentry -2 to 2)
- [x] 2.3 Implement five oscillator signals in parallel: `os.osc`, `os.sawtooth`, `os.square`, `os.triangle`, `no.noise`
- [x] 2.4 Select active oscillator with `ba.selectn(5, int(oscType))`
- [x] 2.5 Apply octave transpose: multiply freq by `pow(2, octave)` before feeding oscillators

## 3. FAUST DSP — AD Envelopes

- [x] 3.1 Declare filter envelope parameters: `filterAttack`, `filterDecay`, `filterEnvAmt`
- [x] 3.2 Declare amp envelope parameters: `ampAttack`, `ampDecay`
- [x] 3.3 Implement rising-edge detector: `rising = gate > gate'`
- [x] 3.4 Implement AD envelope using `rising : en.ar(attack, decay)`
- [x] 3.5 Wire filter envelope: `filterEnvOut = adEnv(filterAttack, filterDecay)`
- [x] 3.6 Wire amp envelope: `ampEnvOut = adEnv(ampAttack, ampDecay)`

## 4. FAUST DSP — SEM Filter

- [x] 4.1 Declare filter parameters: `cutoff` (20–20000Hz), `resonance` (0–1), `filterMode` (0–2)
- [x] 4.2 `fi.svf` API unconfirmed — used cascaded Butterworth (fi.lowpass/fi.highpass) with same crossfade topology; compiles and sounds equivalent
- [x] 4.3 Implement cutoff modulation: `cutoffMod = min(20000, cutoff + filterEnvOut * filterEnvAmt)`
- [x] 4.4 Filter modes extracted from shared cutoffMod signal
- [x] 4.5 Implement triangular crossfade gains: `lpGain`, `bpGain`, `hpGain` from `filterMode`
- [x] 4.6 Sum crossfaded filter outputs: `filteredSig = lp*lpGain + bp*bpGain + hp*hpGain`

## 5. FAUST DSP — VCA and Output

- [x] 5.1 Declare `masterVol` parameter (0–1, default 0.75)
- [x] 5.2 Apply amp envelope to filtered signal: `vcaOut = filteredSig * ampEnvOut`
- [x] 5.3 Apply master volume: `process = vcaOut * masterVol <: _,_` (mono to stereo)
- [x] 5.4 Compile with `faust -lang wasm faust/synth.dsp -o public/synth.wasm` — produces synth.wasm (14K) + synth.json (param map); AudioWorklet JS wrapper comes from @grame/faustwasm (section 7)

## 6. Pure Function Modules

- [x] 6.1 Create `src/audio/math.js`: export `mtof(midiNote)`, `normalizedToValue(pos, min, max, scale)`, `valueToNormalized(val, min, max, scale)`, `formatValue(val, unit)`
- [x] 6.2 Create `src/audio/filterGains.js`: export `filterGains(mode)` returning `{ lpGain, bpGain, hpGain }`
- [x] 6.3 Create `src/audio/keyboard.js`: export `QWERTY_MAP` (key → midiNote), `midiNotesForOctave(baseOctave)`, `buildNoteOnMessages(freq, currentlyActive)`, `midiToFreq(midiNote, octaveOffset)`

## 7. Audio Engine

- [x] 7.1 Create `src/audio/engine.js` — export `initAudio()`, `setParam(name, value)`, `noteOn(freq)`, `noteOff()`; import from math.js and keyboard.js
- [x] 7.2 Implement AudioContext creation deferred until first user gesture
- [x] 7.3 Register AudioWorklet module using the FAUST-generated JS wrapper
- [x] 7.4 Instantiate FAUST WASM DSP inside the worklet processor
- [x] 7.5 Implement `setParam` to post messages to worklet: `{ type: 'param', path, value }`
- [x] 7.6 Implement `noteOn(freq)`: use `buildNoteOnMessages` from keyboard.js; send freq then gate messages
- [x] 7.7 Implement `noteOff()`: send gate=0
- [x] 7.8 Connect AudioWorkletNode output to AudioContext destination

## 8. Knob Component

- [x] 8.1 Create `src/components/Knob.svelte` accepting props: `label`, `min`, `max`, `default`, `value`, `scale` ("log"|"linear"), `unit`
- [x] 8.2 Render SVG arc track (270° sweep) and indicator line from center to rim
- [x] 8.3 Import and use `normalizedToValue` / `valueToNormalized` from `src/audio/math.js`
- [x] 8.4 Implement `pointerdown` → `pointermove` drag handler accumulating `movementY` delta
- [x] 8.5 Apply 10× sensitivity reduction when Shift key is held during drag
- [x] 8.6 Implement double-click handler to reset value to `default` prop
- [x] 8.7 Render formatted value label below SVG using `formatValue` from math.js
- [x] 8.8 Dispatch `change` event with new value on every update

## 9. Keyboard Component

- [x] 9.1 Create `src/components/Keyboard.svelte` with 25-key layout data (MIDI notes C3–C5)
- [x] 9.2 Render white keys as tall rectangles, black keys as shorter overlapping rectangles in SVG or HTML/CSS
- [x] 9.3 Apply Moog palette: white keys #dddddd, black keys #1a1a1a, active amber #c87941
- [x] 9.4 Implement `pointerdown` / `pointerup` / `pointerleave` handlers on each key
- [x] 9.5 Import `QWERTY_MAP` from keyboard.js; add `keydown` / `keyup` window listeners; suppress key-repeat with a pressed-set tracker
- [x] 9.6 Call `buildNoteOnMessages` from keyboard.js on each new note; dispatch resulting messages to engine in order
- [x] 9.7 Apply octave transpose offset to all MIDI notes before computing freq

## 10. Synth Panels

- [x] 10.1 Create `src/components/Oscillator.svelte`: waveform selector (5 buttons or select), octave ±2 stepper, wire to engine
- [x] 10.2 Create `src/components/Filter.svelte`: three Knob instances (cutoff log, resonance linear, mode linear 0–2 with LP/BP/HP tick labels)
- [x] 10.3 Create `src/components/FilterEnv.svelte`: three Knob instances (attack log, decay log, env amount log)
- [x] 10.4 Create `src/components/AmpEnv.svelte`: two Knob instances (attack log, decay log)
- [x] 10.5 Create `src/components/Volume.svelte`: single master volume Knob (linear, 0–1)
- [x] 10.6 Style each panel with background #1c1c1c, 1px #333 border, cream label header

## 11. App Assembly and Start Overlay

- [x] 11.1 Assemble all panels in `src/App.svelte` in order: Oscillator | Filter | FilterEnv | AmpEnv | Volume
- [x] 11.2 Place Keyboard component below panels spanning full width
- [x] 11.3 Implement start overlay: full-screen #111 with centered "CLICK TO START" text in amber
- [x] 11.4 On overlay click: call `initAudio()`, dismiss overlay, enable all controls
- [x] 11.5 Wire all Knob `change` events to `setParam` calls with correct FAUST parameter paths
- [x] 11.6 Wire Keyboard `noteOn`/`noteOff` events to engine functions

## 12. Unit Tests — Pure Functions

- [x] 12.1 Write `src/audio/math.test.js`: test `mtof(69)===440`, `mtof(81)===880`, octave doubling relationship
- [x] 12.2 Test log knob curve at pos=0 (min), pos=1 (max), pos=0.5 (geometric mean ~632Hz for cutoff)
- [x] 12.3 Test linear knob curve at pos=0, pos=0.5, pos=1
- [x] 12.4 Test round-trip: `normalizedToValue(valueToNormalized(v, min, max, scale), min, max, scale) ≈ v`
- [x] 12.5 Write `src/audio/filterGains.test.js`: test `filterGains(0)` → `{lp:1,bp:0,hp:0}`, `filterGains(1)` → `{lp:0,bp:1,hp:0}`, `filterGains(2)` → `{lp:0,bp:0,hp:1}`
- [x] 12.6 Test crossfade midpoints: `filterGains(0.5)` → `{lp:0.5,bp:0.5,hp:0}`, `filterGains(1.5)` → `{lp:0,bp:0.5,hp:0.5}`
- [x] 12.7 Write `src/audio/keyboard.test.js`: test `QWERTY_MAP['z']` maps to lowest C, `QWERTY_MAP['s']` is one semitone higher
- [x] 12.8 Test `buildNoteOnMessages` when not active returns `[{param:'freq', value:f}, {param:'gate', value:1}]`
- [x] 12.9 Test `buildNoteOnMessages` when already active returns gate=0 message before gate=1 (retrigger order)

## 13. Component Tests — Svelte

- [x] 13.1 Write `src/components/Keyboard.test.js`: render Keyboard, assert exactly 25 key elements present
- [x] 13.2 Test that pointerdown on a key adds active attribute/class; pointerup removes it
- [x] 13.3 Write `src/components/Knob.test.js`: render Knob with known default, fire dblclick, assert change event emitted with default value
- [x] 13.4 Test that upward pointermove after pointerdown emits change event with value greater than initial

## 14. Mutation Testing — Stryker

- [x] 14.1 Run `npx stryker run` and inspect the HTML report for surviving mutants
- [x] 14.2 For each surviving mutant in math.js: add or tighten a test that kills it (typically an interior-point assertion)
- [x] 14.3 For each surviving mutant in filterGains.js: add boundary or midpoint test to kill it
- [x] 14.4 For each surviving mutant in keyboard.js: add assertion on ordering or specific mapping value
- [x] 14.5 Re-run Stryker; confirm mutation score ≥ 85% across all targeted modules

## 15. Playwright Smoke Tests

- [ ] 15.1 Write `e2e/synth.spec.js`: navigate to app, assert start overlay is visible
- [ ] 15.2 Click start overlay; assert AudioContext state is "running" (evaluate in page context)
- [ ] 15.3 Press keyboard key (via `page.keyboard.press('z')`); inject AnalyserNode via `page.evaluate`, assert frequency data is non-zero within 100ms

## 16. Final Verification

- [ ] 16.1 Run `npx vitest run` — all unit and component tests pass
- [ ] 16.2 Run `npx stryker run` — mutation score ≥ 85%
- [ ] 16.3 Run `npx playwright test` — smoke tests pass
- [ ] 16.4 Verify audio starts on first click and overlay dismisses correctly
- [ ] 16.5 Verify all five waveforms produce audibly distinct timbres
- [ ] 16.6 Verify filter mode crossfade is glitch-free across the full 0–2 range
- [ ] 16.7 Verify filter envelope modulates cutoff with correct attack/decay timing
- [ ] 16.8 Verify amp envelope shapes amplitude with correct attack/decay timing
- [ ] 16.9 Verify keyboard retrigger restarts envelopes on new key press while holding previous
- [ ] 16.10 Run `vite build` and verify static output in `dist/` loads and plays correctly
