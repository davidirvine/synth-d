## 1. Knob component props

- [ ] 1.1 Add `showArc` boolean prop (default `true`) to `Knob.svelte` type annotation and destructuring
- [ ] 1.2 Add `bipolar` boolean prop (default `false`) to `Knob.svelte` type annotation and destructuring
- [ ] 1.3 Implement `bipolarArcPath(pos)` function that draws the arc from the sweep center (12 o'clock) to the indicator
- [ ] 1.4 Make the active arc element conditional: render nothing when `showArc` is false, `bipolarArcPath` when `bipolar` is true, existing `arcPath` otherwise
- [ ] 1.5 Lint and format `Knob.svelte`

## 2. Consumer updates

- [ ] 2.1 Pass `showArc={false}` to the filter mode knob in `Filter.svelte`
- [ ] 2.2 Pass `bipolar={true}` to the filter env amount knob in `FilterEnv.svelte`
- [ ] 2.3 Lint and format `Filter.svelte` and `FilterEnv.svelte`

## 3. Tests

- [ ] 3.1 Add test: mode knob with `showArc={false}` renders no arc element but keeps the track
- [ ] 3.2 Add test: amount knob with `bipolar={true}` and pos > 0.5 renders a clockwise arc from center
- [ ] 3.3 Add test: amount knob with `bipolar={true}` and pos < 0.5 renders a counter-clockwise arc from center
- [ ] 3.4 Add test: amount knob with `bipolar={true}` and pos = 0.5 renders no arc
- [ ] 3.5 Add test: default knob (no new props) behavior unchanged
- [ ] 3.6 Run `npx vitest run` and confirm all tests pass

## 4. Archive delta spec

- [ ] 4.1 Run `openspec archive --change knob-changes` after implementation is verified
