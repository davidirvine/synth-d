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

There are no presets in the project yet, so no migration path is required for saved patches. **MIDI CC mappings DO persist** across sessions: `src/audio/midiCcMap.js` writes assignments to `localStorage` under the prefix `midiCc:` and rehydrates them in `MidiCcMap#load()`. Without a migration path, any user who learned a CC to `reverbMix` would reload with a stale entry whose `param` field references a parameter that no longer exists in `KNOB_PARAMS`, and the CC would silently stop working. The rename therefore requires an explicit migration step (Decision 7 below).

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

### Decision 7: Read-side `reverbMix → reverbSend` translation in `MidiCcMap#load()`, no storage rewrite

Because MIDI CC assignments persist via `localStorage`, the parameter rename requires a migration step. Two options:

- **(A) Read-side translation, storage untouched**: in `MidiCcMap#load()`, when a stored entry has `param === 'reverbMix'`, load it into the in-memory maps under `param: 'reverbSend'`. The `localStorage` entry is never rewritten.
- **(B) Migration shim that rewrites storage**: same translation, plus rewrite the `localStorage` key with the new param name on first load.

**(A) is chosen.** Rationale: the change can be reverted by reverting the feature branch's PR. With (A), a user who reverts immediately gets their `reverbMix` CC mapping back without further action — `localStorage` still holds the old key, the reverted code reads it as-is. With (B), reverting would orphan the user's mapping under the new `reverbSend` key, which the reverted code does not recognise.

The cost of (A) is one additional pass through the in-memory map per load, and one stale entry that lingers in `localStorage` indefinitely if the user never re-learns the CC. Both are acceptable. The translation is implemented as a small lookup table (currently a single entry) so future renames can be added without further restructuring.

### Decision 8: Quantify the +6 dB output level change

Under the old crossfade at default `reverbMix = 0.5`, the output is `0.5·dry + 0.5·wet`. Under the new send law at default `reverbSend = 0.3`, the output is `1.0·dry + 0.3·wet`. The dry component alone is +6 dB louder. The summed output is louder by a frequency-dependent amount (full +6 dB at frequencies where the wet contributes little, somewhat less at frequencies where wet is in-phase with dry). Users feeding the synth into a DAW or hardware mixer will notice and may want to drop their input gain. With no presets to migrate, this is acceptable, but it is called out as a **BREAKING** change in the proposal and must appear in the PR description.

## Risks / Trade-offs

- **Risk: Existing tests assert on `reverbMix` and crossfade-specific scenarios** → tests are updated as part of this change. The spec delta drives which scenarios change, so test updates and spec updates stay in sync.
- **Risk: MIDI CC learn state held in `midiState` references the old key** → the rename must be applied everywhere the string `'reverbMix'` appears (verified locations: `App.svelte` lines 41, 129, 312; `Effects.svelte` knob block and `midiState.reverbMix` references). Persisted assignments under the old key are translated read-side in `MidiCcMap#load()` per Decision 7.
- **Risk: The `Mix at one passes wet signal only` scenario is no longer reachable under the send law** → that scenario is removed in the spec delta, not preserved. The new model is "dry is always present; send scales wet on top," which is a different behaviour, not a renamed equivalent.
- **Risk: Sections 1–3 of the task list are not independently testable against the full vitest suite** → renaming the DSP parameter in section 1 without updating `KNOB_PARAMS` (section 2) and the UI (section 3) breaks tests that reference `reverbMix`. Sections 1–3 form a single atomic unit; only section 4 is expected to bring the full suite back to green. This is documented in `tasks.md` and acknowledged here so the implementer is not surprised by failing tests during section 1 or 2.
- **Trade-off: Default `reverbSend = 0.3` produces +6 dB more dry signal than the old `reverbMix = 0.5`** (Decision 8). This is the intended improvement (no more body loss). Not a problem given no presets exist and no users are on the prior build, but called out as a **BREAKING** change in the proposal.
- **Trade-off: The HPF at 180 Hz removes some "warmth" from the reverb tail itself** because freeverb won't have low-end to ring on. The trade is intentional — clean dry low-end matters more than a warm reverb tail in this synth voicing.

## Migration Plan

No external migration is required:

- No presets exist; nothing to rewrite.
- MIDI CC mappings are runtime-only (verify during implementation in `App.svelte`); users who happen to have learned `reverbMix` mid-session will need to re-learn after this change ships, but no persisted state is broken.
- The DSP rebuild happens in the normal Vite build step; AudioWorklet hot-reloads automatically when the user reloads.

Rollback: revert the feature branch's PR. Single PR, single commit on `develop` after squash-merge, single revert if needed.

## Open Questions

- Whether to expose the HPF cutoff as a parameter is intentionally deferred. The simplest, most defensible thing is a fixed corner; if user feedback later requests control, a `reverbHpfHz` parameter can be added in a follow-up change.
- The design file `design/synth-d.pen` may contain a reverb section whose UI labels reference "mix" rather than "send." Updating the design file is intentionally out of scope for this change (the `.pen` file is encrypted and edited via the pencil tool, separately from the codebase), but a follow-up change may bring the design and code labels back into sync.
