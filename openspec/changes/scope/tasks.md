## 1. Engine — AnalyserNode

- [ ] 1.1 In `src/audio/engine.js`, declare a module-level `let analyserNode = null` variable
- [ ] 1.2 In `powerOn()`, after creating `ctx`, create `analyserNode = ctx.createAnalyser()` and set `analyserNode.fftSize = 2048`
- [ ] 1.3 Replace `node.connect(ctx.destination)` with `node.connect(analyserNode); analyserNode.connect(ctx.destination)`
- [ ] 1.4 Export `export function getAnalyser() { return analyserNode }` from `engine.js`
- [ ] 1.5 Run `npx eslint --fix src/audio/engine.js && npx prettier --write src/audio/engine.js`

## 2. Engine Tests

- [ ] 2.1 In `src/audio/engine.test.js`, add `createAnalyser` to `makeMockCtx()` returning a mock analyser object with `connect: vi.fn()` and `fftSize` property
- [ ] 2.2 Add test: `getAnalyser()` returns `null` before `powerOn()` is called
- [ ] 2.3 Add test: `getAnalyser()` returns the analyser node after `powerOn()` completes
- [ ] 2.4 Add test: signal chain is `worklet node → analyserNode → destination` (verify `mockNode.connect` called with analyser, `analyserNode.connect` called with destination)
- [ ] 2.5 Run `npx vitest run src/audio/engine.test.js` and confirm all tests pass
- [ ] 2.6 Run `npx prettier --write src/audio/engine.test.js`

## 3. Scope Component

- [ ] 3.1 Create `src/components/Scope.svelte` with a `<canvas>` element, `height: 80px`, `width: 100%`, background `#1c1c1c`, border `1px solid #333`
- [ ] 3.2 Accept props: `analyser` (the `AnalyserNode` or null) and `powered` (boolean)
- [ ] 3.3 In `onMount`, start a `requestAnimationFrame` loop; on each frame, if `powered && analyser`, call `analyser.getByteTimeDomainData(dataArray)` and draw a cream (`#e8dcc8`) polyline across the canvas
- [ ] 3.4 When `powered` becomes false (reactive), cancel the animation frame and draw a flat midline
- [ ] 3.5 In `onDestroy`, cancel any running animation frame
- [ ] 3.6 Run `npx eslint --fix src/components/Scope.svelte && npx prettier --write src/components/Scope.svelte`

## 4. Scope Tests

- [ ] 4.1 Create `src/components/Scope.test.js`
- [ ] 4.2 Add test: component renders a `<canvas>` element
- [ ] 4.3 Add test: canvas has correct inline style (`height: 80px`, background colour `#1c1c1c`)
- [ ] 4.4 Add test: with `powered=false`, no animation frame is started (stub `requestAnimationFrame`)
- [ ] 4.5 Run `npx vitest run src/components/Scope.test.js` and confirm all tests pass
- [ ] 4.6 Run `npx prettier --write src/components/Scope.test.js`

## 5. App Integration

- [ ] 5.1 In `src/App.svelte`, import `Scope` from `./components/Scope.svelte` and `getAnalyser` from `./audio/engine.js`
- [ ] 5.2 Add reactive state `let analyser = $state(null)` and set `analyser = getAnalyser()` inside the `powerOn` success handler
- [ ] 5.3 Insert `<Scope {analyser} {powered} />` in the layout between the header strip and the control panels
- [ ] 5.4 Run `npx eslint --fix src/App.svelte && npx prettier --write src/App.svelte`

## 6. Full Test Suite

- [ ] 6.1 Run `npx vitest run` and confirm all tests pass
