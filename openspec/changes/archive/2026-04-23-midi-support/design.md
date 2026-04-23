## Context

The synth is a Svelte 5 / Faust web synthesizer. Note input currently flows through `Keyboard.svelte`, which maintains an `activeKeys` SvelteSet and calls an `onnote` prop with `{ param, value }` messages. The DSP engine (`engine.js`) accepts `freq` and `gate` parameters via `setParam`. The existing keyboard module (`audio/keyboard.js`) already uses MIDI note numbers as the canonical pitch representation and provides `midiToFreq` and `buildNoteOnMessages` helpers.

Web MIDI API (`navigator.requestMIDIAccess`) is available in Chromium-based browsers over HTTPS or localhost. Safari does not support it natively. The API is asynchronous and produces `MIDIInput` ports that emit `MIDIMessageEvent` objects.

## Goals / Non-Goals

**Goals:**
- Accept note-on / note-off messages from any connected MIDI input device
- Highlight the correct key on the visual keyboard when a MIDI note falls within its range
- Show MIDI status (unavailable / no devices / connected) in the UI header
- Allow the user to select a specific MIDI input when multiple are present
- Support MIDI pitchbend mapped to oscillator frequency offset
- Support MIDI CC messages mapped to synth knob parameters via a learn mode
- Persist CC-to-knob mappings in `localStorage` across sessions
- Degrade gracefully when Web MIDI is unavailable (Safari, insecure origin)

**Non-Goals:**
- MIDI output / thru
- MIDI clock / sync
- Polyphonic MIDI (the synth is and remains monophonic)
- MPE (MIDI Polyphonic Expression)
- Polyfills for Safari (out of scope for this change)
- CC mapping for parameters that are not exposed as knobs (e.g., power button)

## Decisions

### Decision 1 — `MidiManager` as a plain JS class, not a Svelte store

**Choice:** A plain ES class in `src/audio/midi.js` that accepts callbacks on construction.

**Rationale:** The MIDI lifecycle (open access, add/remove input listeners, close) is not inherently reactive. Wrapping it in a Svelte store would require bridging async port-change events into the store, adding complexity with no benefit. The class exposes `connect()` / `destroy()` methods and fires `onNoteOn`, `onNoteOff`, `onPitchBend`, and `onStatusChange` callbacks, which App.svelte wires to engine calls and reactive state.

**Alternative considered:** A Svelte store wrapping `MidiAccess`. Rejected because `MIDIConnectionEvent` arrives outside Svelte's update cycle, requiring `$state` mutation through a wrapper regardless — the plain class is simpler.

### Decision 2 — MIDI note events re-use Keyboard's `triggerNote` / `releaseNote` via lifted callbacks

**Choice:** `Keyboard.svelte` exposes `triggerNote` and `releaseNote` as bindable or prop-provided functions so `App.svelte` can call them from MIDI events. MIDI and QWERTY/pointer input share the same `activeKeys` set, so the visual keyboard always reflects the playing note regardless of source.

**Rationale:** The keyboard's `activeKeys` set is the canonical visual state. Duplicating this logic in a separate MIDI path would cause the visual and audio states to diverge (e.g., a MIDI note-on not highlighting the key). Sharing the path keeps the display consistent and avoids duplicate `onnote` wiring.

**Alternative considered:** A separate MIDI-specific `activeKeys` set in `MidiStatus.svelte`. Rejected because it would require `App.svelte` to merge two sets for display, and the Keyboard SVG rendering would need to accept an external active-key set.

**Implementation:** `Keyboard.svelte` binds `triggerNote` and `releaseNote` via a `bind:triggerNote` / `bind:releaseNote` pattern (Svelte 5 bindable props), or alternatively exposes them through a `this` binding. App.svelte passes these to `MidiManager` callbacks after mount.

### Decision 3 — Pitchbend maps to a `bend` parameter offset in semitones

**Choice:** MIDI pitchbend (14-bit, range ±8192) is normalized to ±2 semitones and sent as a `freq` update computed as `midiToFreq(note) * 2^(bendSemitones/12)`.

**Rationale:** ±2 semitones is the synthesizer standard default range. Keeping it as a frequency multiplier avoids adding a new DSP parameter and works with the existing `freq` path.

**Alternative considered:** Adding a dedicated `bend` FAUST parameter. Rejected as over-engineering for the initial implementation; frequency recalculation on bend event is negligible cost.

### Decision 4 — MIDI status indicator in the header, device selector as a `<select>`

**Choice:** A `MidiStatus.svelte` component in the header showing a colored dot (grey = unavailable, amber = connected/idle, green = active) and a `<select>` dropdown when more than one input exists.

**Rationale:** The header already has room (power button on the right, title on the left). A dot + optional dropdown is unobtrusive and matches the dark aesthetic.

### Decision 5 — CC mapping uses a learn mode triggered by right-click on a knob

**Choice:** Right-clicking (or long-pressing) any knob enters "learn" mode for that knob. The knob shows a pulsing highlight ring. The next CC message received on any channel assigns that CC number to that knob's parameter. The binding is saved to `localStorage` keyed by the synth parameter name (e.g., `midiCc:osc_freq`).

**Rationale:** Learn mode is the standard synthesizer UX for CC assignment — it requires no modal dialogs or separate mapping screens. Right-click is unused on knobs today and is idiomatic for context actions. Keying persistence by parameter name (not DOM position) survives page reload even if the UI layout changes.

**Alternative considered:** A dedicated mapping panel listing all parameters with CC number dropdowns. Rejected as too much UI complexity for a first implementation; learn mode is faster to use and easier to implement.

**Alternative considered:** Hard-coding a default CC map (e.g., CC 74 → filter cutoff). Rejected because different hardware controllers use different CC numbers; learn is universally correct.

### Decision 6 — CC values are scaled from 0–127 to each knob's `min`/`max` range

**Choice:** `MidiCcMap` stores `{ param, min, max }` per mapping. Incoming CC value (0–127) is linearly scaled to `[min, max]` before calling the knob's `onchange` callback. `Knob.svelte` accepts an `externalValue` prop; when it changes, the knob snaps to that value without affecting pointer drag state.

**Rationale:** Each knob already has `min`/`max` metadata (it needs them for the pointer drag math). Re-using these for CC scaling avoids a second mapping layer and keeps the CC resolution (128 steps) mapped across the full knob range.

**Alternative considered:** Storing raw CC 0–127 and letting each knob interpret it. Rejected because knobs have different ranges and the conversion would be duplicated in each component.

## Risks / Trade-offs

- **Browser support** → Mitigation: `MidiManager.connect()` catches `SecurityError` and `NotSupportedError` from `requestMIDIAccess` and sets status to `'unavailable'`; the UI shows a static "MIDI unavailable" label and the synth works normally via QWERTY/pointer.
- **Port hot-plug** → Mitigation: Listen to `MIDIAccess.onstatechange` and update the device list and re-attach listeners on port connect/disconnect.
- **Note stuck on device disconnect** → Mitigation: On `MIDIAccess.onstatechange` with `port.state === 'disconnected'`, synthesize note-off for all active MIDI notes.
- **Legato with simultaneous QWERTY + MIDI** → The shared `activeKeys` set already handles mixed input correctly because `releaseNote` only sends gate-off when the set becomes empty.
- **CC learn mode interruption** → If the user right-clicks a knob but then moves a different CC by accident, the wrong binding is set. Mitigation: pressing Escape or right-clicking again cancels learn mode without saving.
- **CC resolution vs. knob precision** → 128 CC steps may feel coarse for wide-range knobs (e.g., filter cutoff 20–20000 Hz). Accepted trade-off for this implementation; fine control remains available via pointer drag.
- **localStorage conflicts across tabs** → Multiple synth tabs could overwrite the same CC map. Accepted as a minor edge case; no mitigation in this change.

## Migration Plan

No migration needed — this is additive. The synth functions identically when Web MIDI is unavailable or no MIDI device is connected. No existing tests require changes to pass; new tests cover the MIDI module and component in isolation.

## Open Questions

- Should pitchbend range be user-configurable (e.g., via a knob)? Deferred — ±2 semitones hardcoded for now.
- Should velocity affect amplitude? The DSP engine currently has no `velocity` parameter in the FAUST DSP. Deferred — velocity ignored in this change, note-on is fixed amplitude.
- Should there be a way to clear all CC mappings at once (e.g., a "Reset MIDI" button)? Deferred to a follow-up change.
