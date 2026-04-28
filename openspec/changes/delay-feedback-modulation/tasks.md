## 1. FAUST DSP — modulation parameters and LFO

- [x] 1.1 In `faust/synth.dsp`, add `delayModOn` (`nentry`, default 0), `delayModRate` (`hslider`, 0.1–10 Hz, default 0.5), and `delayModDepth` (`hslider`, 0–0.025 s, default 0) to the Delay parameter block
- [x] 1.2 In the Tape Delay section, compute smoothed variants: `delayModOnS`, `delayModRateS`, and `delayModDepthS` using `si.smoo`
- [x] 1.3 Compute `modLfo = os.osc(delayModRateS) * delayModDepthS * ma.SR * delayModOnS`
- [x] 1.4 Update the `tapeTime` expression to sum `modLfo` alongside the existing `wowLfo` term
- [x] 1.5 Validate the DSP compiles cleanly: `faust faust/synth.dsp -o /dev/null`
- [x] 1.6 Rebuild the WASM artefacts: `npm run faust:build`

## 2. Effects UI — MOD row with toggle, rate, and depth knobs

- [x] 2.1 In `src/components/Effects.svelte`, add `let delayModOn = $state(0)` alongside the existing toggle state variables
- [x] 2.2 Add a `toggleDelayMod` function that flips `delayModOn` and dispatches `{ param: 'delayModOn', value: delayModOn }`
- [x] 2.3 Add `delayModOn = 0` and the corresponding `onchange` dispatch to the reset `$effect`
- [x] 2.4 Below the existing delay `effects-row`, add a new `mod-row` div containing the MOD toggle button followed by the rate and depth `Knob` components
- [x] 2.5 MOD toggle: same style as `delayOn` toggle (amber active, grey inactive), label "on"/"off", `aria-pressed` reflects state
- [x] 2.6 Rate knob: label "rate", min 0.1, max 10, default 0.5, scale "log", unit "Hz"; wire `externalValue`, `learningMidi`, `assignedCc`, `onchange`, `oncontextmenu`
- [x] 2.7 Depth knob: label "depth", min 0, max 0.025, default 0, scale "linear", unit "s"; wire same props
- [x] 2.8 Run `npx eslint --fix src/components/Effects.svelte` then `npx prettier --write src/components/Effects.svelte`

## 3. App wiring — params, defaults, MIDI state

- [x] 3.1 In `src/App.svelte`, add `delayModRate: { min: 0.1, max: 10 }` and `delayModDepth: { min: 0, max: 0.025 }` to `KNOB_PARAMS` (`delayModOn` is a toggle — do not add it)
- [x] 3.2 Add `delayModRate: 0.5` and `delayModDepth: 0` to `DEFAULTS`
- [x] 3.3 Add `'delayModRate'` and `'delayModDepth'` to the `effectsMidiState` `midiStateFor(...)` call
- [x] 3.4 Run `npx eslint --fix src/App.svelte` then `npx prettier --write src/App.svelte`

## 4. Tests

- [x] 4.1 In `src/components/Effects.test.js`, add a test that the MOD toggle dispatches `{ param: 'delayModOn', value: 1 }` when clicked from off
- [x] 4.2 Add a test that the MOD toggle dispatches `{ param: 'delayModOn', value: 0 }` when clicked from on
- [x] 4.3 Add a test that the rate knob dispatches `{ param: 'delayModRate', value: ... }` on change
- [x] 4.4 Add a test that the depth knob dispatches `{ param: 'delayModDepth', value: ... }` on change
- [x] 4.5 Add a test that right-clicking the rate knob calls `onknobcontextmenu` with `'delayModRate'`
- [x] 4.6 Add a test that right-clicking the depth knob calls `onknobcontextmenu` with `'delayModDepth'`
- [x] 4.7 Add a test that `delayModOn` resets to 0 and dispatches when the reset counter increments
- [x] 4.8 Run `npx vitest run` and confirm all tests pass

## 5. Verification

- [x] 5.1 Power on the synth, enable delay, toggle MOD on, set depth to ~10 ms and rate to 1 Hz — confirm audible chorus/vibrato on repeats
- [x] 5.2 Toggle MOD off while repeats are playing — confirm modulation disappears without a click
- [x] 5.3 Toggle MOD on again — confirm modulation returns without a click
- [x] 5.4 With MOD off, confirm the delay sounds identical to the pre-change baseline regardless of rate and depth knob positions
- [x] 5.5 Adjust rate and depth knobs while MOD is on and delay is active — confirm no clicks or discontinuities
- [x] 5.6 Set delayTime to minimum (0.01 s), MOD on, depth to maximum (0.025 s) — confirm no crash or silence
