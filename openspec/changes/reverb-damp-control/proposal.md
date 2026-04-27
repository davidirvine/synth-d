## Why

The reverb LPF knob has little audible effect: a 1st-order post-filter (-6 dB/oct) applied after the reverb output is too gentle to shape the sound meaningfully, and freeverb's internal `damp` parameter is hardcoded to `0`, producing a permanently bright/metallic tail that the post-filter cannot overcome. Replacing the post-filter with internal freeverb damping gives the user direct control over how quickly high frequencies decay within the reverb tail — the acoustically correct model for how real rooms and plates sound.

## What Changes

- **DSP**: Remove `reverbTone` parameter and the `fi.lowpass` post-filter. Add `reverbDamp` (0–1, default 0.5) mapped directly to freeverb's internal `damp` argument. The `damp=0` hardcode is removed.
- **UI**: Rename the `LPF` knob to `damp`. Change its range from log 1000–16000 Hz to linear 0–1. Remove the unit label and value display (`showValue={false}`). Remove the CSS rule that reserved fixed width for the Hz value string.
- **MIDI registry**: Replace `reverbTone` (1000–16000 Hz) with `reverbDamp` (0–1) in `KNOB_PARAMS` and `midiCcMap.js`. **BREAKING**: existing MIDI CC assignments to `reverbTone` will stop working.

## Capabilities

### New Capabilities

- none

### Modified Capabilities

- `reverb`: The tone/damping control changes from a post-filter (`reverbTone`, Hz) to internal freeverb damping (`reverbDamp`, 0–1). The spec requirement that `damp` is fixed at `0` and that `fi.lowpass` drives the tone control is replaced. UI knob label, range, scale, unit, and value display all change. MIDI registry entry changes from `reverbTone` to `reverbDamp`.

## Impact

- `faust/synth.dsp` — parameter rename, freeverb `damp` arg wired, `fi.lowpass` line removed
- `src/components/Effects.svelte` — knob props updated, CSS rule removed
- `src/App.svelte` — `KNOB_PARAMS` entry updated
- `src/audio/midiCcMap.js` — `reverbTone` replaced with `reverbDamp`
- `src/components/Effects.test.js` — test references to `reverbTone` updated
- `openspec/specs/reverb/spec.md` — requirements updated to reflect new DSP contract and UI spec
