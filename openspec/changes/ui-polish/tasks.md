## 1. Product Name and Window Title

- [ ] 1.1 In `src/App.svelte`, change the header title text from `SYNTH-1` to `SYNTH-D`
- [ ] 1.2 In `index.html`, change `<title>subtractive-synth</title>` to `<title>SYNTH-D</title>`
- [ ] 1.3 Merge all ADDED and MODIFIED requirements from `openspec/changes/ui-polish/specs/synth-ui/spec.md` into `openspec/specs/synth-ui/spec.md`

## 2. Layout and Spacing

- [ ] 2.1 In `src/App.svelte`, change `main { padding: 20px }` to `padding: 8px`
- [ ] 2.2 In `src/App.svelte`, replace `.panels` CSS — remove `display: flex; flex-wrap: wrap; align-items: flex-start` and add `display: grid; grid-template-columns: auto auto auto` and preserve `gap: 8px` on `.panels`

## 3. Effects Panel — Toggle Button Placement

- [ ] 3.1 In `src/components/Effects.svelte`, for each section (delay and reverb): wrap the `<span class="sub-label">` and `<button class="toggle-btn">` in a `<div class="section-header">` flex row, and remove the button from `.effects-row`
- [ ] 3.2 In `src/components/Effects.svelte`, add `.section-header` CSS: `display: flex; align-items: center; justify-content: space-between`

## 4. Filter Panel — Key Track Switch

- [ ] 4.1 In `src/components/Filter.svelte`, add `let keyTrackOn = $state(0)` and a `toggleKeyTrack` function that flips between `0` and `1` and calls `onchange?.({ param: 'keyTrack', value: keyTrackOn })`
- [ ] 4.2 In `src/components/Filter.svelte`, remove the `key trk` `<Knob>` and replace it with a `<button class="toggle-btn" class:active={keyTrackOn === 1} onclick={toggleKeyTrack} aria-pressed={keyTrackOn === 1}>Key Track</button>` — keep it in the top knob row alongside the cutoff and res knobs
- [ ] 4.3 In `src/components/Filter.svelte`, add `.toggle-btn` base and `.toggle-btn.active` CSS — base: `font-family: inherit; font-size: 9px; background: #2a2a2a; color: #888; border: 1px solid #444; padding: 3px 8px; cursor: pointer; text-transform: uppercase; height: 22px; width: 32px` — active: `background: #1a2a1a; color: #20b040; border-color: #20b040`

## 5. On/Off Switch Active Color

- [ ] 5.1 In `src/components/Effects.svelte`, update `.toggle-btn.active` to `background: #1a2a1a; color: #20b040; border-color: #20b040`
- [ ] 5.2 In `src/components/Glide.svelte`, update `.glide-btn.active` to `background: #1a2a1a; color: #20b040; border-color: #20b040`

## 6. Component Tests (vitest)

- [ ] 6.1 In the Filter component test, assert that `keyTrack` initial value is `0` (default off state)
- [ ] 6.2 In the Filter component test, assert that after clicking the Key Track button (e.g. `await fireEvent.click(keyTrackButton)`) the `active` CSS class is present on the button
- [ ] 6.3 In the Filter component test, assert that after clicking the Key Track button a second time (e.g. `await fireEvent.click(keyTrackButton)`) the `active` CSS class is absent
- [ ] 6.4 In the Effects component test, assert that the delay knob row contains exactly 3 knobs (time, feedback, mix) and no toggle button
- [ ] 6.5 In the Effects component test, assert that the reverb knob row contains exactly 3 knobs (mix, decay, tone) and no toggle button

## 7. Playwright Tests

- [ ] 7.1 Add a Playwright test that renders the full app and asserts all three top-level panel columns (Oscillator Bank, Mixer, filter-output-grid) share the same `bottom` bounding-box coordinate
- [ ] 7.2 Add a Playwright test that resizes the browser viewport to a narrow width and asserts the three top-level panel columns remain in a single row (no wrapping)
