## 1. Branch Setup

- [x] 1.1 Create git branch `power-button/power-button-control` from `main`

## 2. Audio Engine

- [x] 2.1 Rename `initAudio()` to `powerOn()` in `src/audio/engine.js` and update all callers
- [x] 2.2 Add `powerOff()` export to `src/audio/engine.js` that calls `ctx.suspend()` (no-op if ctx is null)
- [x] 2.3 Add `initialized` guard so `powerOn()` skips WASM load and calls `ctx.resume()` on subsequent invocations

## 3. PowerButton Component

- [x] 3.1 Create `src/components/PowerButton.svelte` with props: `powered` (bool), `loading` (bool), and a `toggle` event
- [x] 3.2 Implement power icon (SVG arc + line): amber `#c87941` with glow when ON, dark `#3a3a3a` when OFF
- [x] 3.3 Disable button interaction while `loading` is true (no label or text change)
- [x] 3.4 Apply dark body `#1c1c1c` to match synth aesthetic (no text label)
- [x] 3.5 Run `npx eslint --fix src/components/PowerButton.svelte && npx prettier --write src/components/PowerButton.svelte`

## 4. App Integration

- [x] 4.1 Remove the `started` state, `.overlay` markup, and `.overlay` / `.overlay-text` CSS from `App.svelte`
- [x] 4.2 Add `powered`, `loading` state variables and a header strip element above `.panels` in `App.svelte`
- [x] 4.3 Import and render `PowerButton` in the header strip; wire its `toggle` event to call `powerOn()` / `powerOff()`
- [x] 4.4 Add `inert` attribute and `opacity: 0.4` style to `<main>` when `powered` is false
- [x] 4.5 Run `npx eslint --fix src/App.svelte && npx prettier --write src/App.svelte`

## 5. Tests

- [x] 5.1 Add unit tests for `powerOn()` and `powerOff()` in `src/audio/engine.test.js` (mock AudioContext)
- [x] 5.2 Add component test for `PowerButton.svelte`: renders OFF by default, emits toggle event on click, button disabled while loading
- [x] 5.3 Add integration test in `App.svelte` test: controls are inert when powered off, active when powered on
- [x] 5.4 Run `npx vitest run` and confirm all tests pass

## 6. Verification and Merge

- [x] 6.1 Manually verify in browser: power button OFF on load, power-on starts audio, power-off stops audio, knobs unresponsive when off
- [x] 6.2 Run `npx vitest run` one final time — all tests must pass
- [x] 6.3 Commit all changes and open PR targeting `main`
