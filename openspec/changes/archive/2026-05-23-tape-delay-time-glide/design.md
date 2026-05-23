## Context

The tape delay stage in `faust/synth.dsp` smooths its modulation parameters (`delayModRate`, `delayModDepth`, `delayModOn` all via `si.smoo`) and the reverb section smooths all four of its params with the comment _"Smooth all reverb params to prevent zipper noise when knobs are adjusted."_ But the base `delayTime` slider value is fed **raw** into `de.fdelay` at `faust/synth.dsp:166`:

```
tapeTime = min(maxDelayLen - 1, max(1, delayTime * ma.SR + wowLfo * delayTime * ma.SR + modLfo));
```

`de.fdelay` interpolates fractional sample offsets cleanly, so the discontinuity is not in the delay line — it is in the **stepped input feeding it**. When the knob value steps, the read pointer teleports to a new position in one block, producing an audible click/snap on the repeats. A real tape echo instead glides: the capstan motor has inertia, so a time change ramps tape speed and Doppler-shifts the buffered repeats into a smooth pitch slide. We want that glide as a feature.

## Goals / Non-Goals

**Goals:**

- A `delayTime` change while playing produces a smooth, continuous tape-style pitch glide on the repeats, with no hard click or read-pointer teleport.
- The glide feels like capstan inertia: bounded pitch-bend depth regardless of jump size, with glide duration scaling to the size of the time change.
- Fixed internal character, matching the reverb-smoothing idiom — no new parameter, UI control, default, MIDI mapping, or knob test.
- DSP-only diff confined to the delay time path; existing patches load and sound identical at steady state.

**Non-Goals:**

- No exposed "glide"/"time-slew" knob (explicitly deferred — fixed character only).
- No change to the wow LFO, `delayMod` LFO, feedback filtering, or saturation behaviour.
- No change to any parameter range, default, or the `delayTime` smoothing of any _other_ control.
- Not modelling tape startup/shutdown ramps, varispeed, or non-linear capstan acceleration curves beyond the eased-corner rounding described below.

## Decisions

### Decision: Rate-limited slew, not a plain one-pole

The instantaneous pitch ratio of a delay line is `1 − d(delayTime)/dt`, so the smoother's _shape_ is literally the pitch contour the listener hears.

- A one-pole (`si.smoo` alone) makes `d/dt` maximal **instantly** then decay exponentially → a sharp pitch lurch at the moment of the knob move, easing back, and an **unbounded** initial bend on a large jump. Cheap, one line, matches the reverb idiom — but synthetic-feeling and unfaithful to tape.
- A **rate limiter** holds `d/dt` to a fixed maximum (`slewStep`), so the bend depth is **constant and bounded** no matter how fast or far the knob moves, and the glide takes longer for bigger jumps. That is exactly capstan-motor inertia.

We choose the rate limiter. The single fixed quantity `slewStep` sets both observable behaviours at once — peak bend depth (`≈ slewStep`) and glide duration (`Δtime / slewStep`) — which is the physically correct coupling.

**Alternative considered — plain `si.smoo`:** rejected as the chosen contour, but reused as a _corner-rounding_ post-stage (below).

### Decision: Round the corners with a light `si.smoo` after the limiter

A pure rate limiter reaches the target and stops abruptly, leaving a derivative discontinuity (the value is continuous, but the slope snaps). Audibly the pitch returns to normal with a hard "corner." Passing the rate-limited signal through a gentle `si.smoo` rounds both the entry and exit of the glide so it eases in and out, without materially changing the bend depth set by `slewStep`. This is why `si.smoo` still appears in the design — as a smoother on the _limited_ signal, not as the primary slew.

### Decision: Implement the limiter as a clamped integrator (recursive `+~`)

FAUST has no built-in rate limiter. The idiom is a one-sample feedback accumulator whose increment toward the target is clamped to `±slewStep`. In FAUST, `f ~ _` feeds the one-sample-delayed **output** back into `f`'s **first** input, so a two-argument `rateLimit(prev, target)` curried with `~ _` becomes a 1-in/1-out slew driven by `target`:

```
slewStep = <tuned constant>;                                  // delay-samples per audio sample
rateLimit(prev, target) = prev + max(-slewStep, min(slewStep, target - prev));
tapeTimeSlewed = (delayTime * ma.SR) : (rateLimit ~ _) : si.smoo;
```

Here `prev` is the fed-back delayed output and `target` is the incoming `delayTime * ma.SR`; the `max(-slewStep, min(slewStep, …))` clamps the per-sample step. Wiring `~` to the wrong input (e.g. feeding back into `target`) would either pass the target straight through (no slew) or diverge, so the routing above is the load-bearing detail.

`slewStep` is expressed in **delay-samples per audio sample** (a dimensionless slope), so the bend depth is sample-rate-independent in pitch terms. To keep the constant and the slewed quantity in the same units, the rate limiter operates in the **sample domain**: it is applied to `delayTime * ma.SR` (delay length in samples), not to the seconds-valued slider. (Equivalently, a seconds-domain limiter would need `slewStep / ma.SR` — slewing the sample-domain value avoids that conversion and the sample-rate-dependent bug it invites.) `wowLfo` and `modLfo` are then summed on the slewed sample value exactly as today, and the existing `min(maxDelayLen-1, max(1, …))` clamp stays downstream so the read offset can never leave `[1, maxDelayLen-1]`.

### Decision: `slewStep` is a listening-tuned constant

`slewStep` is the entire feel of the effect and cannot be derived from first principles — too high collapses back toward a near-instant snap, too low makes the delay feel laggy and unresponsive when you are simply trying to _set_ a time. It will be picked by ear during audio verification, starting from a modest estimate (a small fraction of a sample per sample, giving a gentle musical bend of well under an octave). The value is a named constant in the DSP, documented inline as listening-tuned, in the same spirit as the reverb `si.smoo` choice.

## Risks / Trade-offs

- **`slewStep` mis-tuned (too slow) makes time setting feel sluggish** → start from a modest value and confirm responsiveness during the human audio-verification gate; it is a one-constant adjustment. The `delayTime` slider range is 0.01–2.0 s (`faust/synth.dsp:63`), so at 48 kHz the worst-case jump is ≈ 95 520 samples (0.01 s → 2.0 s). The maximum glide duration is `maxJumpSamples / slewStep` audio samples; the chosen `slewStep` must keep this within a musically acceptable bound (target ≪ a few seconds even for the full-range jump), which gives the verification gate a concrete expectation rather than a purely subjective "feels laggy."
- **`slewStep` too fast reintroduces a near-click** → the eased-corner `si.smoo` and the clamped-integrator structure keep the signal continuous even at higher rates; verify by ear at the extremes of the time range.
- **Interaction with `delayMod` and wow LFOs** → mitigated by applying the slew to the base time and letting both LFOs ride on the slewed value (unchanged summation order), and by keeping the sample clamp downstream so combined modulation can never push the read offset out of range. The existing "tapeTime remains valid at maximum depth and minimum delay time" scenario continues to hold.
- **Steady-state regression** → at rest the slewed value equals the raw value, so held delay times, defaults, and saved patches are bit-for-bit unchanged; only the _transition_ behaviour differs.
- **Minify gotcha (project-wide)** → no new build surface, but the DSP must still compile and the existing `build: { minify: false }` constraint is untouched; re-validate with `faust faust/synth.dsp -o /dev/null`.

## Migration Plan

No data or API migration. Single DSP edit; rollback is reverting the `faust/synth.dsp` change. No parameter or persisted-state schema changes, so no patch migration is required.

## Open Questions

- Final `slewStep` value — deferred to the audio-verification gate by design (listening-tuned).
- Whether the eased-corner `si.smoo` time constant needs adjusting from its default — to be confirmed by ear; default is the expected starting point.
