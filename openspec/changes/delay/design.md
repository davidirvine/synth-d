## Context

The synthesizer has a shimmer reverb stage applied after the VCA and master volume (`masterOut`). A tape-delay-modelled effect is placed after master volume but before the reverb stage, so delay repeats feed into the reverb — the classic "delay into reverb" effects chain. The FAUST standard library provides `de.fdelay`, `fi.lowpass`, `ma.tanh`, and `ba.clip`. No third-party dependency is required.

The current signal chain end (as of `develop`) is:

```
filteredSig → vcaOut (filteredSig * ampEnvOut) → masterOut (vcaOut * masterVol) → shimmerOut → process
```

With delay before reverb (this change):

```
filteredSig → vcaOut → masterOut → delay stage → delayStage → reverb stage → stereo output
```

## Goals / Non-Goals

**Goals:**

- Implement a tape-delay-modelled feedback delay in `faust/synth.dsp` after master volume and before the reverb stage using `de.fdelay` with wow/flutter LFO, HF rolloff filter, and soft saturation
- Expose four controls: on/off bypass toggle, time (10 ms–1 s), feedback (0–0.9), mix (0–1)
- Make time, feedback, and mix MIDI-learnable; on/off is not
- Provide a combined `Effects.svelte` panel containing both delay and reverb controls under a single "EFFECTS" label, with delay on top, a divider line, and reverb below

**Non-Goals:**

- Tempo sync or beat-division delay
- Stereo ping-pong delay
- User-adjustable tone or saturation controls (these are fixed tape-character parameters)
- Additional delay modes beyond the tape model

## Decisions

### Decision: Cap feedback coefficient at 0.9 via `ba.clip(0, 0.9)` in FAUST

Feedback ≥ 1.0 produces infinite (self-oscillating) delay. Unlike the shimmer reverb where runaway can be a feature, uncontrolled delay oscillation is unmusical and potentially loud. Capping the feedback _coefficient_ (a scalar 0–0.9) in the DSP provides a hard safety limit independent of UI range clamping and protects against misconfigured MIDI CC mappings that could send out-of-range values. The lower bound is 0, not a negative number, because the feedback gain is not a bipolar audio signal — negative feedback would invert phase on each repeat, which is not a documented feature.

```faust
delayFeedbackSafe = delayFeedback : ba.clip(0, 0.9);
// Tape feedback path: gain cap → HF rolloff → soft saturation
feedbackPath = _ * delayFeedbackSafe : fi.lowpass(1, 6000) : ma.tanh;
```

**Alternative considered:** Cap at 1.0 (allow self-oscillation). Rejected — poses a speaker safety risk in live contexts.

### Decision: Feed zeros into the delay buffer when bypassed

FAUST's `select2` evaluates both branches on every sample regardless of the selector. A naïve `select2(int(delayOn), masterOut, delayStage(masterOut))` would feed the live master output into the delay buffer even while `delayOn = 0`, so enabling delay for the first time would immediately play back however many seconds of buffered audio — a jarring burst of unexpected sound. The fix is to gate the delay input:

```faust
delayInput = masterOut * int(delayOn);   // feeds 0 to buffer when bypassed
delayWet   = delayInput : +~(de.sdelay(maxDelayLen, 1024, delayTime * ma.SR) * delayFeedbackSafe);
delayOut   = masterOut * (1 - delayMix) + delayWet * delayMix;
delayStage = select2(int(delayOn), masterOut, delayOut);
```

When `delayOn = 0`, `delayInput = 0`, the buffer stays silent, and `select2` passes `masterOut` through. When `delayOn = 1`, the buffer starts filling immediately and the first audible repeat arrives one `delayTime` later. `delayStage` then feeds into the reverb stage.

### Decision: Max delay 2 seconds (96 000 samples at 48 kHz)

2 seconds covers all musical delay times from tight slap-back (≈ 60 ms) to long ambient echoes (1 s+). Going longer increases FAUST's static memory allocation for no practical gain at this synth's use cases.

### Decision: Delay placed after master volume and before reverb

Placing delay after `masterVol` (post-VCA, post-master-fader) and before the reverb stage creates the "delay into reverb" chain: each delay repeat feeds into the reverb, giving repeats a full spatial wash. This is the standard serial effects order for lush ambient sounds and is the expected behavior on a synthesizer with both effects. Delay repeats continue to ring freely after the VCA closes because both delay and reverb are downstream of the VCA.

**Alternative considered:** Post-reverb (delay after reverb). This produces shorter, drier repeats with reverb only on the initial signal, a valid but less typical arrangement. Rejected in favour of the more musical "delay → reverb" chain.

### Decision: Combined Effects panel replacing standalone Reverb

Delay and reverb are both time-based effects and will always share panel real estate, so they are merged into a single `Effects.svelte` component under an "EFFECTS" panel label. The delay section sits on top (a `sub-label` "DELAY" above the toggle + knobs row), followed by a `section-divider` line, then a `sub-label` "REVERB" above the reverb toggle + knobs row. This mirrors the "LOUDNESS CONTOUR" sub-label pattern from `AmpEnv.svelte`. The standalone `Reverb.svelte` is removed and `App.svelte` mounts `<Effects>` in its place.

### Decision: Tape delay model using `de.fdelay` + wow/flutter LFO + tone filter + soft saturation

The delay is modelled on a tape delay rather than a clean digital delay. Three characteristics distinguish a tape delay:

1. **Wow and flutter** — tape speed variations cause subtle, slow pitch and time modulation. A low-frequency oscillator (≈ 0.5 Hz, ≈ 0.3% of delay time) modulates the read position via `de.fdelay`, giving each repeat a slightly wavering pitch. The LFO depth is fixed (not user-controllable) and kept subtle enough to be felt rather than heard as overt vibrato.

2. **High-frequency rolloff** — magnetic tape has limited high-frequency response and record/playback head losses. A first-order low-pass filter (`fi.lowpass(1, 6000)`) in the feedback path rolls off each successive repeat, producing the characteristic warm, darkening tail.

3. **Soft saturation** — tape saturates gently under higher signal levels. `ma.tanh` in the feedback path applies transparent soft-clipping that rounds transient edges on loud repeats without hard clipping.

`de.fdelay` (linear interpolation) is used in preference to `de.sdelay` (polynomial) because the mild interpolation artefacts of linear interpolation contribute to the lo-fi character of a tape delay. On a clean digital delay `de.sdelay` is the correct choice; here the slight roughness is desirable.

```faust
maxDelayLen = 96000;                         // 2 s at 48 kHz
wowLfo      = os.osc(0.5) * 0.003;          // ±0.3% wow
tapeTime    = max(1, delayTime * ma.SR + wowLfo * delayTime * ma.SR);
tapeFilter  = fi.lowpass(1, 6000);           // HF rolloff per repeat
tapeSat     = _ : ma.tanh;                   // soft saturation per repeat
feedbackPath = _ * delayFeedbackSafe : tapeFilter : tapeSat;
delayInput  = masterOut * int(delayOn);
delayWet    = delayInput : +~(de.fdelay(maxDelayLen, tapeTime) : feedbackPath);
delayOut    = masterOut * (1 - delayMix) + delayWet * delayMix;
delayStage  = select2(int(delayOn), masterOut, delayOut);
```

**Alternative considered:** A pure digital delay (`de.sdelay`, no tone/saturation). Rejected — characterless and indistinguishable from any other digital effect. Tape character is the primary sonic goal.

### Decision: Parameter names follow camelCase convention

`delayOn`, `delayTime`, `delayFeedback`, `delayMix` — consistent with `glideOn`, `reverbMix`, `filterAttack`, etc.

## Risks / Trade-offs

- **Memory allocation** → `de.fdelay` allocates a static delay buffer of `maxDelayLen` samples at WASM compile time. At 96 000 samples × 4 bytes = 384 KB; negligible in a browser context. Mitigation: none required.
- **Wow LFO modulates read position** → The LFO adds up to ±0.3% of delay time per cycle (≈ ±0.9 ms at 300 ms delay time). This is subtle but audible on long delay times with high feedback. The fixed 0.3% depth is a deliberate tuning choice; if it proves too prominent it can be reduced without any spec or API change.
- **Feedback accumulation with reverb** → Delay repeats pass through the reverb stage. With deep reverb and high feedback, the cumulative wash can become dense. Mitigation: intentional interaction — document as a feature of the "delay into reverb" chain.
