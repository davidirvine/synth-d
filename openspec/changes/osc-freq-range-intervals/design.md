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
- When `true`, the component renders a `<span class="interval-indicator">` between the SVG and the value label (between current lines 211 and 213).
- The interval is computed from the current value via a new helper `detectInterval(cents): "m3" | "M3" | "P5" | null` in `src/audio/math.js`.
- The slot occupies fixed vertical space even when blank, so layout doesn't jump as the user drags through and out of windows.
- The value passed to `detectInterval` is the *cents* value — the same as the underlying parameter — even though the user-facing label shows semitones. This keeps the helper unit-locked and testable.

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

### D6. Value label format: semitones via formatValue path

Add an `"st"` branch to `formatValue(value, unit)` in `src/audio/math.js` that returns `(value / 100).toFixed(2) + " st"`. The freq knobs change from `unit="c"` to `unit="st"`. The underlying value passed to `formatValue` remains in cents — the unit label drives the conversion. This keeps the param-storage representation untouched (still cents in JS, still cents in FAUST).

### D7. Existing scale-prop drift: restore `'fine-center'`

The existing `oscillator` spec describes the detune knob as using a `'fine-center'` scale, but the code currently passes `scale="linear"` — prior drift between spec and code. We resolve the drift by restoring `'fine-center'` so the knob retains generous travel near unison (the original justification: subtle chorus/beating effects). The implementation in this change SHALL pass `scale="fine-center"` to the Knob.

Implications at the wider ±700¢ range:
- The outer portion of the sweep (where m3, M3, and P5 land) is compressed compared to a linear sweep — small drag movements there produce larger value jumps.
- This does NOT impair landing on intervals, because the discrete `step={5}` / `fineStep={1}` grid quantizes the *value* regardless of how visually compressed that region of the sweep is. Each 5¢ (or 1¢ with Shift) tick is a definite click forward.
- The ±15¢ interval window absorbs any residual imprecision: even if a single drag motion overshoots by one or two steps in the compressed region, the indicator still latches.
- The semitone-formatted value label gives an unambiguous numeric readout in that compressed region, complementing the visual feedback.

In short: fine-center gives precision where you want it (near unison) and the step grid + window + numeric label give precision where the scale doesn't (out at the intervals). They compose well.

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
