## 1. Template Changes

- [ ] 1.1 In `src/components/Filter.svelte`, remove the `<span class="key-track-label">Key Track</span>` element entirely
- [ ] 1.2 Change the button's inner text expression from `{keyTrackOn === 1 ? 'on' : 'off'}` to the static string `KEY TRACK`
- [ ] 1.3 Remove the `aria-label="Key Track"` attribute from the button — the visible text now serves as the accessible label

## 2. Style Cleanup

- [ ] 2.1 In `src/components/Filter.svelte` `<style>`, delete the `.key-track-label` rule block (it will be an unused selector)

## 3. Lint and Format

- [ ] 3.1 Run `npx eslint --fix src/components/Filter.svelte`
- [ ] 3.2 Run `npx prettier --write src/components/Filter.svelte`

## 4. Verification

- [ ] 4.1 Run `npx vitest run` — all tests pass (existing `getByRole('button', { name: /key track/i })` queries match button text "KEY TRACK" via regex)
- [ ] 4.2 Visual check: button sits level with the cutoff and resonance knob SVG bodies with no gap above it
- [ ] 4.3 Visual check: button reads "KEY TRACK" when off and "KEY TRACK" (highlighted) when clicked on
