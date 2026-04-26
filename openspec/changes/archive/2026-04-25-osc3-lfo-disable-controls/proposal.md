## Why

When OSC 3 LFO mode is active, the range and detune controls have no effect — the DSP ignores them in favour of the LFO rate — but the UI leaves them fully interactive, giving the false impression that they do something. This is the inverse of the rate knob, which is already correctly disabled in audio mode.

## What Changes

- `src/components/Oscillator.svelte`: disable the OSC 3 range `+`/`−` step buttons and the detune knob when `osc3LfoMode === 1`, mirroring the existing `disabled={osc3LfoMode === 0}` guard on the rate knob

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `oscillator`: add requirement that OSC 3 range and detune controls are disabled while LFO mode is on

## Impact

- `src/components/Oscillator.svelte`: two `disabled` prop additions and one conditional class on step buttons — no DSP or logic changes
- No changes to FAUST, mixer, modulation routing, tests, or any other component
