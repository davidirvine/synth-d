## 1. Keyboard SVG — Top Rail

- [ ] 1.1 Add `RAIL_H = 6` constant to `Keyboard.svelte`
- [ ] 1.2 Insert a `<rect x={0} y={0} width={totalWidth} height={RAIL_H} fill="#2a2a2a" />` as the first child of the SVG element
- [ ] 1.3 Offset all white-key y-positions by `RAIL_H` (change `y={0}` to `y={RAIL_H}`)
- [ ] 1.4 Offset all black-key y-positions by `RAIL_H` (change `y={0}` to `y={RAIL_H}`)
- [ ] 1.5 Increase SVG `height` from `WHITE_H + 2` to `WHITE_H + RAIL_H + 2`
- [ ] 1.6 Lint and format `Keyboard.svelte`

## 2. Keyboard — Middle C Indicator

- [ ] 2.1 After drawing white keys, find the key object with `midi === 60` in the current key array
- [ ] 2.2 If found, add an SVG `<line>` at `x = key.x + WHITE_W / 2`, `y1 = RAIL_H + 4`, `y2 = RAIL_H + WHITE_H - 4`, `stroke="#555"`, `stroke-width="1"`
- [ ] 2.3 Lint and format `Keyboard.svelte`

## 3. Keyboard — 61-Key Expansion with Reactive Base

- [ ] 3.1 Add `baseMidi = 36` prop to `Keyboard.svelte` (replaces the hardcoded `BASE_MIDI = 48`)
- [ ] 3.2 Change key array from a constant to a `$derived` value computed from `baseMidi` and length 61
- [ ] 3.3 Derive `whiteKeys` and `totalWidth` from the new reactive key array
- [ ] 3.4 Verify `totalWidth` is always 36 × 28 = 1 008 px for any valid `baseMidi`
- [ ] 3.5 Lint and format `Keyboard.svelte`

## 4. RegisterPanel Component

- [ ] 4.1 Create `src/components/RegisterPanel.svelte` with props `ondown`, `onup`, and `activeRegister` (`'bottom' | 'top' | 'mid'`)
- [ ] 4.2 Add `"KEYBOARD RANGE"` panel label (10 px, uppercase, cream `#e8dcc8`, letter-spacing 0.1em)
- [ ] 4.3 Add `"Oct ▼"` button that calls `ondown`; style with amber active state when `activeRegister === 'bottom'`
- [ ] 4.4 Add `"Oct ▲"` button that calls `onup`; style with amber active state when `activeRegister === 'top'`
- [ ] 4.5 Apply panel styling: background `#1c1c1c`, 1 px `#333` border, `10px 12px` padding
- [ ] 4.6 Lint and format `RegisterPanel.svelte`

## 5. App Layout — Wire Register Shift

- [ ] 5.1 Add `keyboardBase = $state(36)` to `App.svelte`
- [ ] 5.2 Derive `activeRegister` from `keyboardBase`: `'bottom'` when 21, `'top'` when 48, `'mid'` otherwise
- [ ] 5.3 Import `RegisterPanel` and `EmptyPanel` in `App.svelte`
- [ ] 5.4 Add `<RegisterPanel ondown={() => keyboardBase = 21} onup={() => keyboardBase = 48} {activeRegister} />` to the left of `.panels`
- [ ] 5.5 Add `<EmptyPanel />` (with explicit width to balance the layout) to the right of `.panels`
- [ ] 5.6 Pass `baseMidi={keyboardBase}` to `<Keyboard>`
- [ ] 5.7 Lint and format `App.svelte`

## 6. Tests

- [ ] 6.1 Update `Keyboard.test.js` — key count assertions: 61 keys, 36 white, 25 black
- [ ] 6.2 Update `Keyboard.test.js` — update MIDI range assertions to reflect `baseMidi` default 36 (MIDI 36–96)
- [ ] 6.3 Update `Keyboard.test.js` — assert rail rect exists at y=0 with fill `#2a2a2a`
- [ ] 6.4 Update `Keyboard.test.js` — assert middle C line renders when `baseMidi=36` and does not render when MIDI 60 is outside the window
- [ ] 6.5 Update `Keyboard.test.js` — assert `totalWidth` is 1 008 px for baseMidi 21, 36, and 48
- [ ] 6.6 Create `RegisterPanel.test.js` — assert label "KEYBOARD RANGE" renders
- [ ] 6.7 Create `RegisterPanel.test.js` — assert `ondown` called when Oct ▼ clicked
- [ ] 6.8 Create `RegisterPanel.test.js` — assert `onup` called when Oct ▲ clicked
- [ ] 6.9 Create `RegisterPanel.test.js` — assert amber active style on the correct button for each `activeRegister` value
- [ ] 6.10 Run `npx vitest run` and confirm all tests pass
