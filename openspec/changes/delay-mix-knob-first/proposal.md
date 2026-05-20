## Why

The delay sub-section currently orders its knobs `time, feedback, mix`. Putting `mix` first — as the leftmost knob — makes the most-reached-for control (how present the delay is) the entry point to the section, and reads more naturally left-to-right when dialling in an effect: decide how much, then shape it. This is a small ergonomics improvement with no change to how the delay sounds.

## What Changes

- Reorder the delay knob row in `Effects.svelte` so the order becomes `mix, time, feedback` (was `time, feedback, mix`).
- The delay stays an **insert effect with the dry/wet `mix` crossfade exactly as today** — the `mix` knob, its range, default, and behaviour are unchanged. This is purely the left-to-right position of the knob.
- No DSP or signal-routing change, no parameter rename, no MIDI CC map change, no state/default change.
- Update the index-based knob assertions in `Effects.test.js` to match the new order, re-keying lookups by label rather than array position so they don't break on future reorders.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `delay`: the "Combined Effects panel" requirement specifies the delay knob order as `time, feedback, mix`; the modulation-row requirement restates the first row as `time, feedback, mix`. Both change to `mix, time, feedback`.
- `synth-ui`: the "Knob rows contain only knobs" scenario enumerates the delay knobs in old order (`time, feedback, mix`); update the enumeration to `mix, time, feedback`. (Requirement intent — "the knob row contains only knobs, no toggle" — is unchanged.)

## Impact

- `src/components/Effects.svelte` — move the `mix` `Knob` to the front of the delay `.effects-row` block.
- `src/components/Effects.test.js` — update the double-click and right-click index→param mappings for the delay knob row; prefer label-based lookup over `hits[index]`.
- No change to `faust/synth.dsp`, `App.svelte` `KNOB_PARAMS`/`DEFAULTS`, `midiCcMap.js`, or patch save/load.
