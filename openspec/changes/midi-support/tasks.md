## 1. MidiManager module

- [ ] 1.1 Create `src/audio/midi.js` with `MidiManager` class skeleton (constructor accepts `{ onNoteOn, onNoteOff, onPitchBend, onCc, onStatusChange, onDevicesChange }` callbacks)
- [ ] 1.2 Implement `connect()` — call `navigator.requestMIDIAccess`, handle unsupported browser and permission denial, set status to `connected` or `unavailable`
- [ ] 1.3 Implement input port enumeration: iterate `MIDIAccess.inputs`, attach message listeners to all ports (or selected port); expose `selectDevice(id)` method
- [ ] 1.4 Implement `MIDIAccess.onstatechange` listener to handle hot-plug and disconnection events; synthesize note-off for all active MIDI notes on disconnect
- [ ] 1.5 Implement MIDI message parser: decode note-on (0x9n, velocity > 0), note-on-as-off (0x9n, velocity 0), note-off (0x8n), pitchbend (0xEn), CC (0xBn)
- [ ] 1.6 Implement pitchbend normalization: map 14-bit value (0–16383) to ±2 semitones; store current bend value and last active MIDI note for frequency recalculation
- [ ] 1.7 Dispatch CC messages via `onCc({ cc, value })` callback for routing through `MidiCcMap`
- [ ] 1.8 Implement `destroy()` — remove all event listeners and close MIDI access
- [ ] 1.9 Write unit tests in `src/audio/midi.test.js` covering: note-on, note-off, velocity-0-as-off, pitchbend range, CC dispatch, unsupported browser path, disconnect note-off synthesis

## 2. MidiCcMap module

- [ ] 2.1 Create `src/audio/midiCcMap.js` with `MidiCcMap` class that stores `{ cc → { param, min, max } }` mappings in memory and `localStorage` (key prefix `midiCc:`)
- [ ] 2.2 Implement `assign(cc, param, min, max)` — saves mapping to memory and `localStorage`
- [ ] 2.3 Implement `resolve(cc)` — returns the registered mapping for a CC number, or `null`
- [ ] 2.4 Implement `getAssignedCc(param)` — returns the CC number assigned to a param, or `null` (used to display CC label on knob)
- [ ] 2.5 Implement `load()` — reads all `midiCc:*` entries from `localStorage` on construction
- [ ] 2.6 Write unit tests in `src/audio/midiCcMap.test.js` covering: assign, resolve, overwrite, persistence round-trip (mock localStorage), unregistered CC returns null

## 3. Keyboard shared active-key state

- [ ] 3.1 Refactor `Keyboard.svelte` to expose `triggerNote` and `releaseNote` as bindable props (Svelte 5 `$bindable()`) so `App.svelte` can call them from MIDI callbacks
- [ ] 3.2 Verify that `activeKeys` correctly reflects notes from all sources (QWERTY, pointer, MIDI) and that gate=0 is only sent when the set empties
- [ ] 3.3 Update `Keyboard.svelte` tests to cover the shared-state scenarios from the delta spec

## 4. Knob MIDI enhancements

- [ ] 4.1 Add `externalValue` prop to `Knob.svelte`: when it changes outside a drag, snap the knob to that value and fire `onchange`; do not interrupt an in-progress drag
- [ ] 4.2 Add `learningMidi` boolean prop to `Knob.svelte`: when `true`, render a pulsing amber ring around the SVG track using a CSS animation
- [ ] 4.3 Add `assignedCc` prop (number | null) to `Knob.svelte`: when non-null, render a small "CC {n}" label beneath the value label in a muted colour (`#888`)
- [ ] 4.4 Emit `oncontextmenu` (right-click) event from `Knob.svelte` so `App.svelte` can enter learn mode for that knob; suppress the browser context menu
- [ ] 4.5 Update `Knob.svelte` tests to cover `externalValue` snap, `learningMidi` ring, `assignedCc` label, and context-menu event

## 5. MidiStatus component

- [ ] 5.1 Create `src/components/MidiStatus.svelte` accepting props: `status` (`'unavailable' | 'connected' | 'active'`), `devices` (array of `{ id, name }`), `selectedDeviceId` (string), `ondevicechange` (callback)
- [ ] 5.2 Render coloured status dot: grey = unavailable, amber = connected/idle, green = active
- [ ] 5.3 Render device `<select>` dropdown only when `devices.length > 1`
- [ ] 5.4 Write component tests in `src/components/MidiStatus.test.js` covering all three status states and the device selector visibility

## 6. App.svelte wiring

- [ ] 6.1 Import `MidiManager` and `MidiCcMap` in `App.svelte`; instantiate both
- [ ] 6.2 Bind `triggerNote` and `releaseNote` from `<Keyboard>` using `bind:triggerNote` / `bind:releaseNote`
- [ ] 6.3 Wire `MidiManager` callbacks: note-on/off → `keyboard.triggerNote`/`releaseNote`; CC → `MidiCcMap.resolve()` → update matching knob's `externalValue` reactive state; status/device changes → reactive state
- [ ] 6.4 Call `midiManager.connect()` after `powerOn()` resolves; call `midiManager.destroy()` in `powerOff()`
- [ ] 6.5 Add `learningParam` reactive state; on knob right-click set `learningParam` to that knob's param name (clearing any previous learn); on Escape clear it
- [ ] 6.6 On CC received while `learningParam` is set: call `midiCcMap.assign(cc, learningParam, min, max)`, clear `learningParam`
- [ ] 6.7 Pass `learningMidi={learningParam === knob.param}`, `assignedCc={midiCcMap.getAssignedCc(knob.param)}`, and `externalValue` to each `<Knob>` instance
- [ ] 6.8 Import and render `<MidiStatus>` in the header, passing `midiStatus`, `midiDevices`, `selectedDeviceId`, and `ondevicechange` handler wired to `midiManager.selectDevice(id)`

## 7. Lint, format, and tests

- [ ] 7.1 Run `npx eslint --fix` and `npx prettier --write` on all new and modified files
- [ ] 7.2 Run `npx vitest run` — all tests must pass
