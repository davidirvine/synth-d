## Why

The tape delay currently has a fixed, subtle wow LFO (0.5 Hz, ±0.3%) that approximates tape flutter. The EHX Memory Man delay is distinguished by a deeper, user-controllable chorus/vibrato LFO that modulates the delay read position — making each repeat pitch-wobble in a musical, organic way. Adding user-controllable modulation rate and depth to the delay unlocks chorus and vibrato textures that are not currently achievable.

## What Changes

- Add three new FAUST parameters: `delayModOn` (toggle, default off), `delayModRate` (LFO rate, 0.1–10 Hz), and `delayModDepth` (LFO amplitude, 0–25 ms expressed in seconds)
- Extend the `tapeTime` calculation in `synth.dsp` to include a second sinusoidal LFO gated by `delayModOn`, summed with the existing wow LFO; all three parameters smoothed to prevent clicks
- Add a dedicated **MOD** row below the existing delay knobs in `Effects.svelte`: a MOD on/off toggle, a **rate** knob, and a **depth** knob
- Register `delayModRate` and `delayModDepth` in the `KNOB_PARAMS` registry in `App.svelte` for MIDI CC learn support (`delayModOn` is a toggle, not registered)

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `delay`: New requirements for user-controllable modulation rate and depth controls on the delay line

## Impact

- `faust/synth.dsp`: One new `nentry` and two new `hslider` params; updated `tapeTime` expression
- `src/components/Effects.svelte`: New MOD row with toggle and two `Knob` components below the existing delay row
- `src/App.svelte`: Two new entries in `KNOB_PARAMS` and `DEFAULTS`; updated `effectsMidiState`
- No new dependencies
- No breaking changes — `delayModOn` defaults to 0, so the delay sounds identical until the user enables the MOD toggle
