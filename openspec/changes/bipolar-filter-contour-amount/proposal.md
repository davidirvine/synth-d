## Why

The filter contour "amount" knob is positive-only (0–10 000 Hz), so the ADSR envelope can only ever raise the cutoff — open the filter. Many subtractive-synth patches want the opposite: an envelope that closes the filter on attack and recovers as it decays. A bipolar amount knob unlocks both directions from one control, matching the existing bipolar-knob idiom already used by the oscillator detune knobs.

## What Changes

- The filter contour amount parameter becomes **bipolar**: range `-10 000 … +10 000 Hz`, default `0`.
  - Positive amount: envelope raises cutoff (unchanged from today).
  - Negative amount: envelope lowers cutoff — closes the filter on attack, recovering toward `sustain × amount` below base, returning to base on release.
  - Zero amount: envelope has no effect (unchanged).
- The amount knob renders as a bipolar knob (centre detent at 0, arc fills from centre outward), using a **linear** taper (not fine-center).
- `filterEnvAmt` is added to `BIPOLAR_PARAMS` so power-off resets it to centre (0), not the new minimum.
- The reserved value-display width in the Filter panel is widened to fit a negative reading (e.g. `-10.0 kHz`).
- DSP math is unchanged — only the `filterEnvAmt` slider's minimum changes; the existing `max(20, min(18000, …))` clamp already protects the negative direction.
- Documented (not fixed): linear MIDI CC mapping cannot land exactly on centre (raw 64 → ~+78 Hz), consistent with the existing detune/modMix bipolar knobs.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `ladder-filter`: the filter contour amount requirement changes from positive-only (0–10 000 Hz) to bipolar (−10 000 … +10 000 Hz); add a scenario for negative amount closing the filter.
- `synth-ui`: the Filter panel's amount knob changes from a positive-only knob to a bipolar knob.

## Impact

- `faust/synth.dsp` — `filterEnvAmt` hslider minimum `0 → -10000` (math unchanged).
- `src/components/Filter.svelte` — amount knob `min={-10000}`, `bipolar={true}`; widen reserved value-display width.
- `src/App.svelte` — `filterEnvAmt` registry min `→ -10000`; add `filterEnvAmt` to `BIPOLAR_PARAMS`.
- Specs: `ladder-filter`, `synth-ui`.
- Existing saved patches remain valid (stored values stay within the wider range); default behaviour at 0 is unchanged.
