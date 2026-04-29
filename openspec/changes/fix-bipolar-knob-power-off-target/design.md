## Context

`App.svelte` manages `ccExternalValues`, a record of one `externalValue` per knob param. On power-off this is reset to `KNOB_PARAMS[p].min` for every param; on power-on it is set to `DEFAULTS`. Both transitions drive spring animations in the `Knob` component via the `externalValue` prop.

Bipolar knobs render their arc from the 12 o'clock center rather than from the sweep start, so their visually neutral position is the sweep midpoint (`(min + max) / 2`), not `min`. Animating to `min` on power-off leaves a bipolar knob fully counter-clockwise, which looks wrong.

Three knobs are bipolar: `osc2Detune` (midpoint = 0 ¢), `osc3Detune` (midpoint = 0 ¢), and `modMix` (midpoint = 0.5). All three are already in `KNOB_PARAMS` and `DEFAULTS`.

## Goals / Non-Goals

**Goals:**

- Bipolar knobs animate to their sweep midpoint on power-off.
- Bipolar knobs start from their sweep midpoint on the subsequent power-on, so the next sweep begins at 12 o'clock.
- Non-bipolar knobs are unaffected.

**Non-Goals:**

- Changing spring animation parameters or animation duration.
- Adding `springEnabled` to knobs (separate concern).
- Changing any defaults or parameter ranges.

## Decisions

**Declare a `BIPOLAR_PARAMS` set in `App.svelte`**

A small `Set` listing the param names whose power transition target is midpoint rather than min: `new Set(['osc2Detune', 'osc3Detune', 'modMix'])`. A helper `powerOffValue(p)` returns `(KNOB_PARAMS[p].min + KNOB_PARAMS[p].max) / 2` for bipolar params and `KNOB_PARAMS[p].min` otherwise.

Alternatives considered:

- _Store `bipolar` flag in `KNOB_PARAMS`_: would couple audio-domain metadata to a UI rendering concern (`bipolar` is a Knob visual prop). Rejected.
- _Derive from `DEFAULTS`_: `osc2Detune` default = 0, which happens to equal midpoint, but `modMix` default = 0 ≠ midpoint 0.5. Not reliable. Rejected.

**Use the same midpoint as the power-on start value**

On power-on, `ccExternalValues` is initialised to the power-off target rather than always to `min`. Bipolar params therefore start from 12 o'clock and animate to `DEFAULTS`. Non-bipolar params start from `min` as before.

## Risks / Trade-offs

- [modMix default is 0, but power-off target is 0.5] → On power-on, modMix will sweep from 0.5 → 0 (centred to LFO). This is an intentional visual choice: 12 o'clock → LFO end is more legible than 0 → 0 (no motion). Acceptable.
- [Small `BIPOLAR_PARAMS` set must stay in sync with Knob `bipolar` props] → Low-risk: there are only three bipolar knobs and they are unlikely to change. Document the coupling in a comment.
