## Why

The osc 2 and osc 3 detune knobs currently span only ±100¢ (±1 semitone), which is far narrower than the original Minimoog Model D's Frequency knobs (±7 semitones, a perfect fifth either way). The narrow range makes it impossible to dial in classic Minimoog moves like a fifth-stack or a third for an instant triad — players have to use the octave `range` stepper plus painstaking ear-tuning to approximate something the hardware does in one knob sweep. Widening the range restores that idiomatic interaction. While we're touching this knob, adding a small interval indicator at the three most musically distinctive intervals (m3, M3, P5) turns the wider sweep into a navigable instrument rather than a slider that's easy to get lost on.

## What Changes

- Widen osc 2 and osc 3 detune knob range from ±100¢ to ±700¢ (±7 semitones).
- Rename the displayed knob label from `detune` to `freq` (parameter IDs and FAUST hslider names are unchanged — UI-only rename).
- Switch the value label format under these knobs from cents to semitones with two decimal places (e.g. `−6.50 st`).
- Change knob drag step to 5¢ default, with Shift-drag for 1¢ fine adjustment.
- Add a new interval indicator UI element between the knob body and the value label, opt-in via a Knob prop. Lights at ±300¢ (m3), ±400¢ (M3), and ±700¢ (P5) within a ±15¢ tolerance window; blank otherwise. Symmetric about zero.
- Osc 3's existing LFO-mode behavior (knob disabled when LFO is active) is preserved unchanged.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `oscillator`: detune knob range widens to ±700¢, knob label renames to `freq`, value-label units switch to semitones, and a new interval indicator appears at m3 / M3 / P5.
- `knob`: gains an opt-in interval-indicator slot between the knob body and the value label, plus Shift-drag fine-mode (if not already present) and an `st` (semitones) value-format path.

## Impact

- **Code**: `src/components/Oscillator.svelte`, `src/components/Knob.svelte`, `src/audio/math.js`, `faust/synth.dsp`.
- **Audio engine**: FAUST formula `pow(2, detune/1200)` is range-agnostic; only `hslider` bounds change. No DSP behavior change at the existing operating range.
- **MIDI**: 7-bit external CC will yield ~11¢/step across the new range (vs ~1.6¢/step before). Accepted; out of scope to re-scale or add snap-on-MIDI.
- **Persistence / migration**: none. The project has no saved presets or persisted knob state, so the wider range applies cleanly without migration.
- **Out of scope**: snap-to-interval / soft detents; lighting all 12 intervals; renaming parameter IDs or FAUST hslider names; MIDI CC re-scaling.
