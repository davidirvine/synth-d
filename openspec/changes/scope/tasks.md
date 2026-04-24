## 1. Engine — AnalyserNode

- [x] 1.1 In `src/audio/engine.js`, declare a module-level `let analyserNode = null` variable
- [x] 1.2 In `powerOn()`, after creating `ctx`, create `analyserNode = ctx.createAnalyser()` and set `analyserNode.fftSize = 2048`
- [x] 1.3 Replace `node.connect(ctx.destination)` with `node.connect(analyserNode); analyserNode.connect(ctx.destination)`
- [x] 1.4 Export `export function getAnalyser() { return analyserNode }` from `engine.js`
- [x] 1.5 Run `npx eslint --fix src/audio/engine.js && npx prettier --write src/audio/engine.js`

## 2. Engine Tests

- [x] 2.1 In `src/audio/engine.test.js`, add `createAnalyser` to `makeMockCtx()` returning a mock analyser object with `connect: vi.fn()` and `fftSize` property
- [x] 2.2 Add test: `getAnalyser()` returns `null` before `powerOn()` is called
- [x] 2.3 Add test: `getAnalyser()` returns the analyser node after `powerOn()` completes
- [x] 2.4 Add test: signal chain is `worklet node → analyserNode → destination` (verify `mockNode.connect` called with analyser, `analyserNode.connect` called with destination)
- [x] 2.5 Run `npx vitest run src/audio/engine.test.js` and confirm all tests pass
- [x] 2.6 Run `npx prettier --write src/audio/engine.test.js`

## 3. Scope Component

- [x] 3.1 Create `src/components/Scope.svelte` with a `<canvas>` element, `height: 80px`, `width: 100%`, background `#1c1c1c`, border `1px solid #333`
- [x] 3.2 Accept props: `analyser` (the `AnalyserNode` or null) and `powered` (boolean)
- [x] 3.3 In `onMount`, start a `requestAnimationFrame` loop; on each frame, if `powered && analyser`, call `analyser.getByteTimeDomainData(dataArray)` and draw a cream (`#e8dcc8`) polyline across the canvas
- [x] 3.4 When `powered` becomes false (reactive), cancel the animation frame and draw a flat midline
- [x] 3.5 In `onDestroy`, cancel any running animation frame
- [x] 3.6 Run `npx eslint --fix src/components/Scope.svelte && npx prettier --write src/components/Scope.svelte`

## 4. Scope Tests

- [x] 4.1 Create `src/components/Scope.test.js`
- [x] 4.2 Add test: component renders a `<canvas>` element
- [x] 4.3 Add test: canvas has correct inline style (`height: 80px`, background colour `#1c1c1c`)
- [x] 4.4 Add test: with `powered=false`, no animation frame is started (stub `requestAnimationFrame`)
- [x] 4.5 Run `npx vitest run src/components/Scope.test.js` and confirm all tests pass
- [x] 4.6 Run `npx prettier --write src/components/Scope.test.js`

## 5. App Integration

- [x] 5.1 In `src/App.svelte`, import `Scope` from `./components/Scope.svelte` and `getAnalyser` from `./audio/engine.js`
- [x] 5.2 Add reactive state `let analyser = $state(null)` and set `analyser = getAnalyser()` inside the `powerOn` success handler
- [x] 5.3 Insert `<Scope {analyser} {powered} />` in the output placeholder panel slot (below Output, beside Modulation/Glide)
- [x] 5.4 Run `npx eslint --fix src/App.svelte && npx prettier --write src/App.svelte`

## 6. Full Test Suite

- [x] 6.1 Run `npx vitest run` and confirm all tests pass
