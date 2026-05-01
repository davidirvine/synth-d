## Why

Engaging the reverb causes audible low-end loss in the dry tone. Two stacking causes: (1) the dry/wet crossfade attenuates the dry path by up to −6 dB at the default `reverbMix=0.5`, and (2) `re.mono_freeverb` introduces frequency-dependent phase shifts that, with `reverbPreDelay` defaulting to 0, partially cancel the dry signal at low frequencies. The reverb toggle is functioning as an unintended tone control, which contradicts the design intent that engaging an effect should add to the signal, not subtract from it.

## What Changes

- **BREAKING** Replace the dry/wet crossfade in the reverb stage with a send-style architecture. The dry path passes through unattenuated; the wet signal is added in parallel scaled by a send amount. Engaging reverb no longer reduces dry level.
- **BREAKING** Rename the `reverbMix` parameter to `reverbSend` across the DSP, `App.svelte` `KNOB_PARAMS`, `midiCcMap.js`, `Effects.svelte` (knob label and event names), and all tests. The UI label changes from `mix` to `send`.
- Add a 2nd-order high-pass filter at ~180 Hz on the reverb send path, before `re.mono_freeverb`, so sub-bass cannot excite the reverb tail or phase-cancel the dry signal.
- Change `reverbPreDelay` default from `0` to `0.015` (15 ms) to temporally decorrelate the wet signal from the dry signal at low frequencies.
- Change the new `reverbSend` default from `0.5` to `0.3`. Under the send law the dry is no longer attenuated, so `0.5` would be drenched; `0.3` matches the `delayMix` default and gives a clearly audible but tasteful default.
- Update existing reverb scenarios that assume crossfade semantics: "Mix at zero passes dry signal only" becomes "Send at zero produces no wet signal"; "Mix at one passes wet signal only" is removed (no longer reachable under send law — dry is always present).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `reverb`: The DSP routing requirement, the parameter name (`reverbMix` → `reverbSend`), the high-pass filter on the send path, the default values for the send amount and pre-delay, and the UI knob label all change. The `reverbDamp`, `reverbDecay`, and `reverbOn` requirements are unchanged in behaviour but the parameter list around them is being renamed.

## Impact

- `faust/synth.dsp` — reverb section (lines 70–75 parameter declarations, lines 174–195 reverb chain and signal-chain routing).
- `src/App.svelte` — three sites contain the literal string `reverbMix`: `KNOB_PARAMS` registry (line 41), `DEFAULTS` (line 129), and the `midiStateFor(...)` call list (line 312). All three are renamed to `reverbSend`.
- `src/audio/midiCcMap.js` — the mapper itself is generic and contains no `reverbMix` literal; however, a load-time translation is added in `MidiCcMap#load()` so persisted `localStorage` CC assignments under the old `reverbMix` key resolve to `reverbSend` in memory without rewriting storage (rollback-safe).
- `src/components/Effects.svelte` — reverb knob label, `onchange` event payloads, `oncontextmenu` payload, `disabled` binding, default value, and any `midiState.reverbMix` references.
- `src/components/Effects.test.js` — reverb mix knob assertions, defaults, and event-name assertions.
- `src/App.test.js` — references to `reverbMix` in the engine wiring; new test for `reverbSend` forwarding mirrors the existing `delayMix` forwarding test.
- New test for the `MidiCcMap` load-time `reverbMix → reverbSend` translation.
- `e2e/` — any Playwright assertion targeting the reverb mix knob label or default.
- `openspec/specs/reverb/spec.md` — requirement text and several scenarios are updated via a delta in this change.
- **Output level change**: under the new send law at default `reverbSend = 0.3`, the output is `1.0·dry + 0.3·wet`. Under the old crossfade at `reverbMix = 0.5` it was `0.5·dry + 0.5·wet`. The dry component alone is +6 dB louder than before. With no presets to migrate, this is acceptable but should be called out in the PR description for users who feed the synth into a DAW or external mixer.
- No external API or dependency changes. No preset migration (no presets exist yet). `vite.config.js` `build: { minify: false }` is unaffected.
