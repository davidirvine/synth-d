## Context

Three independent one-line correctness bugs discovered during low-frequency LFO testing and VCF stress testing:

1. `formatValue` in `src/audio/math.js` uses `Math.round(val)` for sub-1000 Hz values. Below 10 Hz this collapses all readings to whole integers — 0.1–0.4 Hz all display as "0 Hz" — making the log knob appear frozen.
2. `modWheel` is declared as `$state(0)` in `Modulation.svelte` while `hslider("modWheel", 0, ...)` in `faust/synth.dsp` also defaults to 0. Both are currently in sync at 0, but the intent is to default to 0.5 (center position, physically intuitive for a mod wheel). Neither side has been updated yet.
3. `filterModHz` is computed directly from `modSig`, which contains audio-rate content (OSC 3 waveform and `no.noise`). Feeding unsmoothed audio-rate signal into `ve.moog_vcf`'s cutoff sum can periodically destabilise the filter, causing pops or resonance runaway.

## Goals / Non-Goals

**Goals:**
- Sub-10 Hz knob labels show one decimal place (e.g., "0.1 Hz")
- Mod wheel Svelte state and FAUST DSP agree at 0.5 on power-on
- `filterModHz` is smoothed before entering the cutoff sum, removing audio-rate transients

**Non-Goals:**
- No changes to knob scaling, drag behaviour, or other unit formats
- No change to mod wheel range (0–1) or MIDI CC 1 mapping
- No changes to filter resonance, keyboard tracking, or envelope modulation paths

## Decisions

### Hz decimal threshold at < 10

`formatValue` will branch on `Math.abs(val) < 10`: use `val.toFixed(1)` there, keep `Math.round(val)` for 10–999 Hz, and the existing `kHz` branch above 1000. Threshold at 10 keeps whole-number display for values that read cleanly as integers (e.g., "12 Hz") while fixing the sub-10 regime where a whole number is meaningless.

**Alternative considered:** Always use `toFixed(1)` for all Hz values. Rejected because "1200.0 Hz" is visual noise; users don't need sub-Hz precision at audio rates.

### Mod wheel default 0.5

A mod wheel centered at 0 is at its minimum — no modulation. Convention (hardware synths, MIDI spec) treats center as neutral. Defaulting to 0.5 gives a perceptibly non-zero modulation depth at power-on, which is the intended out-of-box experience. Both the FAUST `hslider` default and the Svelte `$state` initialiser must change together; divergence causes a silent jump on first knob/MIDI interaction.

**Alternative considered:** Keep 0 default, document the sync requirement. Rejected because 0 is the wrong out-of-box default and a future edit would face the same two-site sync hazard.

### One-pole smoother on filterModHz (τ = 5 ms)

`si.smooth(ba.tau2pole(0.005))` is the idiomatic FAUST one-pole smoother. 5 ms is imperceptible at typical LFO rates (0.1–20 Hz) and even at audio rates of OSC 3 as a source; it fully eliminates step discontinuities and high-frequency aliasing on the cutoff input. The smoother adds 1-sample latency on the modulation path — inaudible.

**Alternative considered:** `si.smooth(ba.tau2pole(0.001))` (1 ms). Too aggressive for some fast LFO sweeps; 5 ms is the accepted standard for parameter smoothing in FAUST.

## Risks / Trade-offs

- **[Risk] Mod wheel default change alters power-on sound** → Users loading a saved patch that stored mod wheel = 0 will notice a louder modulation. Mitigation: patch serialisation should persist and restore the mod wheel value, so only truly fresh sessions (no saved state) are affected.
- **[Risk] filterModHz smoother changes filter tracking speed** → At audio-rate OSC 3 source frequencies the smoother attenuates the modulation. Acceptable — audio-rate cutoff FM was not a designed use case and was causing instability.
- **[Risk] Hz precision change affects snapshot tests** → Any test asserting `"0 Hz"` for a 0.x Hz value will fail. Correct the test expectation to `"0.x Hz"`.
