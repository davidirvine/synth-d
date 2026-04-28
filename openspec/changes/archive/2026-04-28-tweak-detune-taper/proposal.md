## Why

The detune knobs on OSC 2 and OSC 3 span ±100 cents with a linear scale, giving equal knob travel to every cent across the full range. In practice the ±10 cent region is used for subtle chorus and beatings effects far more often than the outer range, so the linear mapping wastes most of the precision where players spend most of their time.

## What Changes

- Add a `'fine-center'` scale type to `src/audio/math.js` that applies a quadratic taper symmetric around the knob center, giving more knob travel to values near 0 and compressing the outer range
- Change both detune Knob calls in `src/components/Oscillator.svelte` from `scale="linear"` to `scale="fine-center"`

## Capabilities

### New Capabilities

- `fine-center-scale`: A new bipolar scale type for `math.js` that concentrates precision near the center of a bipolar range using a quadratic curve

### Modified Capabilities

- `oscillator`: The detune knob precision changes — equal travel is no longer given to every cent; the center region (±10 cents) now occupies a larger proportion of the knob sweep

## Impact

- `src/audio/math.js`: New `'fine-center'` branch in `normalizedToValue` and `valueToNormalized`
- `src/components/Oscillator.svelte`: `scale` prop on both detune Knob calls
- `src/audio/math.test.js`: New tests covering the fine-center scale round-trip and value mapping
- No changes to FAUST DSP — the scale affects only the UI knob mapping, not the audio parameter range
