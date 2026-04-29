## 1. LevelLed Component

- [ ] 1.1 Create `src/components/LevelLed.svelte` with props `getPeak: () => number` (default `() => 0`) and `powered: boolean` (default `false`)
- [ ] 1.2 Implement color mapping: compute `hue = clamp(120 - peak * 120, 0, 120)` for peak 0–1; use `hsl(hue, 100%, 50%)` as LED color; render near-black dim state when `peak === 0`
- [ ] 1.3 Implement `requestAnimationFrame` polling loop — call `getPeak()` each frame while `powered` is `true`, update color reactively
- [ ] 1.4 Implement 1.5-second clip latch: when `getPeak() > 1.0` force LED to bright red (`hsl(0, 100%, 50%)`); use `clearTimeout` + `setTimeout(1500)` pattern to hold the latch and reset it on each new clip frame
- [ ] 1.5 Implement powered-off behavior: cancel rAF loop and reset LED to dim state when `powered` transitions to `false`; cancel rAF and any pending `setTimeout` in `onDestroy`
- [ ] 1.6 Run `npx eslint --fix src/components/LevelLed.svelte && npx prettier --write src/components/LevelLed.svelte`

## 2. Replace ClipLed in Mixer

- [ ] 2.1 In `src/components/Mixer.svelte`, replace `import ClipLed` with `import LevelLed` and replace `<ClipLed ...>` with `<LevelLed ...>` (props `getPeak` and `powered` are unchanged)
- [ ] 2.2 Run `npx eslint --fix src/components/Mixer.svelte && npx prettier --write src/components/Mixer.svelte`

## 3. Replace ClipLed in AmpEnv

- [ ] 3.1 In `src/components/AmpEnv.svelte`, replace `import ClipLed` with `import LevelLed` and replace `<ClipLed ...>` with `<LevelLed ...>` (props `getPeak` bound to `getOutputPeak` and `powered` are unchanged)
- [ ] 3.2 Run `npx eslint --fix src/components/AmpEnv.svelte && npx prettier --write src/components/AmpEnv.svelte`

## 4. Delete ClipLed

- [ ] 4.1 Delete `src/components/ClipLed.svelte`
- [ ] 4.2 Delete `src/components/ClipLed.test.js`

## 5. Tests

- [ ] 5.1 Create `src/components/LevelLed.test.js` covering: LED is dim when `powered=false`; LED color is green for low peak; LED color is red when `peak > 1.0`; clip latch holds LED red after peak drops below 1.0
- [ ] 5.2 Update `src/components/Mixer.test.js` to remove any `ClipLed`-specific assertions and add a check that `LevelLed` is rendered in the mixer header
- [ ] 5.3 Run `npx vitest run` and confirm all tests pass
