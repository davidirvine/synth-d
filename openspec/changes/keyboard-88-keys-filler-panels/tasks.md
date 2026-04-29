## 1. Keyboard SVG — Top Rail

- [x] 1.1 Add `RAIL_H = 1` constant to `Keyboard.svelte`
- [x] 1.2 Insert a `<rect x={0} y={0} width={totalWidth} height={RAIL_H} fill="#333" />` as the first child of the SVG element
- [x] 1.3 Offset all white-key y-positions by `RAIL_H` (change `y={0}` to `y={RAIL_H}`)
- [x] 1.4 Offset all black-key y-positions by `RAIL_H` (change `y={0}` to `y={RAIL_H}`)
- [x] 1.5 Increase SVG `height` from `WHITE_H + 2` to `WHITE_H + RAIL_H + 2`
- [x] 1.6 Lint and format `Keyboard.svelte`

## 2. Keyboard — Middle C Indicator (removed from scope)

- [x] 2.1 Evaluated middle C indicator — decided not to implement; note labels on white keys provide sufficient orientation
- [x] 2.2 No SVG `<line>` element added; test updated to confirm no line is rendered
- [x] 2.3 Lint and format `Keyboard.svelte`

## 3. Keyboard — 61-Key Expansion with Reactive Base

- [x] 3.1 Add `baseMidi = 36` prop to `Keyboard.svelte` (replaces the hardcoded `BASE_MIDI = 48`)
- [x] 3.2 Change key array from a constant to a `$derived` value computed from `baseMidi` and length 61
- [x] 3.3 Derive `whiteKeys` and `totalWidth` from the new reactive key array
- [x] 3.4 Verify `totalWidth` is always 36 × 28 = 1 008 px for any valid `baseMidi`
- [x] 3.5 Lint and format `Keyboard.svelte`

## 4. RegisterPanel Component

- [x] 4.1 Create `src/components/RegisterPanel.svelte` with props `ondown`, `onup`, and `activeRegister` (`'bottom' | 'top' | 'mid'`)
- [x] 4.2 Add `"KEYBOARD RANGE"` panel label (10 px, uppercase, cream `#e8dcc8`, letter-spacing 0.1em)
- [x] 4.3 Add `"Oct ▼"` button that calls `ondown`; style with amber active state when `activeRegister === 'bottom'`
- [x] 4.4 Add `"Oct ▲"` button that calls `onup`; style with amber active state when `activeRegister === 'top'`
- [x] 4.5 Apply panel styling: background `#1c1c1c`, 1 px `#333` border, `10px 12px` padding
- [x] 4.6 Lint and format `RegisterPanel.svelte`

## 5. App Layout — Wire Register Shift

- [x] 5.1 Add `keyboardBase = $state(36)` to `App.svelte` (default is C2 mid-range; bottom register 21 also available)
- [x] 5.2 Derive `activeRegister` from `keyboardBase`: `'bottom'` when 21, `'top'` when 48, `'mid'` otherwise
- [x] 5.3 Import `RegisterPanel` and `WheelPanel` in `App.svelte`
- [x] 5.4 Add `<RegisterPanel ondown={() => keyboardBase = 21} onup={() => keyboardBase = 48} {activeRegister} />` to the right of `<Keyboard>` in `.keyboard-row`
- [x] 5.5 Add `<WheelPanel externalValue={ccExternalValues.modWheel} onchange={onParamChange} />` to the left of `<Keyboard>` in `.keyboard-row`
- [x] 5.6 Pass `baseMidi={keyboardBase}` to `<Keyboard>`
- [x] 5.7 Lint and format `App.svelte`

## 6. Tests

- [x] 6.1 Update `Keyboard.test.js` — key count assertions: 61 keys, 36 white, 25 black
- [x] 6.2 Update `Keyboard.test.js` — update MIDI range assertions to reflect `baseMidi` default 36 (MIDI 36–96)
- [x] 6.3 Update `Keyboard.test.js` — assert rail rect exists at y=0 with fill `#333`
- [x] 6.4 Update `Keyboard.test.js` — assert no middle C `<line>` element is rendered (feature not implemented)
- [x] 6.5 Update `Keyboard.test.js` — assert `totalWidth` is 1 008 px for baseMidi 21, 36, and 48
- [x] 6.6 Create `RegisterPanel.test.js` — assert label "KEYBOARD RANGE" renders
- [x] 6.7 Create `RegisterPanel.test.js` — assert `ondown` called when Oct ▼ clicked
- [x] 6.8 Create `RegisterPanel.test.js` — assert `onup` called when Oct ▲ clicked
- [x] 6.9 Create `RegisterPanel.test.js` — assert amber active style on the correct button for each `activeRegister` value
- [x] 6.10 Run `npx vitest run` and confirm all tests pass

## 7. WheelPanel Component

- [x] 7.1 Create `src/components/WheelPanel.svelte` with props `externalValue` and `onchange`; draggable vertical slider emitting `modWheel` param changes
- [x] 7.2 Style with panel background `#1c1c1c`, 1 px `#333` border, amber fill `#c87941`; default slider at 0.5
- [x] 7.3 Create `WheelPanel.test.js` — assert label renders, drag emits correct values, externalValue syncs fill height
- [x] 7.4 Lint and format `WheelPanel.svelte`

## 8. Spec Sync

- [x] 8.1 Apply the delta spec from `openspec/changes/keyboard-88-keys-filler-panels/specs/keyboard/spec.md` to `openspec/specs/keyboard/spec.md`
- [x] 8.2 Apply the delta spec from `openspec/changes/keyboard-88-keys-filler-panels/specs/synth-ui/spec.md` to `openspec/specs/synth-ui/spec.md`
- [x] 8.3 Run `npx prettier --write openspec/specs/keyboard/spec.md openspec/specs/synth-ui/spec.md`
