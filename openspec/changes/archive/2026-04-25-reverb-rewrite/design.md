## Context

The synth DSP chain runs: oscillators → mixer → ladder filter → VCA → master volume → tape delay → reverb → stereo split. The reverb stage currently uses `re.mono_freeverb` inside a `~` recirculation loop that adds a pitch-shifted (+12 semitone) shimmer to the feedback. The three controls are mix, decay, and shimmer.

The rewrite removes the shimmer feedback loop and replaces it with a linear chain: pre-delay → freeverb → external lowpass (tone) → dc blocker. The four controls become mix, tone, decay, and pre-delay.

On the UI side, reverb controls live in `Effects.svelte` alongside the tape delay section. The Knob component supports `scale="log"` (already used by delay time); the reverb decay and tone knobs will use that scale.

## Goals / Non-Goals

**Goals:**
- Replace shimmer with tone (external lowpass 1kHz–16kHz) and pre-delay (0–100ms)
- Change decay knob to log scale for musical response at short decay times
- Keep all other behaviour identical: reverb is post-delay, wet/dry mix, bypassed when off, tail rings after VCA closes

**Non-Goals:**
- Stereo reverb or algorithmic reverb beyond freeverb
- Tempo-sync for pre-delay
- Any change to the tape delay section

## Decisions

### D1: External lowpass for tone, not freeverb's internal `damp`

Freeverb has a built-in `damp` parameter (0–1) that filters within each comb filter's feedback. Mapping tone to `damp` would be simpler (no extra DSP node) but has two problems: (1) it only damps the recirculating tails, not the early diffusion; (2) the relationship between `damp` value and perceived brightness is non-linear and not predictable. An external `fi.lowpass(1, toneHz)` after the full freeverb output gives a consistent, audible rolloff across the entire wet signal including early reflections, with a directly understandable Hz parameter.

Consequence: freeverb's internal `damp` is fixed at `0` (no internal damping) so the two controls don't fight each other.

### D2: Pre-delay implemented as `de.fdelay` before freeverb input

The pre-delay sits between the tape delay output and the freeverb input. The dry path bypasses the pre-delay entirely so there is no perceived latency on the dry signal. `de.fdelay(4801, reverbPreDelay * ma.SR)` provides fractional-sample interpolation; at 0ms input the output is the current sample with no audible artifact. Max buffer of 4801 samples covers 100ms at 48kHz with one sample of headroom.

Alternative considered: integer `de.delay` — simpler but introduces zipper noise when the pre-delay knob is moved. `de.fdelay` handles this cleanly.

### D3: Smooth all reverb parameters with `si.smoo`

`reverbMix`, `reverbDecay`, and `reverbTone` are all smoothed before use (same pattern as current code). `reverbPreDelay` is also smoothed to prevent clicks when the knob is turned while reverb is active.

### D4: Log scale for decay knob — UI only, DSP param range unchanged

The FAUST `reverbDecay` parameter remains 0–1 (freeverb's `fb1`). The log taper is applied in the Knob component (`scale="log"`, `min=0.01`). This keeps the DSP interface stable and avoids a mapping function in the DSP. Min of 0.01 (not 0) is required for log scale; at 0.01 the tail is inaudibly short.

### D5: Log scale for tone knob

`reverbTone` maps directly to Hz in the FAUST `fi.lowpass` call. The Knob component uses `scale="log"`, `min=1000`, `max=16000`, `default=16000`. At default the filter is above the audible range and introduces no rolloff.

## Risks / Trade-offs

- **Pre-delay at 0ms**: `de.fdelay(4801, 0)` returns the current sample. This is correct behaviour but worth verifying in FAUST — if the minimum delay is 1 sample, the result is a 1-sample latency on the wet path only, which is inaudible. → No mitigation required; test by listening.
- **Removing shimmer**: Any preset or saved state that uses `reverbShimmer > 0` will silently map to the new `reverbTone` parameter. There are no saved presets in the current codebase, so this is not a migration concern.
- **freeverb damp=0**: With no internal damping and tone at 16kHz default, the reverb will be brighter than before at equivalent decay settings. This is intentional — users control brightness via the tone knob.
