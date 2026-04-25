## 1. Product Name and Window Title

- [ ] 1.1 In `src/App.svelte`, change the header title text from `SYNTH-1` to `SYNTH-D`
- [ ] 1.2 In `index.html`, change `<title>subtractive-synth</title>` to `<title>SYNTH-D</title>`

## 2. Layout and Spacing

- [ ] 2.1 In `src/App.svelte`, change `main { padding: 20px }` to `padding: 8px`
- [ ] 2.2 In `src/App.svelte`, replace `.panels` CSS — remove `display: flex; flex-wrap: wrap; align-items: flex-start` and add `display: grid; grid-template-columns: auto auto auto`

## 3. Effects Panel — Toggle Button Placement

- [ ] 3.1 In `src/components/Effects.svelte`, for each section (delay and reverb): wrap the `<span class="sub-label">` and `<button class="toggle-btn">` in a `<div class="section-header">` flex row, and remove the button from `.effects-row`
- [ ] 3.2 In `src/components/Effects.svelte`, add `.section-header` CSS: `display: flex; align-items: center; justify-content: space-between`

## 4. Filter Panel — Key Track Switch

- [ ] 4.1 In `src/components/Filter.svelte`, add `let keyTrackOn = $state(0)` and a `toggleKeyTrack` function that flips between `0` and `1` and calls `onchange?.({ param: 'keyTrack', value: keyTrackOn })`
- [ ] 4.2 In `src/components/Filter.svelte`, remove the `key trk` `<Knob>` and replace it with a `<button class="toggle-btn" class:active={keyTrackOn === 1} onclick={toggleKeyTrack} aria-pressed={keyTrackOn === 1}>Key Track</button>` — keep it in the top knob row alongside the cutoff and res knobs
- [ ] 4.3 In `src/components/Filter.svelte`, add `.toggle-btn` and `.toggle-btn.active` CSS matching the styles in step 5 below

## 5. On/Off Switch Active Color

- [ ] 5.1 In `src/components/Effects.svelte`, update `.toggle-btn.active` to `background: #1a2a1a; color: #20b040; border-color: #20b040`
- [ ] 5.2 In `src/components/Glide.svelte`, update `.glide-btn.active` to `background: #1a2a1a; color: #20b040; border-color: #20b040`
