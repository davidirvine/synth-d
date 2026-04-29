## Context

The reverb DSP stage uses `re.mono_freeverb` with `damp=0` (hardcoded) followed by `fi.lowpass(1, reverbToneS)` as a post-filter tone control. The post-filter is a 1st-order Butterworth (-6 dB/oct) applied to the output of the reverb; because freeverb's comb filters are running without internal damping, the reverb tail is uniformly bright and a gentle post-filter has minimal perceptual impact.

The correct acoustic model is to damp high frequencies *inside* the feedback loops — exactly what freeverb's `damp` parameter does. Each comb filter applies a 1-pole LP in its feedback path, causing highs to decay exponentially faster than lows. This matches how real rooms, plates, and springs behave, and gives the user a control that meaningfully changes the character of the tail rather than just trimming output level above a cutoff.

## Goals / Non-Goals

**Goals:**

- Wire `reverbDamp` (0–1) to freeverb's internal `damp` argument so the character of the reverb tail is user-controlled.
- Remove `fi.lowpass` post-filter and the `reverbTone` parameter entirely.
- Replace the `LPF` knob with a `damp` knob (linear 0–1, no value label) in `Effects.svelte`.
- Update MIDI registry and tests consistently.

**Non-Goals:**

- No new reverb algorithms (freeverb stays).
- No additional reverb parameters (shimmer, room size, etc.) — scope is the single replacement of `reverbTone` with `reverbDamp`.
- No changes to pre-delay, mix, or decay controls.
- No MIDI migration path for existing `reverbTone` CC assignments (breaking change is acceptable for this project scale).

## Decisions

### Decision: Map `reverbDamp` directly to freeverb `damp`, remove post-filter entirely

**Chosen**: Delete `reverbTone`/`reverbToneS` and `fi.lowpass(1, reverbToneS)`. Add `reverbDamp = hslider("reverbDamp", 0.5, 0, 1, 0.001)` smoothed with `si.smoo`. Pass it as the 3rd arg to `re.mono_freeverb`.

**Alternative considered**: Keep `fi.lowpass` as a secondary stage with a higher filter order (2nd or 3rd order). Rejected: this would partially fix the audibility problem but not address the fundamental issue that freeverb runs undamped. Two controls on the same sonic property with different feels would also confuse users.

**Alternative considered**: Keep `reverbTone` as Hz and convert to `damp` in the DSP via `damp = 1 - (reverbTone - 1000) / 15000`. Rejected: the Hz unit becomes meaningless once mapped internally; the knob label "LPF" and the Hz readout would mislead the user about what the control does. A clean parameter rename is clearer.

### Decision: Linear scale for `reverbDamp` knob

**Chosen**: `scale="linear"`, min=0, max=1, default=0.5.

**Alternative considered**: Log or inverse-log scale to give finer control in the "mostly bright" range. Rejected: freeverb's internal comb structure already provides a roughly perceptually even response across the 0–1 range; a linear knob maps well to perceived brightness gradient.

### Decision: Default `reverbDamp` = 0.5

**Chosen**: 0.5 produces a naturally warm room feel — highs decay noticeably faster than lows, but the tail is not oppressively dark. This is a better out-of-box sound than the previous `damp=0` (metallic) default.

### Decision: Remove value label from DAMP knob (`showValue={false}`)

**Chosen**: A raw 0–1 value provides no useful information to the user. The knob arc position communicates position sufficiently. This matches the treatment of other dimensionless controls in the UI (e.g. the modulation mix knob).

### Decision: Remove CSS fixed-width rule for knob value

The `.reverb-row :global(:nth-child(2) .knob-value)` rule in `Effects.svelte` existed solely to prevent layout shift when the Hz string length changed between e.g. `"1.0 kHz"` and `"16.0 kHz"`. With `showValue={false}` the value element is invisible and no longer causes layout shift; the rule is dead and should be removed.

## Risks / Trade-offs

- **BREAKING: MIDI CC assignments to `reverbTone` stop working.** → Acceptable at this project scale; no migration required.
- **Default `damp=0.5` changes the out-of-box reverb sound.** → Intentional improvement; darker default is more musical than the previous metallic `damp=0`.
- **`damp` range near 1.0 may produce very dark, almost LPF-like reverb.** → This is correct behaviour; extreme CW position gives a warm, padded-room character. Users can back off if they want brightness.

## Migration Plan

No data migration required. This is a DSP parameter rename with UI update. The FAUST compile step (`openspec apply` → step 1.x) regenerates the WASM binary; any browser tab serving the old binary simply needs a reload.

## Open Questions

- None — scope is well-defined and self-contained.
