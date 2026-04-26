## Context

`Oscillator.svelte` already disables the rate knob in audio mode (`disabled={osc3LfoMode === 0}`). The inverse — disabling range and detune when LFO mode is on — is missing. The DSP (`synth.dsp`) uses `select2(int(osc3LfoMode), osc3AudioFreq, osc3LfoRate)`, so `osc3AudioFreq` (which depends on range and detune) is unconditionally ignored in LFO mode.

## Goals / Non-Goals

**Goals:**
- Disable OSC 3 range step buttons when `osc3LfoMode === 1`
- Disable OSC 3 detune knob when `osc3LfoMode === 1`

**Non-Goals:**
- Resetting range or detune values when LFO mode is toggled (values are preserved, as the rate knob already does)
- Any DSP changes
- Disabling the waveform selector (the waveform does still influence the LFO shape)

## Decisions

### Disable, not hide

**Decision:** Disable the controls (greyed-out, non-interactive) rather than hiding them.

**Rationale:** Hiding would shift the layout and cause controls to jump around when the LFO button is toggled. The rate knob uses `disabled` prop for the same reason. Consistent with existing pattern.

### Waveform selector stays enabled

**Decision:** The six waveform buttons are not disabled in LFO mode.

**Rationale:** The waveform shapes the LFO signal — a square LFO produces hard-switching mod, a triangle produces a smooth ramp, etc. The waveform selector is meaningful in both modes.

### Step buttons use `disabled` HTML attribute

**Decision:** Add `disabled={osc3LfoMode === 1}` to the two range step `<button>` elements.

**Rationale:** The `Knob` component already accepts a `disabled` prop; step buttons are plain `<button>` elements and use the standard HTML `disabled` attribute. No new abstractions needed.

## Risks / Trade-offs

- **Minimal risk** — this is a one-component UI change with no logic or DSP impact. The only risk is a visual regression in the oscillator panel layout, which is easy to verify manually.

## Open Questions

None.
