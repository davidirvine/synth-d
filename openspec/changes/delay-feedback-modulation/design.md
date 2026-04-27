## Context

The EHX Memory Man modulates its BBD clock frequency with a sinusoidal LFO, which shifts the pitch of every signal passing through the delay line — both the direct echo and all subsequent repeats. In software, the equivalent is modulating the fractional read-head position of the interpolated delay line (`de.fdelay`), which is already what `wowLfo` does.

The existing implementation:

```faust
wowLfo  = os.osc(0.5) * 0.003;
tapeTime = min(maxDelayLen - 1,
               max(1, delayTime * ma.SR
                    + wowLfo * delayTime * ma.SR));
```

`wowLfo` is proportional to `delayTime` (±0.3% of delay length). The new modulation adds a second LFO with fixed depth in samples (not proportional), giving the user direct control over the pitch deviation in semitones regardless of delay time.

## Goals / Non-Goals

**Goals:**

- User-controllable modulation rate (0.1–10 Hz) and depth (0–25 ms)
- MOD on/off toggle that fully bypasses the LFO contribution to `tapeTime`
- Zero depth by default and MOD off by default — no change to the existing sound when untouched
- Smooth transitions when rate, depth, and the MOD toggle are changed while delay is active
- `tapeTime` remains bounded; no clamp violations even at maximum depth and minimum delay time

**Non-Goals:**

- Modulating the feedback coefficient (the Memory Man modulates delay time, not feedback amount)
- Stereo spread or dual-LFO chorus (mono delay, mono modulation)

## Decisions

### Decision 1: Depth expressed in seconds (0–0.025 s), converted to samples at runtime

Expressing depth in seconds keeps it independent of sample rate and makes it intuitive — "25 ms" is a meaningful number for a musician. Converting to samples in DSP (`delayModDepth * ma.SR`) is straightforward.

**Maximum depth of 25 ms** is chosen because:
- At 300 ms delay, 25 ms = ±8% modulation → audible vibrato on repeats
- 25 ms of pitch modulation at 1 Hz = approx ±3.5 semitones deviation, which is musically extreme but useful for vibrato
- Beyond 25 ms, artefacts from the interpolated fractional delay become dominant

**Alternatives considered:**
- Depth in semitones (requires converting to samples via frequency, non-trivial in FAUST without knowing the base pitch)
- Depth as a fraction of delay time (depth changes when delay time changes — confusing to use)

### Decision 2: Sum the modulation LFO with the existing wow LFO inside `tapeTime`

Both LFOs operate on the same `tapeTime` value, so they compose naturally. The wow LFO remains unchanged; the new modulation LFO is additive.

```faust
delayModRate  = hslider("delayModRate [unit:Hz]", 0.5, 0.1, 10, 0.01);
delayModDepth = hslider("delayModDepth [unit:s]", 0, 0, 0.025, 0.0001);

modLfo    = os.osc(delayModRate) * (delayModDepth * ma.SR);
tapeTime  = min(maxDelayLen - 1,
                max(1, delayTime * ma.SR
                     + wowLfo * delayTime * ma.SR
                     + modLfo));
```

The `max(1, ...)` guard already prevents `tapeTime` from going below 1 sample regardless of LFO phase. The `min(maxDelayLen - 1, ...)` prevents overflow. Both guards cover edge cases at maximum depth and minimum delay time.

**Alternatives considered:**
- Replace the wow LFO with the new modulation LFO — loses the subtle tape character at depth = 0
- Apply modulation only inside the feedback path — not how Memory Man works; the whole read position is modulated

### Decision 3: Smooth `delayModRate` and `delayModDepth` with `si.smoo`

Both parameters SHALL be smoothed before use to prevent clicks and zipper noise when knobs are turned while audio is playing. `si.smoo` (one-pole IIR, same as used on reverb params) is appropriate — the time constant is ~10 ms, fast enough for responsive knob feel.

```faust
delayModRateS  = delayModRate  : si.smoo;
delayModDepthS = delayModDepth : si.smoo;
modLfo = os.osc(delayModRateS) * (delayModDepthS * ma.SR);
```

**Note**: This formula does not yet include the `delayModOnS` gate — that is added in Decision 5, which extends `modLfo` to `os.osc(delayModRateS) * delayModDepthS * ma.SR * delayModOnS`.

**Note**: Smoothing the rate fed to `os.osc` introduces a momentary frequency glide when rate is changed. This is sonically acceptable — it mirrors the organic pitch glide heard when the Memory Man rate knob is turned.

### Decision 4: Modulation controls live on a dedicated second row below the existing delay knobs

The original delay row (`time`, `feedback`, `mix`) is unchanged. A new MOD row is added immediately below it containing: a **MOD** on/off toggle, then the **rate** knob, then the **depth** knob.

```
delay row:  [time]  [feedback]  [mix]
mod row:    [MOD]   [rate]      [depth]
```

This keeps the existing layout stable for users already familiar with it, and makes it visually clear that rate and depth are modulation-specific controls rather than core delay controls.

**Alternatives considered:**
- Append rate and depth to the existing delay row (five knobs) — too crowded; the panel already has four reverb knobs in its row
- Place the MOD toggle in the delay section header (next to the delay on/off toggle) — ambiguous about what it controls

### Decision 5: `delayModOn` as a FAUST `nentry` toggle, smoothed before gating the LFO

A `delayModOn` parameter (nentry, 0/1, default 0) gates the LFO output. Rather than hard-multiplying by an integer, the value is smoothed with `si.smoo` before being applied as a gain on `modLfo`. This prevents a click when toggling at a non-zero LFO phase.

```faust
delayModOn  = nentry("delayModOn", 0, 0, 1, 1);
delayModOnS = delayModOn : si.smoo;
modLfo      = os.osc(delayModRateS) * delayModDepthS * ma.SR * delayModOnS;
```

`delayModOn` is NOT registered in `KNOB_PARAMS` — it is a toggle, not a continuous parameter, consistent with `delayOn` and `reverbOn`. It is managed as `$state` in `Effects.svelte` and resets to 0 on synth reset.

## Risks / Trade-offs

- **`tapeTime` can temporarily go below 1 at extreme settings** → Mitigated by the existing `max(1, ...)` clamp; no change needed.
- **Smoothing `delayModRate` causes a pitch glide on rate changes** → Acceptable and musically appropriate; this is how analog rate knobs sound.
- **Smoothed MOD toggle introduces ~10 ms fade-in/out** → Preferable to a click; inaudible in practice.
- **MIDI CC assignments for two new params may conflict with user-saved mappings** → No conflict; new CC slots are not pre-assigned. Users learn them the same way as all other params.

## Migration Plan

Backward-compatible. `delayModDepth` defaults to 0 — the modulation LFO produces no output at depth = 0, so the delay sounds identical to the pre-change state. No migration steps for users.

The FAUST DSP must be recompiled after the DSP edit.

## Open Questions

None.
