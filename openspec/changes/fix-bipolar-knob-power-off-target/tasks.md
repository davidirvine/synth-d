## 1. App.svelte — bipolar power transition values

- [ ] 1.1 Add `BIPOLAR_PARAMS` set in `App.svelte` listing `'osc2Detune'`, `'osc3Detune'`, and `'modMix'`
- [ ] 1.2 Add `powerOffValue(p)` helper that returns `(KNOB_PARAMS[p].min + KNOB_PARAMS[p].max) / 2` for bipolar params and `KNOB_PARAMS[p].min` otherwise
- [ ] 1.3 Update the `ccExternalValues` initialisation (page load) to use `powerOffValue(p)` instead of `KNOB_PARAMS[p].min`
- [ ] 1.4 Update the power-off branch in `handleToggle` to use `powerOffValue(p)` instead of `KNOB_PARAMS[p].min`
- [ ] 1.5 Update the power-on branch in `handleToggle` to initialise `ccExternalValues` from `powerOffValue(p)` (not `min`) before setting to `DEFAULTS`

## 2. Tests

- [ ] 2.1 Add unit tests verifying `powerOffValue` returns midpoint for bipolar params and min for non-bipolar params
- [ ] 2.2 Add component tests verifying that on power-off, bipolar knob `externalValue` is set to midpoint and non-bipolar knob `externalValue` is set to min
- [ ] 2.3 Add component tests verifying that on page load, bipolar knob `externalValue` initialises to midpoint
