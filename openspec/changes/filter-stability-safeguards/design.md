## Context

The synthesizer's ladder filter (`ve.moog_vcf`) is a 4-pole nonlinear feedback filter. Its internal stability depends on cutoff-frequency coefficients computed each DSP frame. When `cutoffMod` — the sum of base cutoff, key tracking, filter envelope, and modulation contributions — changes discontinuously between frames, the feedback state within the VCF can temporarily produce gain > 1, especially at resonance values approaching the 0.97 cap. This causes NaN to propagate through the signal chain, silencing the audio worklet.

The crash reproduces reliably with:
- `filterEnvAmt` at 5000–10000 Hz, `filterAttack` at minimum (1 ms), resonance above 0.5
- OR a MIDI CC sweep on `filterEnvAmt` while a note is held

Currently, only the modulation path (`filterModHz`) has a 5 ms smoother. The envelope contribution, base cutoff, and key tracking are all applied without any rate-of-change limiting to the final `cutoffMod` value.

The JS `setParam` function passes all values directly to the FAUST node without validation.

## Goals / Non-Goals

**Goals:**

- Prevent audible zipper noise by limiting the rate of change of discontinuous cutoff parameter jumps
- Catch any downstream NaN/Inf at the filter output before it reaches the VCA or effects chain
- Block non-finite values at the `setParam` boundary regardless of origin

**Non-Goals:**

- Changing the audible character of filter envelope sweeps at normal settings
- Adding value-range clamping in JS (the FAUST DSP already clamps via `max`/`min`; the Knob component clamps `externalValue`; `midiCcMap.scale` bounds-checks at assignment time)
- Protecting other parameters from instability (the filter is the only feedback-heavy path)

## Decisions

### Decision 1a: Switch from `ve.moog_vcf` to `ve.moog_vcf_2bn`

`ve.moog_vcf` (Julius O. Smith 1982 first-order approximation) uses a stage pole of `1 - 2πf/SR`. When `f > SR/π` the pole leaves `[-1, 1]` and the filter diverges unconditionally, producing Inf → NaN. The hard stability limits are:
- 48 kHz → ~15 278 Hz
- 44.1 kHz → ~14 036 Hz
- 32 kHz → ~10 186 Hz (some mobile browsers)

There is no safe static frequency ceiling that prevents crashes across all browser sample rates. Browser verification confirmed the crash with `filterEnvAmt = 10 000 Hz` after both the original 20 000 Hz ceiling and a revised 18 000 Hz ceiling — the 18 000 Hz ceiling is still above the 48 kHz stability limit.

`ve.moog_vcf_2bn` (bilinear-transform implementation using protected normalized-ladder biquads) is unconditionally stable for any `f < SR/2` (Nyquist) and any `res < 1`. The crash cannot occur regardless of cutoff frequency or sample rate.

**Resonance parameter equivalence:** per the FAUST docs, `moog_vcf(r, f) ≡ moog_vcf_2b(r⁴, f)` as SR → ∞. With the same resonance value (Option Y), `moog_vcf_2bn(0.7)` sounds equivalent to `moog_vcf(0.7^(1/4) ≈ 0.915)` — strong resonance, no self-oscillation.

### Decision 1b: Lower `resonanceSafe` ceiling from 0.97 to 0.7

With `ve.moog_vcf_2bn`, the same resonance knob value produces more pronounced resonance than the old `ve.moog_vcf` (bilinear transform is more accurate). Keeping the 0.97 ceiling would cause strong self-oscillation at maximum resonance. Lowering to 0.7 gives a maximum character equivalent to the old filter at ~0.915 — clearly resonant, sweepable, no self-oscillation.

### Decision 1c: Keep `cutoffMod` ceiling at 18 000 Hz

`ve.moog_vcf_2bn` is stable to Nyquist so the ceiling is no longer required for crash prevention. It is retained as an audible-range bound. At SR ≥ 44.1 kHz (the minimum for modern desktop browsers) the ceiling sits well below Nyquist (22.05 kHz). At SR = 32 kHz (some mobile browsers, where Nyquist = 16 kHz), 18 kHz exceeds Nyquist and the bilinear warp `g = tan(πf/SR)` approaches extreme values near Nyquist. If 32 kHz support becomes a requirement, the ceiling should be lowered to 15 000 Hz. This change targets SR ≥ 44.1 kHz environments.

### Decision 1d: Smooth `cutoffMod` after the clamp, not before

Smoothing is applied to the fully-summed, clamped `cutoffMod` value rather than to individual contributions (envelope, cutoff knob, key tracking). This ensures a single slew-rate limit covers all sources simultaneously with no duplication.

**Alternatives considered:**
- Smooth each input separately — more code, doesn't protect against interaction between inputs (e.g., both cutoff and envelope changing at the same frame)
- Smooth only the envelope contribution — leaves rapid cutoff-knob changes (e.g. from MIDI CC) unprotected

**Time constant: 2 ms** (`ba.tau2pole(0.002)`). At typical audio rates (48 kHz) this is ~96 samples of slew. Audible effect on envelope attacks: a 2 ms onset delay, which is below the threshold of perception for filter sweeps. The existing modulation smoother uses 5 ms; 2 ms is chosen here because the envelope path needs to feel responsive and the cutoff rarely jumps the full 20 kHz range at once.

### Decision 2: `ma.tanh` on filter output, not a hard clip

`ma.tanh` is already used on the mixer output (before the filter) and on the master output. Applying it after `ve.moog_vcf_2bn` is consistent with the existing saturation strategy and acts as an intentional soft-saturation stage for sonic character — not a stability fallback. `ve.moog_vcf_2bn` is unconditionally stable so no instability escapes the filter; the `tanh` here shapes the timbre in the same way as the pre-filter and master stages.

**Alternatives considered:**
- Hard clip (min/max) — would introduce harsh distortion if triggered; tanh is softer and sonically less objectionable
- No output safeguard — relies entirely on the smoother, leaving no fallback

### Decision 3: `Number.isFinite` guard in `setParam`, not a full param schema

A single `isFinite` check is the minimal effective guard. It blocks NaN and ±Infinity from any source without adding maintenance burden of a param schema (which would duplicate the KNOB_PARAMS registry already in App.svelte).

**Alternatives considered:**
- Clamp to param-specific min/max in `setParam` — would require duplicating the KNOB_PARAMS table in engine.js; out of scope since in-range values already have multi-layer protection
- NaN watchdog polling the analyser — a recovery mechanism, not prevention; adds complexity and latency

## Risks / Trade-offs

- **2 ms smoother delays fast filter attacks** → Acceptable: 2 ms is sub-perceptual for envelope-based sweeps. A user setting attack to 1 ms likely intends a percussive click, not a literal 1 ms filter open — the envelope on the VCA is what creates that click.
- **`tanh` adds negligible CPU cost** → No mitigation needed; `ma.tanh` is a lookup-table operation in FAUST.
- **`isFinite` check silently drops bad values** → Values from legitimate sources (Knob, midiCcMap) are always finite; the guard only fires on corrupt data, so silent discard is correct behaviour.

## Migration Plan

All three changes are backward-compatible edits to existing files. No data migration is required. Deployment is a standard build and release.

The FAUST DSP must be recompiled (`npm run faust:build`) to pick up the DSP changes before the JS change is meaningful. The build step is part of the standard task sequence.

## Open Questions

None.
