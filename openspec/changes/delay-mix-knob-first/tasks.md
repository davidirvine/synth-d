## 1. Reorder the delay knob row

- [x] 1.1 In `src/components/Effects.svelte`, move the `mix` `Knob` block to the front of the delay `.effects-row` so the source order becomes `mix`, `time`, `feedback` (range, default 0.3, scale, MIDI props, and handlers unchanged). Run `npx eslint --fix` then `npx prettier --write` on the file; commit.

## 2. Update tests to assert the new order

- [x] 2.1 In `src/components/Effects.test.js`, re-key the delay-row double-click (param-dispatch) and right-click (context-menu) tests to locate knobs by label (`mix`/`time`/`feedback`) within the delay section instead of by `hits[index]`, and assert the new left-to-right order. Run prettier on the file; commit.
- [x] 2.2 Grep the rest of the suite (e.g. `App.test.js`) for any other positional delay-knob assertions; update any found to match the new order, or confirm none exist. Commit only if changes were needed.

## 3. Verify

- [ ] 3.1 Run `npx vitest run` and confirm all unit/component tests pass.
- [ ] 3.2 Run `npx playwright test` and confirm E2E tests pass.
- [ ] 3.3 Run `npx stryker run` and confirm mutation score ≥ 85%.
