## 1. Expose release-all from Keyboard

- [x] 1.1 Add a `_releaseAll` function in [Keyboard.svelte](src/components/Keyboard.svelte) that empties `activeKeys` by routing through the existing release path (so `gate` → 0 fires via the established "all sources released" branch and is not open-coded)
- [x] 1.2 Export `_releaseAll` alongside the existing `_triggerNote` / `_releaseNote` bindings, matching the same prop/bind pattern

## 2. Wire power-off in App.svelte

- [x] 2.1 Add a `keyboardReleaseAll` binding in [App.svelte](src/App.svelte) (mirroring `keyboardTriggerNote` / `keyboardReleaseNote`)
- [x] 2.2 Call `keyboardReleaseAll?.()` from `handleToggle()` on the power-off branch, before `midiManager.destroy()` and `engine.powerOff()`

## 3. Tests for new spec scenarios

- [x] 3.1 Component test: invoking `_releaseAll` while one key is held empties `activeKeys`, removes the active class on the rendered key, and writes `gate = 0`
- [ ] 3.2 Component test: invoking `_releaseAll` with multiple held inputs (QWERTY + simulated MIDI binding) empties `activeKeys` and removes all highlights
- [ ] 3.3 Component / integration test: simulating a power-off → power-on cycle with a continuously-held QWERTY key leaves the keyboard un-highlighted after power-on and `gate` at 0; a fresh keydown is required to retrigger
- [ ] 3.4 Run `npx vitest run` and confirm the new tests pass alongside the existing keyboard suite
