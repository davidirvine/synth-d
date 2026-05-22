## 1. Physics model

- [x] 1.1 Add a damped-harmonic-oscillator helper (`src/audio/wheelPhysics.js`): given `{ value, velocity, mass, spring, dampingRatio, dt }` return the next `{ value, velocity }`, deriving `c = ζ·2·√(spring·mass)`, clamping `value` to [0,1] and `dt` to a safe max
- [x] 1.2 Add a `isAtRest(value, velocity)` threshold helper and the default physics constants (mass/spring/damping ranges + defaults) in the same module
- [x] 1.3 Unit-test the integrator with mutation coverage in mind (boundary values at clamp edges, sign of acceleration, zero-velocity rest detection): underdamped overshoots then settles, critical damping never overshoots, heavier mass settles slower, rest threshold terminates

## 2. Physics persistence

- [x] 2.1 Add load/save for `synth-d:wheel-physics` (`src/audio/wheelPhysicsStore.js` or extend existing storage): shape `{ mod, pitch }` each `{ mass, spring, damping }`
- [x] 2.2 Validate each field as a finite number in range on load, falling back to per-field defaults; expose a `defaults` and a `reset` path
- [x] 2.3 Unit-test: round-trip save/load, and that absent/partial/corrupt entries fall back to defaults without throwing

## 3. Reusable Wheel component

- [x] 3.1 Create `src/components/Wheel.svelte` with the same rectangular track (18×60px) and a centered label above; props: `label`, `value`/`externalValue`, physics params, `onchange`
- [x] 3.2 Render the value as a 4px full-width `#c87941` cursor line, positioned by value with half-thickness inset so it never clips at the edges; remove the filled-rect rendering
- [x] 3.3 Port drag interaction from the existing `WheelPanel.svelte` (same `delta=(startY−clientY)/80` sensitivity, `setPointerCapture` on pointerdown, `touch-action: none` on the track for touch/multi-touch, drag only within the track) updating value and firing `onchange`
- [x] 3.4 Run the physics integrator on `requestAnimationFrame` after pointer/key release, springing value back to 0.5 and firing `onchange` each frame; clamp `dt` to ~50ms; cancel the loop on new pointer-down, keydown, or external value change, and clean it up on component teardown (the appropriate Svelte 5 mechanism — e.g. an `$effect` return) so no RAF loop leaks
- [x] 3.5 Make the wheel `role="slider"` with Up/Down arrow-key control (step 0.05 per press; Left/Right ignored), a visible focus ring, and spring-back on key release; set `aria-valuemin=0`, `aria-valuemax=1`, `aria-valuenow={value}`, `aria-label="{label} wheel"`, and `aria-valuetext` describing the value meaningfully (e.g. semitone offset for PITCH)

## 4. WheelsPanel container + physics popup

- [x] 4.1 Create `src/components/WheelsPanel.svelte` laying out MOD and PITCH `Wheel`s (no "WHEEL" label); load physics from storage and pass per-wheel params down
- [x] 4.2 Add the gear/settings icon button in the top-left and a popup it toggles (click-outside / Escape to close); tab order MOD → PITCH → gear; when the popup opens, move focus into it (its knobs join the tab order) and on Escape return focus to the gear button
- [x] 4.3 Render six `Knob.svelte` controls in the popup (mass/spring/damping × MOD/PITCH) bound to the physics params; persist on change
- [x] 4.4 Add a reset-to-defaults action that restores the six knobs and saves defaults

## 5. App wiring

- [x] 5.1 Replace the `WheelPanel` mount in `App.svelte` (keyboard row) with `WheelsPanel`; keep MOD wired to `modWheelExternal` / `onModWheelChange` / CC 1 (the MOD wrapper must emit `{ param: 'modWheel', value }` to match the existing handler), now resting and springing to 0.5
- [x] 5.2 Track the current base note frequency at the single keyboard chokepoint. Add App-level `currentNoteFreq` state, updated **solely in `onKeyboardNote`** — every note source (on-screen keys, QWERTY, MIDI note-on/off, MIDI device disconnect, power-off `releaseAll`) routes through it:
  - set from the unbent `freq` of each `{ param: 'freq' }` message
  - clear to `null` on the `{ param: 'gate', value: 0 }` of the last release (the keyboard's monophonic gate fires gate:0 only when the last key clears; legato adds send `freq` only)
  - `currentNoteFreq !== null` is therefore exactly "a note is sounding" — last-note-wins, mirroring `MidiManager.#lastNote`; no separate boolean is needed
  - do **not** add separate `onNoteOn`/`onNoteOff` tracking: MIDI note-on/off already route through `onKeyboardNote` via `keyboardTriggerNote`/`keyboardReleaseNote`, so a second path would double-handle and would use the already-bent `onNoteOn` freq instead of the unbent base
- [x] 5.3 Wire the PITCH wheel `onchange` in `App.svelte`: compute `bentFreq(currentNoteFreq, (value − 0.5) · 2 · BEND_SEMITONES)` (reusing `src/audio/pitchbend.js`) and write via `setParam('freq', …)`; 0.5 = no bend; **skip the write when `currentNoteFreq === null`** so spring frames with no note sounding are inert and cannot stomp a new note-on
- [x] 5.4 Ensure spring-frame writes are guarded by the `powered` check (no store writes while powered off, cursor still animates) and that incoming CC 1 (MOD) **and** MIDI pitch-bend (PITCH) each update the wheel's external value and cancel an active spring-back
- [x] 5.5 Delete the obsolete `WheelPanel.svelte`

## 6. Tests & verification

- [ ] 6.1 Component tests for `Wheel`: cursor renders at the value position, drag updates value, release triggers spring-back toward 0.5, arrow keys move the focused wheel
- [ ] 6.2 Component test for `WheelsPanel`: two labeled wheels render, gear opens popup with six knobs, reset restores defaults, edited physics persist to localStorage, popup dismisses on Escape / outside click
- [ ] 6.3 Test that on-screen PITCH drag and incoming MIDI pitch-bend do not fight: an arriving pitch-bend cancels the wheel's spring-back and snaps to the external value
- [ ] 6.4 Run full gate per STACK.md — `npx vitest run` and `npx playwright test` first for fast feedback, then `npx stryker run` (≥85%) as the final gate — plus eslint/prettier on changed files
- [ ] 6.5 Manual audio verification: MOD wheel mod-depth wobble and PITCH ±2-semitone bend are audible as the cursor springs back to center

## 7. Spec sync

- [ ] 7.1 Sync the `synth-ui` and `modulation` delta specs into the main specs (`openspec/specs/...`) so the standalone-wheels-panel description replaces the stale "wheel in Modulation panel" text — at archive time via `/opsx-archive-wt` (or `/opsx:sync` if syncing earlier)
