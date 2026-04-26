## 1. Disable Range and Detune Controls in LFO Mode

- [x] 1.1 In `src/components/Oscillator.svelte`, add `disabled={osc3LfoMode === 1}` to both OSC 3 range step `<button>` elements (the `−` and `+` buttons in the OSC 3 `range-row`)
- [x] 1.2 Add `disabled={osc3LfoMode === 1}` to the OSC 3 `<Knob>` detune component
- [x] 1.3 Run `npx eslint --fix src/components/Oscillator.svelte` then `npx prettier --write src/components/Oscillator.svelte`

## 2. Verification

- [x] 2.1 Verify in the browser: enable LFO mode on OSC 3 and confirm range buttons and detune knob are non-interactive; disable LFO mode and confirm they become interactive again
- [x] 2.2 Verify the waveform selector buttons remain interactive in both audio and LFO modes
- [x] 2.3 Run `npx vitest run` and confirm all tests pass
