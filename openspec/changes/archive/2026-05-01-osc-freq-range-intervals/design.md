## Context

The osc 2 / osc 3 detune knobs are currently bipolar ±100¢ knobs with linear scale, displaying the value in cents. The FAUST DSP graph applies the detune as `pow(2, detuneCents / 1200)` — already range-agnostic. Widening to ±700¢ is therefore mostly a UI change with one slider-bound change in `synth.dsp`. The interesting design surface is the new interval indicator: where it lives, how it latches, and how it composes with the existing Knob component.

## Goals / Non-Goals

**Goals:**
- Match Minimoog Model D Frequency-knob range (±7 semitones) on osc 2 and osc 3.
- Surface the three most musically distinctive intervals (m3, M3, P5) as a passive on-knob signal — symmetric about zero, ±15¢ window.
- Switch label units to semitones (2 dp) so the displayed number maps directly to the interval the player is hearing.
- Rename the knob's UI label to `freq` to align with the Minimoog vocabulary now that the range is wide enough to be a frequency-offset rather than a chorus-detune.
- Keep the `Knob` interval-indicator capability generic and opt-in so other knobs are unaffected.

**Non-Goals:**
- Snap-to-interval / soft detents on the knob.
- Highlighting all 12 chromatic intervals.
- Renaming parameter IDs (`osc2Detune`, `osc3Detune`) or FAUST hslider names — pure UI rename only.
- MIDI CC re-scaling, snap-on-MIDI, or 14-bit CC support.
- Backwards-compatibility shims for persisted state (project has none).

## Decisions

### D1. Range widening implemented at the slider, not at a new transform

The FAUST formula `pow(2, detune / 1200)` already accepts any cent value — we simply widen the `hslider` bounds in `faust/synth.dsp` from `(0, -100, 100, 0.1)` to `(0, -700, 700, 1)` for both `osc2Detune` and `osc3Detune`, and widen `min`/`max` on the Svelte `Knob` to match. Default stays 0. Step changes from 0.1 to 1 in FAUST so MIDI/automation paths can land on integer cents (which matters for hitting interval centers cleanly via DAW automation later); knob-level drag step is layered on top in JS, see D5.

**Alternative considered:** introduce a new `osc2Freq` parameter expressed in semitones and convert in JS. Rejected — duplicates state, breaks existing MIDI mappings users may rely on, no upside.

### D2. Knob label rename is presentation-only

Only the `label` prop value passed to `<Knob>` in `Oscillator.svelte` changes from `"detune"` to `"freq"`. The Svelte parameter IDs (`osc2Detune`, `osc3Detune`), the FAUST hslider names, and the MIDI mapping keys all stay. This avoids cascading rename work and keeps any in-flight branches mergeable.

### D3. Interval indicator is a generic Knob feature, opt-in via prop

Add an `intervalIndicator` capability to `Knob.svelte` rather than a one-off in `Oscillator.svelte`. The freq knobs pass `intervalIndicator={true}`; everywhere else, the slot is absent and layout is unchanged.

Approach:
- `Knob.svelte` exposes a new prop, e.g. `intervalIndicator: boolean` (default `false`).
- When `true`, the component renders a `<span class="interval-indicator">` between the closing `</svg>` of the knob body and the existing `<span class="knob-value">` element.
- The interval is computed from the current value via a new helper `detectInterval(cents): "m3" | "M3" | "P5" | null` in `src/audio/math.js`.
- The slot occupies fixed vertical space even when blank, so layout doesn't jump as the user drags through and out of windows.
- The value passed to `detectInterval` is the *cents* value — the same as the underlying parameter — even though the user-facing label shows semitones. This keeps the helper unit-locked and testable.

**Visual treatment:** the indicator SHALL match the existing `.knob-value` span typography (font family, weight, and base size) so the row reads as a single label/value column. Color and opacity are at implementer discretion within that constraint; the indicator may be rendered slightly dimmer or in a muted accent than the numeric value to avoid competing with it. The slot uses `min-height: 1em` (or equivalent) with a non-breaking-space fallback for the blank state.

**Double-click reset interaction:** the existing `ondblclick` resets the knob to `defaultValue` (0 for the freq knobs). Because 0¢ is outside every interval window, the indicator slot goes blank as part of the reset — no special handling is needed; this is the same path as "value transitioned out of a window."

**Accessibility:** the interval indicator is a passive visual signal and reinforces information already present in the numeric `knob-value` label and the audible pitch. The underlying `Knob` is not currently keyboard-operable in this codebase (pointer-only), so adding ARIA on the indicator alone would not be useful in isolation; broader keyboard/ARIA support for `Knob` is out of scope for this change and is tracked separately.

**Alternative considered:** put the indicator in `Oscillator.svelte`, outside the Knob. Rejected — it would float independently of the knob's layout, introduce duplication if any other knob ever wants the same feature, and complicates double-click reset feedback.

### D4. Interval detection: ±15¢ window, exact cent thresholds, symmetric

```
input cents (c)             output
────────────────────────────────────────
|c| ∈ [285, 315]            "m3"     (target ±300 ± 15)
|c| ∈ [385, 415]            "M3"     (target ±400 ± 15)
|c| ∈ [685, 700]            "P5"     (target ±700 ± 15)   ← clipped at range edge
otherwise                   null
```

Two notes on edge behavior:
- **P5 edge clip**: the upper window for P5 (715¢) lies outside the ±700¢ slider range, so in practice the window for P5 is `[685, 700]`. This means the indicator latches as the player approaches max travel and stays lit at the very end. Acceptable — the alternative (centering the window inside the range, e.g. P5 at ±685¢) sacrifices the clean cent value.
- **No overlap risk**: m2 (100¢), M2 (200¢), P4 (500¢), TT (600¢), m6 (800¢) are all outside the windows for our three target intervals (nearest gap: m3 at 285¢ vs M2 at 200¢ — 85¢ apart). Safe.

### D5. Drag step: 5¢ default, Shift = 1¢

Add discrete-step quantization to `Knob.svelte`:
- New `step` prop (default: `null`, meaning continuous as today).
- New `fineStep` prop (default: `null`, meaning use `step` when Shift held).
- When dragging, the computed value is rounded to the nearest multiple of the active step (`step` normally, `fineStep` while Shift is held).
- The freq knobs set `step={5}` and `fineStep={1}`. All other knobs unaffected.

The existing **Shift-fine sensitivity reduction** (10× per the existing `Knob` spec) is independent and continues to apply — it changes pixels-per-cent, not the step grid. With Shift held, the user gets *both* finer pixel sensitivity *and* a finer (1¢) step, so landing inside the ±15¢ interval window is comfortable.

**Scope of quantization — drag only:** the `Knob` component currently accepts user input only through pointer drag and double-click reset (no `wheel`, no `keydown`, no MIDI-internal handler beyond the parameter pipeline). Step quantization therefore applies to drag — the only quantizable input path. MIDI CC values arriving through `externalValue` already land on integer cent values (the FAUST hslider step is 1 — see D1) and are not re-quantized inside the knob; the spring animates between those integer-cent targets. Double-click reset assigns `defaultValue` directly and bypasses quantization — for the freq knobs, `defaultValue=0`, which is already on every step grid.

### D6. Value label format: semitones via formatValue path

Add an `"st"` branch to `formatValue(value, unit)` in `src/audio/math.js` that returns `(value / 100).toFixed(2) + " st"`. The freq knobs change from `unit="c"` to `unit="st"`. The underlying value passed to `formatValue` remains in cents — the unit label drives the conversion. This keeps the param-storage representation untouched (still cents in JS, still cents in FAUST).

Note on existing state: `formatValue` does not currently have an explicit `"c"` branch — `unit="c"` falls through to the default `toFixed(2)` path, producing a bare number with no unit suffix. That happened to look acceptable for cents, but it was implicit, not designed. Switching the freq knobs to `unit="st"` (which has its own explicit branch) sidesteps the fallthrough. No change to other call sites is required as part of this work.

### D7. Implement `'fine-center'` scale, but use linear on the freq knobs

The `fine-center-scale` capability spec already exists in main specs (`openspec/specs/fine-center-scale/spec.md`) and defines a quadratic taper symmetric around the midpoint:

- Forward: `value = center + sign(t) × t² × range` where `t = (pos − 0.5) × 2`
- Inverse: `normT = sign(v − center) × sqrt(|v − center| / range)`, then `pos = normT / 2 + 0.5`

That spec was approved as part of an earlier change (`tweak-detune-taper`) but the implementation in `src/audio/math.js` was never landed — `normalizedToValue` and `valueToNormalized` only branched on `'log'` and `'log-reverse'`, and `'fine-center'` fell through to linear.

This change still resolves that drift by **adding the `'fine-center'` branch to `normalizedToValue` and `valueToNormalized` per the existing `fine-center-scale` spec**. The implementation now matches the spec; the `'fine-center'` scale is available to any caller.

**Decision (revised during visual verification): the freq knobs use linear scale, not fine-center.**

The original plan was to wire `scale="fine-center"` into the freq knobs so the center region (subtle chorus/beating territory) occupied a larger proportion of the sweep. In hands-on testing at the wider ±700¢ range, the t² curve concentrated so much travel near zero that the knob felt sticky around unison — small drags barely moved the value out of the low-cent region. The risk noted in *Risks / Trade-offs* below ("compresses the outer portion of the sweep where m3 / M3 / P5 live") manifested in the *opposite* direction: not as twitchiness at the outside, but as stickiness near the inside.

Switching to linear restores proportional travel across the full range. Precision near unison is still available — just from the discrete step grid (5¢ default, 1¢ with Shift) and the numeric semitone readout — rather than from scale curvature. Hitting the m3 / M3 / P5 windows is comfortable because each pixel of drag advances the value by a fixed cent amount.

The fine-center implementation in `math.js` stays in place. Future callers (or a future revisit of this knob with a less aggressive curve) can opt in.

## Risks / Trade-offs

- **[Risk]** Restoring `fine-center` (D7) compresses the outer portion of the sweep where m3 / M3 / P5 live, so dragging there feels twitchier than the inner region. → **Mitigation**: the `step={5}` / `fineStep={1}` grid and the ±15¢ indicator window were chosen specifically to make landing on intervals robust regardless of scale curvature; the semitone numeric readout is the final fallback. Verify in section 6 visual/audio checks that hitting M3 (+400¢) and P5 (+700¢) feels comfortable in practice; if it doesn't, the next iteration would be to revisit the scale curve in a follow-up change rather than block this one.
- **[Risk]** The `step` / `fineStep` quantization may interact unexpectedly with the existing spring animation on `externalValue`. → **Mitigation**: tasks include a smoke test where a MIDI CC drives the freq knob through several values and the spring lands on quantized targets without visible jitter. Quantization should apply on the *logical* value path, not the spring's animated position.
- **[Risk]** Renaming the visible label `detune` → `freq` breaks user muscle memory for anyone who's been using the synth. → **Mitigation**: the render is uppercase short-form (`FREQ`) and the wider sweep makes the new behavior obvious within seconds of dragging. Acceptable.
- **[Risk]** MIDI CC at 7-bit gives ~11¢ per step, which can land outside the ±15¢ window only if it lands exactly between two adjacent CC values for a single target. → **Mitigation**: 11¢ < 15¢, so every CC step is *guaranteed* to fall inside at least one target window when sweeping near m3/M3/P5. No mitigation needed; just verifying the math here.
- **[Trade-off]** The P5 indicator window is asymmetric (clipped at +700) rather than centered. We chose clean cent targets over a centered window. The indicator latches earlier on the way in and stays lit at the end of travel. Consistent with how the Minimoog feels at full Frequency-knob travel.

## Migration Plan

None required. No persisted state, no saved presets, no public API surface. Code-level changes go in on the feature branch and are visible after rebuild.

## Open Questions

None remaining — all decisions locked with the human during exploration.
