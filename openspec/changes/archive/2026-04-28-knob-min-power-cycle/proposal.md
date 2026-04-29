## Why

Knobs currently initialise with random values on page load, which serves no user-visible purpose now that the spring animation fires from the pre-reset position rather than from a fixed floor. The power-off path leaves knobs wherever they happen to be, so re-powering the synth animates from an arbitrary mid-position rather than from the "off" floor — making the power-on sweep visually inconsistent.

## What Changes

- On page load all knob `externalValue` props are set to the parameter's `min` value instead of a random value in `[min, max]`
- On power-off all knob `externalValue` props are set to each parameter's `min` value (triggering a spring-animated sweep to the floor), instead of being cleared to `undefined` which left knobs frozen in place
- Power-on behaviour is unchanged: knobs spring from their current position (now always `min`) to `DEFAULTS`

## Capabilities

### New Capabilities

- `knob-power-state`: Specifies how knob visual positions relate to synth power state — starting at min on page load, springing to defaults on power-on, and sweeping back to min on power-off

### Modified Capabilities

- `knob-spring-reset`: Power-off now also triggers a spring sweep (to min), not just power-on

## Impact

- `src/App.svelte`: `ccExternalValues` initial value changes from random to per-param min; power-off branch changes from `{}` to per-param min values
- No changes to `Knob.svelte`, panel components, or the audio engine
- No new props or public API changes
