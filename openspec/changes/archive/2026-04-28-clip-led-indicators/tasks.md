## 1. DSP — output peak vbargraph

- [x] 1.1 In `faust/synth.dsp`, add `outputPeak = abs(vcaOut * (masterVol / 0.6)) : vbargraph("outputPeak [unit:linear]", 0, 2)`
- [x] 1.2 Rewrite `masterOut` using `attach` to prevent dead-code elimination: `masterOut = attach(vcaOut * (masterVol / 0.6), outputPeak) : ma.tanh`
- [x] 1.3 Validate DSP compiles: `faust faust/synth.dsp -o /dev/null`
- [x] 1.4 Rebuild WASM: `npm run faust:build`

## 2. Engine — getOutputPeak

- [x] 2.1 In `src/audio/engine.js`, add `let outputPeakValue = 0` alongside the existing `mixerPeakValue`
- [x] 2.2 Extend the existing `setOutputParamHandler` callback to also capture `/synth/outputPeak` into `outputPeakValue`
- [x] 2.3 Add `export function getOutputPeak() { return outputPeakValue }` alongside `getMixerPeak`
- [x] 2.4 Reset `outputPeakValue = 0` in `powerOff()` alongside the existing `mixerPeakValue` reset
- [x] 2.5 Run `npx eslint --fix src/audio/engine.js && npx prettier --write src/audio/engine.js`

## 3. ClipLed component

- [x] 3.1 Create `src/components/ClipLed.svelte` with props `getPeak = () => 0` and `powered = false`
- [x] 3.2 Render an 8×8 px div with `border-radius: 50%`; background `#4a1010` (dark) or `#ff3333` (clip)
- [x] 3.3 Implement `rAF` polling loop: call `getPeak()` each frame when `powered` is true; stop loop and set dark when `powered` is false
- [x] 3.4 Implement clip latch: when `getPeak() > 1.0`, set `clipLit = true`, `clearTimeout` any existing handle, schedule `setTimeout(() => clipLit = false, 1500)`
- [x] 3.5 Cancel rAF handle and latch timeout in `onDestroy`
- [x] 3.6 Run `npx eslint --fix src/components/ClipLed.svelte && npx prettier --write src/components/ClipLed.svelte`

## 4. Replace LevelMeter with ClipLed in Mixer

- [x] 4.1 In `src/components/Mixer.svelte`, replace `import LevelMeter` with `import ClipLed`
- [x] 4.2 Replace `<LevelMeter {getPeak} {powered} />` with `<ClipLed {getPeak} {powered} />`
- [x] 4.3 Delete `src/components/LevelMeter.svelte`
- [x] 4.4 Delete `src/components/LevelMeter.test.js`
- [x] 4.5 Run `npx eslint --fix src/components/Mixer.svelte && npx prettier --write src/components/Mixer.svelte`

## 5. Add ClipLed to output panel (AmpEnv)

- [x] 5.1 In `src/components/AmpEnv.svelte`, add props `getOutputPeak = () => 0` and `powered = false`
- [x] 5.2 Wrap the bare `<span class="panel-label">output</span>` in a `<div class="panel-header">` with `display: flex; align-items: center; justify-content: space-between`
- [x] 5.3 Add `import ClipLed from './ClipLed.svelte'` and place `<ClipLed getPeak={getOutputPeak} {powered} />` as the second child of `.panel-header`
- [x] 5.4 Run `npx eslint --fix src/components/AmpEnv.svelte && npx prettier --write src/components/AmpEnv.svelte`

## 6. Wire up in App.svelte

- [x] 6.1 In `src/App.svelte`, import `getOutputPeak` from `src/audio/engine.js`
- [x] 6.2 Pass `getOutputPeak={getOutputPeak}` and `powered={powered}` to the `AmpEnv` component
- [x] 6.3 Run `npx eslint --fix src/App.svelte && npx prettier --write src/App.svelte`

## 7. Tests

- [x] 7.1 Create `src/components/ClipLed.test.js`
- [x] 7.2 Add test: LED element is always present in the DOM regardless of peak value
- [x] 7.3 Add test: `getPeak` is not called when `powered` is false
- [x] 7.4 Add test: `clipLit` becomes true when `getPeak` returns a value above 1.0
- [x] 7.5 Add test: `clipLit` remains false when `getPeak` returns 1.0 or below
- [x] 7.6 Add test: latch expires — use `vi.useFakeTimers`, trigger a clip frame, advance timers by 1500 ms with no further clip frames, and assert `clipLit` returns to false
- [x] 7.7 Add test: `onDestroy` teardown — mount with `powered=true`, allow at least one animation frame to fire (via `vi.runAllTimers()` or advancing fake timers), then destroy the component and assert both `cancelAnimationFrame` and `clearTimeout` were each called at least once
- [x] 7.8 In `src/components/Mixer.svelte` tests, update any `LevelMeter` references to `ClipLed`
- [x] 7.10 In `src/audio/engine.test.js`, add a test that `getOutputPeak()` returns `0` before `powerOn()` is called
- [x] 7.11 In `src/audio/engine.test.js`, add a test that `getOutputPeak()` returns the updated value when the output param handler fires with the path `/synth/outputPeak`
- [x] 7.12 In `src/audio/engine.test.js`, add a test that `getOutputPeak()` resets to `0` after `powerOff()` is called
- [x] 7.13 In `src/audio/engine.test.js`, add a test confirming the single `setOutputParamHandler` callback captures both the `mixerPeak` and `outputPeak` paths (i.e., one handler, two path branches)
- [x] 7.9 Run `npx vitest run` and confirm all tests pass

## 8. Verification

- [x] 8.1 Power on the synth; confirm both LEDs are visible in dim red in their respective panel label rows
- [x] 8.2 Drive all oscillator levels to max — confirm the mixer LED lights bright red
- [x] 8.3 Reduce oscillator levels; raise master volume to max with a note held — confirm the output LED lights bright red
- [x] 8.4 Confirm both LEDs return to dim red 1.5 s after clipping stops
- [x] 8.5 Power off the synth — confirm both LEDs show dim red and polling stops
