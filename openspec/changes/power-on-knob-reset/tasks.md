## 1. Knob Component

- [ ] 1.1 Add `springEnabled: boolean` prop (default `false`) to `Knob.svelte` props destructuring and JSDoc type
- [ ] 1.2 In the `externalValue $effect`, change `springPos.set(...)` to pass `{ instant: !springEnabled }` so spring only animates when `springEnabled` is `true`

## 2. Panel Components

- [ ] 2.1 Add `springEnabled` prop to `Oscillator.svelte` and pass it to every `Knob` it renders
- [ ] 2.2 Add `springEnabled` prop to `Mixer.svelte` and pass it to every `Knob` it renders
- [ ] 2.3 Add `springEnabled` prop to `Filter.svelte` and pass it to every `Knob` it renders
- [ ] 2.4 Add `springEnabled` prop to `AmpEnv.svelte` and pass it to every `Knob` it renders
- [ ] 2.5 Add `springEnabled` prop to `Modulation.svelte` and pass it to every `Knob` it renders
- [ ] 2.6 Add `springEnabled` prop to `Glide.svelte` and pass it to every `Knob` it renders
- [ ] 2.7 Add `springEnabled` prop to `Effects.svelte` and pass it to every `Knob` it renders

## 3. App.svelte Orchestration

- [ ] 3.1 Add `let springEnabled = $state(false)` to `App.svelte`
- [ ] 3.2 In `handleToggle` (power-on branch), set `springEnabled = true` immediately before `ccExternalValues = { ...DEFAULTS }`, then schedule `setTimeout(() => { springEnabled = false }, 800)` after the reset
- [ ] 3.3 Pass `springEnabled` to all seven panel components in the `App.svelte` template

## 4. Tests

- [ ] 4.1 Add `Knob` unit test: when `springEnabled={false}` (default), an `externalValue` change calls `springPos.set` with `{ instant: true }`
- [ ] 4.2 Add `Knob` unit test: when `springEnabled={true}`, an `externalValue` change calls `springPos.set` without `{ instant: true }` (spring animates)
- [ ] 4.3 Add `Knob` unit test: drag calls `springPos.set` with `{ instant: true }` regardless of `springEnabled` value
