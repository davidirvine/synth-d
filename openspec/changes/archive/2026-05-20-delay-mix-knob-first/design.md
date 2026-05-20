## Context

The delay sub-section of `Effects.svelte` renders three knobs in a single `.effects-row` flexbox in source order `time, feedback, mix`. The DSP (`faust/synth.dsp`) treats `delayMix` as a dry/wet crossfade insert (`delayOut = masterOut * (1 - delayMix) + delayWet * delayMix`); nothing about that — or the `KNOB_PARAMS`/`DEFAULTS` registries, MIDI CC map, or patch save/load — depends on the visual position of the knob. The only place rendering order is observable is the markup itself and tests that locate knobs by DOM index.

`Effects.test.js` currently locates delay knobs positionally: it collects all delay knob hit-targets into a `hits` array and asserts `hits[0]→delayTime`, `hits[1]→delayFeedback`, `hits[2]→delayMix` for both double-click (param dispatch) and right-click (context-menu) cases. These index assertions are coupled to source order and will silently mis-target if the order changes without being updated.

## Goals / Non-Goals

**Goals:**

- Render the delay knob row in left-to-right order `mix, time, feedback`.
- Keep the `mix` knob's range, default (0.3), scale, MIDI-learn wiring, and crossfade DSP behaviour identical to today.
- Update tests so they assert the new order and no longer break on a future reorder.

**Non-Goals:**

- No change to delay DSP, signal routing, or the `mix` crossfade semantics (dub throws stay possible).
- No parameter rename (`delayMix` stays `delayMix`).
- No change to the MOD second row's own contents beyond what the first-row order requires.
- No change to the reverb sub-section.

## Decisions

**Reorder by moving markup, not by CSS.** Move the `mix` `Knob` block to the front of the delay `.effects-row` in source order rather than reordering visually with CSS `order`. Source order is what assistive tech, tab order, and the tests observe; matching visual and DOM order keeps them consistent. Alternative (CSS `order`) rejected — it desyncs DOM order from visual order for no benefit here.

**Re-key the affected tests by label, not index.** Replace the positional `hits[0/1/2]` lookups for the delay row with label-based lookup (find the knob whose label is `mix`/`time`/`feedback`, then act on its hit-target), so the assertions express intent ("the mix knob dispatches delayMix") and survive future reorders. Alternative (just renumber the indices) rejected — it preserves the same brittleness that this change is exposing.

## Risks / Trade-offs

- [Other tests assert delay knob order positionally, e.g. `App.test.js`] → Grep for delay-knob index assertions across the suite during implementation, not just `Effects.test.js`; update any found.
- [Reverb row also uses index-based lookups and could be confused with delay row] → Scope the label lookup within the delay section so reverb knobs (which include their own `mix` label) are never matched; assert against the delay `.effects-row` specifically.
