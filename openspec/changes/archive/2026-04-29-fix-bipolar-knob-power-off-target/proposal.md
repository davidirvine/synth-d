## Why

Bipolar knobs (osc2 detune, osc3 detune, modulation mix) animate to their parameter minimum on power-off, landing at the fully counter-clockwise position. For bipolar controls the visually neutral position is 12 o'clock (the sweep midpoint), so sweeping to minimum looks wrong — the knob appears to "fall over" rather than settle to rest.

## What Changes

- On power-off, bipolar knobs animate to their sweep midpoint (12 o'clock) instead of their parameter minimum.
- On the next power-on, bipolar knobs start from the midpoint and animate to their default values.
- Non-bipolar knobs are unaffected: they continue to animate to their parameter minimum on power-off.
- Affected knobs: `osc2Detune` (midpoint = 0 cents), `osc3Detune` (midpoint = 0 cents), `modMix` (midpoint = 0.5).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `knob-power-state`: Power-off animation target changes from parameter minimum to sweep midpoint for bipolar knobs; power-on start position changes correspondingly.

## Impact

- `src/App.svelte` — `handleToggle`: power-off branch sets `ccExternalValues` to min for non-bipolar params and to midpoint for bipolar params; power-on init also uses midpoint (not min) as the starting `ccExternalValues` for bipolar params.
- `openspec/specs/knob-power-state/spec.md` — requirements updated to reflect midpoint-target behavior for bipolar knobs.
