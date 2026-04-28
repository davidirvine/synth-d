## 1. App.svelte — init and power-off changes

- [ ] 1.1 Replace the random `ccExternalValues` initial state with per-param min values using `KNOB_PARAMS[p].min`
- [ ] 1.2 Replace `ccExternalValues = {}` in the power-off branch with an object mapping each param to its `KNOB_PARAMS[p].min` value

## 2. Power-off spring animation

- [ ] 2.1 In `handleToggle`, enable `springEnabled` (set `resetCounter` or equivalent trigger) before setting `ccExternalValues` to mins on power-off, so the spring sweep runs
- [ ] 2.2 Schedule `springEnabled` to be disabled after 800 ms following the power-off sweep (mirrors the existing power-on spring-disable timer)

## 3. Tests

- [ ] 3.1 Update `App.test.js`: assert that on mount all knob `externalValue` entries equal their `KNOB_PARAMS` min (not a random value)
- [ ] 3.2 Update `App.test.js`: assert that after power-off `ccExternalValues` entries equal their `KNOB_PARAMS` min (not `undefined`)
- [ ] 3.3 Run `npx vitest run` and confirm all tests pass
