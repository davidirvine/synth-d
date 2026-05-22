## Context

The current on-screen wheel is `src/components/WheelPanel.svelte`: a single control bound to `modWheel`, drawn as a filled rectangle (`height = modWheel * 100%`) that holds wherever it is dragged. It is mounted standalone in the keyboard row (`App.svelte:449`), left of the keyboard — despite the `synth-ui` / `modulation` specs describing the wheel as part of the Modulation panel (spec/code drift this change reconciles).

Constraints we build within:
- `modWheel` is **controller state**, not a patch param: it is wired to MIDI CC 1 and `setParam('modWheel')`, and is intentionally excluded from saved patches. The PITCH wheel must follow the same controller-state pattern (no patch persistence of wheel position).
- Pitch bend already exists, MIDI-only: `App.svelte:147` `onPitchBend` → `setParam('freq', freq)`. The on-screen PITCH wheel reuses this signal path rather than introducing a new DSP parameter.
- Knobs animate with `tweened` (svelte/motion), not a spring with mass — there is no existing mass-based physics utility to reuse.
- `Knob.svelte` is fully reusable (`label`, `min`, `max`, `default`, `value`, `unit`, `showLabel`, `showValue`, `showArc`, `onchange`) and is the popup's slider replacement.
- localStorage precedent: the `synth-d:` namespace is established by `src/patches/storage.js`; `src/audio/midiCcMap.js` (which uses its own `midiCc:` prefix) is the precedent for the validate-and-default-on-load pattern, not for the namespace.

## Goals / Non-Goals

**Goals:**
- Two cursor-style wheels (MOD, PITCH), labeled, resting at 50%, springing back to 50% on release with a tunable mass-laden feel.
- The audio parameter follows the spring arc every frame so the return-to-center is audible.
- Per-wheel physics (mass / spring strength / damping) editable via a gear-button popup of knobs, persisted to localStorage and restored on load.
- Reconcile the spec/code drift around where the wheel lives.

**Non-Goals:**
- No new FAUST/DSP parameters (PITCH reuses `freq` bend, MOD reuses `modWheel`).
- No persistence of wheel *position* in patches (positions are transient controller state; only physics *settings* persist).
- No configurable pitch-bend range — fixed at ±2 semitones to match the existing MIDI path.
- No change to how MIDI pitch-bend or CC 1 are received; only an on-screen counterpart is added.

## Decisions

### Decision: Custom damped-harmonic-oscillator integrator over Svelte `spring`
Svelte's `spring` store exposes `stiffness` and `damping` but normalizes mass to 1, so it cannot express the requested mass parameter or guarantee the overshoot-decelerate-reverse feel. We implement a small per-wheel integrator on `requestAnimationFrame`:

```
x  = value − 0.5            // displacement from center
a  = (−k·x − c·v) / m       // k=spring, c=damping, m=mass
v += a · dt
x += v · dt
value = 0.5 + x             // clamped to [0,1]; stop when |x|,|v| < ε
```

`dt` is the measured frame delta, clamped to a maximum of ~50 ms (three dropped frames at 60 Hz) to keep the explicit Euler step stable on tab-resume and low frame rates. The loop runs only while a wheel is settling; it stops at rest, on a new pointer-down, and on keydown (keyboard input takes clean ownership of the value). Each frame writes the value through the existing `onchange` path so the DSP follows.
- *Alternatives considered:* Svelte `spring` (rejected — no mass, can't tune feel); CSS transitions (rejected — no overshoot/oscillation). 

### Decision: Damping expressed as a damping *ratio* knob, not a raw coefficient
The third physics knob is a damping ratio ζ in `[0, 1]`. The integrator derives the raw coefficient `c = ζ · 2·√(k·m)` (critical damping at ζ=1). This keeps the knob meaningful regardless of mass/spring values — ζ<1 always overshoots and settles, ζ=1 never overshoots — instead of a raw `c` that interacts unintuitively with the other two. Default ζ is underdamped (~0.3) for a pronounced but settling bounce.

### Decision: `Wheel` emits `onchange({ value })`; `WheelsPanel` adds the `param`
`Wheel.svelte` emits `onchange({ value })` (matching `Knob.svelte`'s shape), keeping the child wheel agnostic of which synth parameter it drives. `WheelsPanel` wraps each wheel's callback to add the `param` key before forwarding: the MOD wrapper emits `{ param: 'modWheel', value }` so the existing `onModWheelChange` signature is unchanged; the PITCH wrapper forwards to the new pitch handler. The generic wheel also stays display-agnostic: `aria-valuetext` formatting (semitones for PITCH, depth % for MOD) is supplied to `Wheel` as a **prop** (a format function), not hard-coded in the component.

### Decision: Keyboard interaction — Up/Down only, spring on final keyup
Only Up/Down arrows adjust the focused wheel (step 0.05); Left/Right are ignored. Auto-repeat is allowed — each repeated `keydown` increments by `step`, and the spring-back fires on the single final `keyup` (a `keydown` mid-spring cancels the loop so keyboard input owns the value cleanly). The existing `WheelPanel`'s `Home`/`End` (snap to 0 / 1) bindings are **dropped**: with a spring-loaded wheel that always returns to 0.5, hard min/max snaps have no lasting effect and would immediately spring away, so they add no value.

### Decision: Power-on/off transitions snap via `externalValue` (external cancels spring)
On both power-off and power-on the wheels' `externalValue` is set to the 0.5 rest/center position (the MOD wheel no longer uses `powerOffValue('modWheel')`, which returns the 0 minimum — a spring-loaded wheel rests at center, and the FAUST `modWheel` default is already 0.5). Because an external value change cancels any active spring-back and snaps the cursor (the same rule as MIDI input), the power transition wins cleanly over an in-flight spring rather than fighting it.

### Decision: `WheelsPanel` container + reusable `Wheel` child
`WheelPanel.svelte` is replaced by:
- `Wheel.svelte` — one track, cursor rendering, drag + keyboard interaction, owns its physics integrator; props for label, value/externalValue, physics params, `onchange`.
- `WheelsPanel.svelte` — lays out two `Wheel`s with centered labels, the gear button (top-left), and the physics popup; owns load/save of physics settings.
- The popup renders six `Knob.svelte` instances (mass/spring/damping × MOD/PITCH) plus a reset action.

### Decision: Cursor positioning accounts for line thickness
The cursor is a 4px full-width line positioned by value. To avoid clipping at the track edges, its center travels within `[2px, height−2px]` (half the line thickness inset top and bottom), so value 0 and value 1 show the full line flush at each edge rather than half-clipped.

### Decision: PITCH reuses the `freq` bend path and the existing `bentFreq` helper; MOD reuses `modWheel`
PITCH maps its 0–1 value to ±2 semitones around the **current base note frequency** and writes via the same `setParam('freq', …)` route as MIDI pitch-bend; 0.5 = no bend. MOD continues to drive `modWheel` / CC 1.

Concrete wiring (resolves the "where does the base frequency come from" gap):
- **Base frequency source.** Today `freq` is pushed straight to the DSP (`setParam('freq', …)` on every note-on from both the keyboard and MIDI) and is *not* retained in `synthParams`. The MIDI layer keeps its own `#lastNote` for the same reason. We add an App-level `currentNoteFreq`, the most recent **unbent** note-on frequency, tracked **solely at the single `onKeyboardNote` chokepoint**: every note source routes through it — on-screen/QWERTY keys directly, and MIDI note-on/off (and MIDI device-disconnect and power-off `releaseAll`) via `keyboardTriggerNote`/`keyboardReleaseNote`. `currentNoteFreq` is set from the `{ param: 'freq' }` message (the unbent `midiToFreq(note)`, which is the correct base — `onNoteOn`'s `freq` argument is already *bent*) and cleared to `null` on the `{ param: 'gate', value: 0 }` of the last release (the keyboard's monophonic gate fires gate:0 only when the last key clears; legato adds carry `freq` only). So `currentNoteFreq !== null` is *exactly* "a note is sounding" — no separate boolean is required. This is a **last-note-wins** model, not per-voice tracking: with notes held, the PITCH wheel bends whichever note's frequency was set most recently — consistent with the existing `MidiManager.#lastNote` behavior. We deliberately do **not** add a separate `onNoteOn`/`onNoteOff` counter: because MIDI already routes through `onKeyboardNote`, a second counter would double-count on release (breaking multi-note hold) and would capture the bent frequency instead of the unbent base.
- **Bend computation.** Reuse `bentFreq` from `src/audio/pitchbend.js`: `bentFreq(currentNoteFreq, semitones)` where `semitones = (value − 0.5) · 2 · BEND_SEMITONES` (so value 1 → +2, value 0 → −2, with `BEND_SEMITONES = 2`). The computation lives in the PITCH wheel's `onchange` handler in `App.svelte` (where `currentNoteFreq` is in scope), not inside `WheelsPanel`.
- **Write gating (resolves the stale-freq race).** PITCH `setParam('freq', …)` writes are gated on `currentNoteFreq !== null` (a note is sounding), **not** merely on `powered`. Without this, a spring-back running after all notes are released would emit ~60 stale-frequency writes/sec, and a note-on arriving mid-settle would be immediately overwritten by the next spring frame's stale bend — an audible glitch. Gating on a live note makes the "transient / inert when no note sounds" guarantee real: the cursor still springs home visually, but no `freq` write occurs.
- **FAUST default.** No `.dsp` change is required: `faust/synth.dsp` already declares `modWheel = hslider("modWheel", 0.5, …)`, so the DSP default already matches the 0.5 rest position.

Both wheels keep emitting `onchange` every spring frame while powered (guarded by the existing `powered` check so spring motion while off is not written to the store).

### Decision: Powered-off and no-note behavior
The wheels remain **interactive and spring back visually** at all times, but `onchange` writes are suppressed while powered off — matching the existing `onModWheelChange` / `onParamChange` `if (!powered) return` guard. PITCH bend is **transient**: it bends whatever frequency is currently set, so while no note sounds the per-frame writes are inert, and the next note-on computes its frequency independently (identical to existing MIDI pitch-bend semantics). This keeps the spring-back identity consistent (the cursor always animates home) without writing stale bends into new notes.

### Decision: External MIDI input cancels an active spring-back (both wheels)
An incoming external value — MIDI CC 1 for MOD, MIDI pitch-bend for PITCH — cancels any in-progress spring-back and snaps the cursor to the incoming value (external input wins), matching today's "CC overrides manual position" behavior. This applies symmetrically to both wheels.

### Decision: Physics persistence via `synth-d:wheel-physics`
A single key `synth-d:wheel-physics` (in the `synth-d:` namespace established by `storage.js`) stores `{ mod: {mass, spring, damping}, pitch: {mass, spring, damping} }`. Load validates each field is a finite number in range and falls back to defaults per-field (reusing the validate-and-default resilience pattern from `midiCcMap`), so a partial or corrupt entry never breaks the wheels. Reset writes defaults back.

Parameter ranges (formalized in the `wheel-physics` spec): mass `0.1–5` (default `1`), spring `1–50` (default `20`), damping ratio ζ `0.05–1` (default `0.3`). The ζ lower bound is `>0` so the system can never be perfectly undamped (perpetual oscillation); the default `0.3` is underdamped for a pronounced overshoot-and-settle.

## Risks / Trade-offs

- **Per-frame DSP writes during settle (~60/sec/wheel)** → Mitigation: writes only occur while settling (bounded seconds), reuse the existing `setParam` path already exercised by MIDI CC streams; stop the loop at the rest threshold.
- **Underdamped integrator can go unstable with extreme knob values / large `dt`** → Mitigation: clamp `dt`, clamp value to [0,1] each step, and bound knob ranges (mass 0.1–5, spring 1–50, ζ 0–1) so the discrete step stays stable.
- **MOD wheel springing to 0.5 changes long-standing "hold a depth" behavior** → Mitigation: called out as BREAKING in the proposal; it is the explicitly requested behavior and the rest value (0.5) already matches the power-on default.
- **Spec/code drift (wheel described in Modulation panel, mounted standalone)** → Mitigation: this change updates `synth-ui` to describe the standalone wheels panel and removes the wheel from the Modulation-panel contents requirement.
- **MIDI CC 1 / pitch-bend arriving mid-settle could fight the spring** → Mitigation: an external value update cancels the active spring and snaps to the incoming value (external input wins), matching today's CC-overrides-manual behavior.
- **Both wheels released together run two RAF loops, doubling per-frame writes** → Mitigation: still bounded (two settling wheels, seconds long) and well under MIDI CC stream rates; each `Wheel` owns its own loop and stops at rest independently.
- **Touch / multi-touch** → Each `Wheel` independently captures its pointer (`setPointerCapture`), so two-finger simultaneous drag of both wheels works; `touch-action: none` on the track (as today) prevents scroll interference.
- **Popup positioning on small screens** → The physics popup anchors to the gear button and must stay within the viewport; clamp/scroll its content rather than overflowing. Minor implementation detail, flagged for the implementer.
