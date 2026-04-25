## Context

The synthesizer currently has a shimmer reverb stage between the ladder filter and VCA (in progress on `feature/reverb`). A delay effect is placed post-VCA so the amp envelope shapes only the dry signal — delay repeats ring freely after the VCA closes, giving the classic "note stops but echo continues" behaviour. The FAUST standard library provides `de.sdelay` (smooth delay, no clicks on time changes) and `ba.clip`. No third-party dependency is required.

The current signal chain end (as of `develop`) is:
```
filteredSig → vcaOut (filteredSig * ampEnvOut) → process (vcaOut * masterVol <: _, _)
```

With reverb (`feature/reverb`, pre-VCA) and delay (this change, post-VCA):
```
filteredSig → reverb stage → vcaOut → delay stage → vcaOut * masterVol → stereo output
```

## Goals / Non-Goals

**Goals:**
- Implement a feedback delay in `faust/synth.dsp` post-VCA using `de.sdelay`
- Expose four controls: on/off bypass toggle, time (10 ms–1 s), feedback (0–0.9), mix (0–1)
- Make time, feedback, and mix MIDI-learnable; on/off is not
- Provide a `Delay.svelte` panel matching existing panel conventions, mounted after Amp Env

**Non-Goals:**
- Tempo sync or beat-division delay
- Stereo ping-pong delay
- Filter or saturation in the feedback path
- Selectable delay modes (tape, digital, etc.)

## Decisions

### Decision: Use `de.sdelay` for smooth time changes

`de.sdelay(maxLen, interp, len)` interpolates between delay lengths to avoid clicks when the time knob is adjusted during playback. `de.delay` (integer, no interpolation) would produce audible clicks; `de.fdelay` (linear interpolation) is suitable but `de.sdelay` gives smoother crossfades over `interp` samples.

**Alternative considered:** `de.fdelay` — linear interpolation, simpler. Adequate for moderate-speed knob sweeps but produces subtle zipper noise on fast changes. `de.sdelay` is the robust choice for a live-playable instrument.

### Decision: Cap feedback coefficient at 0.9 via `ba.clip(0, 0.9)` in FAUST

Feedback ≥ 1.0 produces infinite (self-oscillating) delay. Unlike the shimmer reverb where runaway can be a feature, uncontrolled delay oscillation is unmusical and potentially loud. Capping the feedback *coefficient* (a scalar 0–0.9) in the DSP provides a hard safety limit independent of UI range clamping and protects against misconfigured MIDI CC mappings that could send out-of-range values. The lower bound is 0, not a negative number, because the feedback gain is not a bipolar audio signal — negative feedback would invert phase on each repeat, which is not a documented feature.

```faust
delayFeedbackSafe = delayFeedback : ba.clip(0, 0.9);
delayWet = +~(de.sdelay(96000, 1024, delayTime * ma.SR) * delayFeedbackSafe);
```

**Alternative considered:** Cap at 1.0 (allow self-oscillation). Rejected — poses a speaker safety risk in live contexts.

### Decision: Feed zeros into the delay buffer when bypassed

FAUST's `select2` evaluates both branches on every sample regardless of the selector. A naïve `select2(int(delayOn), vcaOut, delayStage(vcaOut))` would feed the live VCA signal into the delay buffer even while `delayOn = 0`, so enabling delay for the first time would immediately play back however many seconds of buffered audio — a jarring burst of unexpected sound. The fix is to gate the delay input:

```faust
delayInput = vcaOut * int(delayOn);   // feeds 0 to buffer when bypassed
delayWet   = delayInput : +~(de.sdelay(96000, 1024, delayTime * ma.SR) * delayFeedbackSafe);
delayOut   = vcaOut * (1 - delayMix) + delayWet * delayMix;
process_delay = select2(int(delayOn), vcaOut, delayOut);
```

When `delayOn = 0`, `delayInput = 0`, the buffer stays silent, and `select2` passes `vcaOut` through. When `delayOn = 1`, the buffer starts filling immediately and the first audible repeat arrives one `delayTime` later.

### Decision: Max delay 2 seconds (96 000 samples at 48 kHz)

2 seconds covers all musical delay times from tight slap-back (≈ 60 ms) to long ambient echoes (1 s+). Going longer increases FAUST's static memory allocation for no practical gain at this synth's use cases.

### Decision: Delay placed post-VCA (after amplifier envelope)

Post-VCA placement means the amp envelope shapes only the dry attack/release; delay repeats ring freely after the VCA closes. This is the standard position for a send-style delay and the expected behavior for every delay-on-synth use case.

**Alternative considered:** Pre-VCA (before amplifier, mirroring the reverb's position). The VCA would then gate each delay repeat, producing a rhythmic choppy effect. This is an unusual and restrictive sonic choice; post-VCA is correct for a general-purpose delay.

### Decision: Delay panel mounted below Reverb in the filter-output-grid (column 2, row 2)

The `filter-output-grid` is a 3-column grid (after the reverb change): Filter | Reverb | AmpEnv in row 1. Placing Delay directly below Reverb (column 2, row 2) groups the two time-based effects vertically — an intuitive spatial pairing — without disrupting the Filter or AmpEnv columns. The Modulation+Glide row below may need `grid-column` adjustments to span correctly across the updated row structure.

### Decision: Parameter names follow camelCase convention

`delayOn`, `delayTime`, `delayFeedback`, `delayMix` — consistent with `glideOn`, `reverbMix`, `filterAttack`, etc.

## Risks / Trade-offs

- **Memory allocation** → `de.sdelay` allocates a static delay buffer of `maxLen` samples at WASM compile time. At 96 000 samples × 4 bytes = 384 KB; negligible in a browser context. Mitigation: none required.
- **Delay time off by one** → `de.sdelay` interprets `len` as samples; passing `delayTime * ma.SR` can produce a fractional sample count. Mitigation: FAUST handles fractional lengths internally via interpolation — no action needed.
- **Feedback accumulation with reverb** → Delay repeats already contain the pre-VCA reverb baked in; they do not pass through the reverb a second time. With deep reverb settings and high feedback, the cumulative wash can become dense. Mitigation: document as intentional interaction; no DSP guard needed.
