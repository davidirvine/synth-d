## Context

The current reverb stage (`faust/synth.dsp:174-195`) implements a classic dry/wet crossfade:

```faust
reverbWet = de.fdelay(4801, reverbPreDelayS * ma.SR)
          : re.mono_freeverb(reverbDecayS, 0.5, reverbDampS, 0)
          : fi.dcblocker;

reverbOut = delayStage <: (_ * (1 - reverbMixS), reverbWet * reverbMixS) :> _;
process   = select2(int(reverbOn), delayStage, reverbOut) <: _, _;
```

Two problems compound to produce audible low-end loss when reverb engages:

1. **Dry attenuation.** At default `reverbMix = 0.5`, the dry path is multiplied by `1 - reverbMixS = 0.5`, a −6 dB drop. The reverb toggle becomes a loudness/body control as a side effect.
2. **Phase cancellation at low frequencies.** `reverbPreDelay` defaults to 0, so the wet signal is time-aligned with the dry. `re.mono_freeverb`'s parallel comb filters introduce frequency-dependent phase shifts. At low frequencies, the wet signal can be 90–180° out of phase with the dry, partially cancelling when summed. Mids and highs decorrelate naturally and are not affected.

The existing `reverb` capability spec is at `openspec/specs/reverb/spec.md`. The DSP routing requirement, parameter list, and several scenarios encode crossfade semantics that this change invalidates.

Constraints from `CLAUDE.md`:
- Single feature branch `feature/reverb-send-architecture`.
- Each task step gets its own conventional-commit.
- `build: { minify: false }` must remain in `vite.config.js` (FAUST AudioWorklet requires unminified function names).
- Lint/format after every file edit per the table in `CLAUDE.md`.

There are no presets in the project yet, so no migration path is required for saved patches. MIDI CC mappings are runtime user state and are not persisted across sessions in this codebase, so the parameter rename does not require a CC remap migration either — but this should be re-verified against `App.svelte` during implementation.

## Goals / Non-Goals

**Goals:**

- Engaging the reverb does not change the dry tone of the synth at any frequency.
- The reverb toggle/send still produces a clearly audible reverb effect at the default settings.
- The user-facing parameter name (`reverbSend`) accurately reflects what the knob does (controls how much wet is sent into the output sum).
- The fix is implementable in a single feature branch, with each task step independently testable.

**Non-Goals:**

- Replacing `re.mono_freeverb` with a different reverb algorithm.
- Adding stereo width / spread to the reverb (it remains mono, summed equally to L and R via the existing `<: _, _` stereo split).
- Adding a wet-path EQ beyond the high-pass filter on the input.
- Migrating any existing presets (none exist).
- Changing the behaviour of `reverbDamp`, `reverbDecay`, `reverbPreDelay`, or `reverbOn` semantics; only their context (the routing they sit inside) and the `reverbPreDelay` default value change.
- Modifying the `delay` capability or any other effect.

## Decisions

### Decision 1: Send-style routing instead of crossfade

**Old form:**
```
out = dry * (1 - mix) + wet * mix
```

**New form:**
```
out = dry + wet * send
```

**Why:** This decouples the wet contribution from the dry level. Engaging the effect adds; it never subtracts. Matches how hardware effects loops, plugin sends, and most professional reverb plugins work.

**Alternatives considered:**

- **Equal-power crossfade** (`dry * cos(m·π/2) + wet * sin(m·π/2)`): keeps a "mix" semantic but only addresses dry attenuation, not phase cancellation. Mid value is −3 dB on both legs, still a measurable dry drop. Rejected because it solves only half the problem.
- **Keep crossfade, lower default mix to 0.2:** would mask the symptom at the default value but the underlying problem still surfaces as soon as the user turns the knob up. Rejected as a band-aid.

### Decision 2: Rename `reverbMix` → `reverbSend`

The knob no longer controls a mix; it controls how much wet is added on top of dry. Keeping the old name would be a documentation lie and would mislead users about what the knob does.

**Alternatives considered:**

- `reverbAmount`: also reasonable, slightly more colloquial. Rejected because "send" is the established term in audio engineering for "scale of signal sent into a parallel processor."
- `reverbWet`: reads as "wet level," which is technically what it is, but the name doesn't communicate the parallel-routing semantics as clearly.

### Decision 3: 2nd-order high-pass filter at 180 Hz on the send input

Insert `fi.highpass(2, 180)` between the input split and `re.mono_freeverb`:

```
delayStage ─┬─ dry (full bandwidth) ──────────────────────────┐
            └─ predelay → HPF(2,180) → freeverb → dcblocker ──┴─→ out
                         (× send)
```

**Why this filter, this frequency, this order:**

- **High-pass on the send only** (not on dry) preserves the dry low-end fully and only prevents low-frequency content from entering the reverb. This is the standard pro-audio practice for synth and bass tracks.
- **180 Hz** is below the fundamental of most musical low-mids but above the synth's bass range where phase cancellation is most audible. Common values in studio practice are 150–250 Hz; 180 Hz is the centre of that range.
- **2nd-order** (12 dB/octave) gives meaningful attenuation by the time you reach 60–80 Hz without over-steepening the slope and introducing unnecessary phase distortion in the audible band.

**Alternatives considered:**

- **1st-order at the same frequency:** too gentle; sub-bass still reaches the reverb at meaningful levels.
- **4th-order at the same frequency:** unnecessarily steep, introduces more phase distortion just above the corner, and the difference is inaudible vs 2nd-order for this purpose.
- **Lower corner (e.g., 80 Hz):** would let too much low-mid into the reverb and partially defeat the purpose.

### Decision 4: `reverbPreDelay` default 0 → 0.015 s (15 ms)

15 ms places the wet onset just past the masking window for transient dry content but well within "natural early reflection" range. Combined with the HPF on the send, this is overkill against phase cancellation in the new architecture, but it also makes the reverb sound more spatially convincing by default — small wins compound.

**Alternatives considered:**

- **10 ms:** still effective, slightly less perceptual separation between dry and wet.
- **20 ms:** starts to be perceptible as a discrete pre-delay rather than a natural room characteristic; better suited for plate/hall presets.

### Decision 5: `reverbSend` default 0.3

Under the send law, the perceptual range of "tasteful → drenched" maps roughly to 0.15–0.6. 0.3 sits in the "clearly audible, not dominant" zone and matches the existing `delayMix` default (`faust/synth.dsp:65`), which is convenient for muscle-memory consistency. The reverb-on toggle now has unambiguous audible effect at the default.

### Decision 6: Keep `fi.dcblocker` on the wet path

The DC blocker sits after `re.mono_freeverb` and before the send-amount multiply. It removes any DC offset accumulated in the freeverb feedback paths. With the new HPF at 180 Hz on the send input, the wet signal already has aggressively reduced sub-bass, but the DC blocker is independent of the HPF (it operates at a much lower corner and is intended as a safety filter rather than a tone shaper). It is retained.

## Risks / Trade-offs

- **Risk: Existing tests assert on `reverbMix` and crossfade-specific scenarios** → tests are updated as part of this change. The spec delta drives which scenarios change, so test updates and spec updates stay in sync.
- **Risk: MIDI CC learn state held in `midiState` references the old key** → the rename must be applied everywhere the string `'reverbMix'` appears. Search will catch all sites; lint-clean DSP compile and `vitest run` will catch any miss in the JS layer.
- **Risk: The `Mix at one passes wet signal only` scenario is no longer reachable under the send law** → that scenario is removed in the spec delta, not preserved. The new model is "dry is always present; send scales wet on top," which is a different behaviour, not a renamed equivalent.
- **Trade-off: Default `reverbSend = 0.3` is louder than the old `reverbMix = 0.5` was at low/mid frequencies** because the dry is no longer attenuated. Total perceived loudness when the toggle engages will increase. This is the intended improvement (no more body loss), but users moving from one build to the next may hit it as "louder." Not a problem given no presets exist and no users are on the prior build.
- **Trade-off: The HPF at 180 Hz removes some "warmth" from the reverb tail itself** because freeverb won't have low-end to ring on. The trade is intentional — clean dry low-end matters more than a warm reverb tail in this synth voicing.

## Migration Plan

No external migration is required:

- No presets exist; nothing to rewrite.
- MIDI CC mappings are runtime-only (verify during implementation in `App.svelte`); users who happen to have learned `reverbMix` mid-session will need to re-learn after this change ships, but no persisted state is broken.
- The DSP rebuild happens in the normal Vite build step; AudioWorklet hot-reloads automatically when the user reloads.

Rollback: revert the feature branch's PR. Single PR, single commit on `develop` after squash-merge, single revert if needed.

## Open Questions

- Confirm during implementation whether MIDI CC assignments persist across page reloads (e.g., via `localStorage`). If they do, the rename produces stale entries pointing at a missing parameter, and either a one-time migration shim or a graceful "ignore unknown param" path is required. Current read of `Effects.svelte` and recent commit history suggests they do not, but verify before completing the MIDI task step.
- Whether to expose the HPF cutoff as a parameter is intentionally deferred. The simplest, most defensible thing is a fixed corner; if user feedback later requests control, a `reverbHpfHz` parameter can be added in a follow-up change.
