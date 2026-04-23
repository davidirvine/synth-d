## Why

The synth currently accepts input only from QWERTY keyboard and pointer clicks, which limits it to computer-only performance. Adding Web MIDI API support lets musicians drive the synth from any connected MIDI controller (keyboard, pad, DAW), enabling expressive, low-latency hardware control — including real-time knob automation via MIDI CC messages.

## What Changes

- Add a `MidiManager` service module that opens Web MIDI access, enumerates inputs, and forwards note-on / note-off / pitchbend / CC messages to the engine
- Add a MIDI status indicator to the synth UI showing connection state (unavailable / connected / active)
- Add MIDI input device selector (dropdown) when multiple inputs are detected
- Wire MIDI note-on / note-off into the existing `triggerNote` / `releaseNote` path in `Keyboard.svelte` so MIDI and QWERTY inputs share the same `activeKeys` set and `onnote` callback
- Handle MIDI pitchbend (map to oscillator frequency offset)
- Add MIDI CC learn mode: right-click any knob to enter learn mode, then move a hardware CC to bind it; the binding is persisted to `localStorage`
- Forward incoming CC messages to the matching knob's `onchange` callback, keeping the visual knob in sync with hardware

## Capabilities

### New Capabilities

- `midi`: Manages Web MIDI access, device enumeration, device selection, and translation of MIDI messages (note-on, note-off, pitchbend, CC) into synth engine parameters; owns the CC-to-parameter mapping and learn mode state
- `midi-cc-map`: Stores and persists the user-defined mapping between MIDI CC numbers and synth knob parameters; supports learn mode assignment and reset

### Modified Capabilities

- `keyboard`: Existing note-triggering logic must accept MIDI-sourced note events alongside QWERTY and pointer events, sharing the active-key state and the `onnote` callback
- `knob`: Must support a `learningMidi` visual state (pulsing ring), an `externalValue` prop for CC-driven updates, and a CC number label when a mapping is assigned

## Impact

- **New file**: `src/audio/midi.js` — `MidiManager` class (Web MIDI API wrapper, CC dispatch)
- **New file**: `src/audio/midiCcMap.js` — CC number ↔ synth parameter mapping store with `localStorage` persistence
- **New file**: `src/components/MidiStatus.svelte` — connection indicator + device selector
- **Modified**: `src/components/Keyboard.svelte` — expose `triggerNote` / `releaseNote` as bindable props
- **Modified**: `src/components/Knob.svelte` — add `learnMode` prop, context-menu trigger for learn, and `externalValue` prop for CC-driven updates
- **Modified**: `src/App.svelte` — instantiate `MidiManager` and `MidiCcMap`, wire CC callbacks to knobs, render `MidiStatus`
- **New dependency**: none (Web MIDI API is a browser built-in; no npm packages required)
- **Browser support**: Web MIDI API requires HTTPS or localhost and is not available in Safari without a polyfill — the UI must degrade gracefully when unavailable
