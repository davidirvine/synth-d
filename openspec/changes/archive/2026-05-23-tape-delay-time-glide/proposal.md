## Why

Adjusting the delay `time` knob while audio is playing produces a non-musical click/snap on the repeats instead of the pitch glide that defines a real tape echo. The cause is that `delayTime` is fed raw into `de.fdelay` at `faust/synth.dsp:166` — unlike the reverb params and the delay _mod_ params, which are all smoothed — so the read pointer teleports to its new position whenever the knob value steps. On a tape unit the capstan motor has inertia: a time change ramps the tape speed, Doppler-shifting the repeats already in the buffer into a smooth pitch slide. That glide is a sought-after musical feature, and leaving the control raw was a first-pass time constraint, not a deliberate design choice.

## What Changes

- Insert a **rate-limited slew** between the `delayTime` slider and `tapeTime` in `faust/synth.dsp`: the slewed time may change by at most a fixed number of delay-samples per audio sample (a tuned `slewStep` constant), then passes through a light `si.smoo` to round the start/end corners.
- This makes a time-knob change Doppler-shift the repeats already circulating in the feedback path into a smooth, bounded **tape pitch glide** instead of snapping. A rate limiter is chosen over a plain one-pole because a fixed slew rate reproduces capstan-motor inertia: the **max pitch-bend depth stays constant** regardless of jump size, while the **glide duration scales** with how far the time moves.
- Fixed internal character — **no new UI control, parameter, MIDI mapping, default, or knob test**. `slewStep` is a listening-tuned DSP constant, in the same spirit as the reverb section's `si.smoo` smoothing.
- The existing wow and mod LFOs ride on the slewed time value; the `min`/`max` sample clamp stays downstream of the slew so the read offset remains valid.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `delay`: The "Tape delay DSP stage" requirement gains a mandate that `delayTime` is rate-limit-slewed before reaching `de.fdelay`, and its "Time change is smooth with no hard clicks" scenario is strengthened from merely _tolerating_ interpolation artefacts to _requiring_ a smooth tape-style pitch glide on the repeats with no teleport/click.

## Impact

- **Code:** `faust/synth.dsp` only — the delay stage's time path (around line 166). DSP-only change; no Svelte components, state, MIDI map, or parameter registry are touched.
- **Build:** Re-validate with `faust faust/synth.dsp -o /dev/null`. No new dependencies.
- **Behaviour:** Sweeping `delayTime` with feedback up now produces a pitch glide on the tail. The `delayMod` LFO path and the wow/flutter character are unchanged. No parameter defaults change, so existing patches load identically.
