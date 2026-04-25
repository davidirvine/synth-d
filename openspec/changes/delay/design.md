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

### Decision: Cap feedback at 0.9 via `ba.clip(-1, 0.9)` in FAUST

Feedback ≥ 1.0 produces infinite (self-oscillating) delay. Unlike the shimmer reverb where runaway can be a feature, uncontrolled delay oscillation is unmusical and potentially loud. Capping at 0.9 in the DSP (not just the UI) provides a hard safety limit independent of UI range clamping.

**Alternative considered:** Cap at 1.0 (allow self-oscillation as a feature). Rejected — no musical use case justifies this for a basic delay, and it poses a clip/speaker risk in live contexts.

### Decision: Max delay 2 seconds (96 000 samples at 48 kHz)

2 seconds covers all musical delay times from tight slap-back (≈ 60 ms) to long ambient echoes (1 s+). Going longer increases FAUST's static memory allocation for no practical gain at this synth's use cases.

### Decision: Delay placed post-VCA (after amplifier envelope)

Post-VCA placement means the amp envelope shapes only the dry attack/release; delay repeats ring freely after the VCA closes. This is the standard position for a send-style delay and the expected behavior for every delay-on-synth use case.

**Alternative considered:** Pre-VCA (before amplifier, mirroring the reverb's position). The VCA would then gate each delay repeat, producing a rhythmic choppy effect. This is an unusual and restrictive sonic choice; post-VCA is correct for a general-purpose delay.

### Decision: Delay panel mounted after Amp Env in App.svelte

Signal flow: filter → reverb → VCA (Amp Env) → delay. The Delay panel appears directly after Amp Env, reflecting this order. No grid restructuring is required — it appends to the existing `filter-output-grid` or sits adjacent in the `panels` flex row.

### Decision: Parameter names follow camelCase convention

`delayOn`, `delayTime`, `delayFeedback`, `delayMix` — consistent with `glideOn`, `reverbMix`, `filterAttack`, etc.

## Risks / Trade-offs

- **Memory allocation** → `de.sdelay` allocates a static delay buffer of `maxLen` samples at WASM compile time. At 96 000 samples × 4 bytes = 384 KB; negligible in a browser context. Mitigation: none required.
- **Delay time off by one** → `de.sdelay` interprets `len` as samples; passing `delayTime * ma.SR` can produce a fractional sample count. Mitigation: FAUST handles fractional lengths internally via interpolation — no action needed.
- **Feedback accumulation with reverb** → With both reverb and delay active, delay repeats pass through the reverb (pre-VCA reverb is baked into each repeat). This is musically valid and expected, but deep reverb + high feedback can produce a dense wash. Mitigation: document as intentional interaction; no DSP guard needed.
