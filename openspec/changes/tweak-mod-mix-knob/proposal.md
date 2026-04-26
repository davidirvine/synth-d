## Why

The modulation mix knob currently shows a numeric value label that adds visual noise without aiding musical use, lacks labeling at the arc endpoints to communicate what the knob is blending between, and highlights the arc from the wrong anchor point — starting from the arc's left endpoint rather than the 12 o'clock position where a centered mix would sit.

## What Changes

- Remove the numeric value label below the modulation mix knob
- Add arc-endpoint labels: "LFO" at the left end (pos=0) and "NOISE" at the right end (pos=1) of the sweep
- Change the arc highlight to span from the current indicator position to 12 o'clock (top center), so the highlighted arc always shows the offset from a neutral center mix

## Capabilities

### New Capabilities

- `mod-mix-knob-labels`: Arc-endpoint text labels ("LFO" / "NOISE") on the modulation mix knob to identify what is being blended at each extreme of the range

### Modified Capabilities

- `modulation`: The modulation mix knob visual behavior changes — value label removed, arc highlight anchor changes from arc start to 12 o'clock

## Impact

- `src/components/Modulation.svelte`: Knob call for `modMix` gains `showValue={false}`, `bipolar={true}`, and `ticks` prop
- No changes to `Knob.svelte` or any audio processing code
- Tests for `Modulation.svelte` may need updates if they assert on value label presence or arc rendering
