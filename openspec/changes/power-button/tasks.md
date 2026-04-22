## 1. Branch Setup

- [x] 1.1 Create git branch `power-button/power-button-control` from `main`

## 2. Audio Engine

- [x] 2.1 Rename `initAudio()` to `powerOn()` in `src/audio/engine.js` and update all callers
- [x] 2.2 Add `powerOff()` export to `src/audio/engine.js` that calls `ctx.suspend()` (no-op if ctx is null)
- [x] 2.3 Add `initialized` guard so `powerOn()` skips WASM load and calls `ctx.resume()` on subsequent invocations

## 3. PowerButton Component

- [x] 3.1 Create `src/components/PowerButton.svelte` with props: `powered` (bool), `loading` (bool), and a `toggle` event
- [x] 3.2 Implement LED indicator: amber `#c87941` when ON, dark `#3a3a3a` when OFF
- [x] 3.3 Display "POWER" label below the button and "STARTING…" text while `loading` is true
- [x] 3.4 Apply dark body `#1c1c1c`, cream label `#e8dcc8`, monospace font to match synth aesthetic
- [x] 3.5 Run `npx eslint --fix src/components/PowerButton.svelte && npx prettier --write src/components/PowerButton.svelte`

## 4. App Integration

- [ ] 4.1 Remove the `started` state, `.overlay` markup, and `.overlay` / `.overlay-text` CSS from `App.svelte`
- [ ] 4.2 Add `powered`, `loading` state variables and a header strip element above `.panels` in `App.svelte`
- [ ] 4.3 Import and render `PowerButton` in the header strip; wire its `toggle` event to call `powerOn()` / `powerOff()`
- [ ] 4.4 Add `inert` attribute and `opacity: 0.4` style to `<main>` when `powered` is false
- [ ] 4.5 Run `npx eslint --fix src/App.svelte && npx prettier --write src/App.svelte`

## 5. Tests

- [ ] 5.1 Add unit tests for `powerOn()` and `powerOff()` in `src/audio/engine.test.js` (mock AudioContext)
- [ ] 5.2 Add component test for `PowerButton.svelte`: renders OFF by default, emits toggle event on click, shows STARTING label when loading
- [ ] 5.3 Add integration test in `App.svelte` test: controls are inert when powered off, active when powered on
- [ ] 5.4 Run `npx vitest run` and confirm all tests pass

## 6. Verification and Merge

- [ ] 6.1 Manually verify in browser: power button OFF on load, power-on starts audio, power-off stops audio, knobs unresponsive when off
- [ ] 6.2 Run `npx vitest run` one final time — all tests must pass
- [ ] 6.3 Commit all changes and open PR targeting `main`
