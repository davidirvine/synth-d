## Context

Three on-screen controls — the rotary `Knob`, the MOD wheel, and the PITCH wheel — currently accept pointer drag (and, on the wheels, `ArrowUp`/`ArrowDown`). There is no mouse scroll-wheel support anywhere; a grep for `wheel`/`deltaY`/`onwheel` finds nothing in the component layer.

Both wheels are rendered by a single shared `Wheel.svelte` component and share one physics model (`src/audio/wheelPhysics.js`, `REST = 0.5`): on release the cursor springs back to `0.5` via a damped harmonic oscillator driven on `requestAnimationFrame`. `WheelsPanel.svelte` instantiates two `Wheel`s (MOD, PITCH), owns the per-wheel physics, a settings popup of six knobs (mass/spring/damping × 2), and `localStorage` persistence keyed `synth-d:wheel-physics` with shape `{ mod: {...}, pitch: {...} }`. The FAUST DSP (`faust/synth.dsp`) declares `modWheel = hslider("modWheel", 0.5, 0, 1, 0.001)`.

The `Knob` already has the machinery scroll needs: a `step`/`fineStep` quantization path, a `shiftHeld` fine-mode flag, and `normalizedToValue`/`valueToNormalized` scale conversion. It has no ARIA. The `Wheel` already has full `role="slider"` ARIA and an arrow-key path (`KEY_STEP = 0.05`).

Two things are being changed together: scroll input on all three controls, and a fidelity correction making the MOD wheel a real (non-spring, bottom-resting) mod wheel. The coupling is intentional, not just convenience: scroll on the MOD wheel only makes sense once it *holds* — a step-and-hold scroll against a spring that immediately hauls the value back to 0.5 would feel broken — so the hold-position fidelity correction is a prerequisite for MOD scroll, and the two are specified and shipped as one coherent change rather than split.

## Goals / Non-Goals

**Goals:**

- Hover-to-scroll value adjustment on knobs, the MOD wheel, and the PITCH wheel.
- Quantized, device-independent scroll for knobs: one notch = one `step`, `Shift` = `fineStep`.
- PITCH scroll is a momentary bend that then springs back to centre (physics unchanged).
- MOD wheel holds its position (no spring), rests at `0` (zero modulation), DSP default `0`.
- Settings popup and persistence become PITCH-only, with backward-compatible loading of old `{ mod, pitch }` blobs.
- Knobs gain ARIA slider semantics.

**Non-Goals:**

- Changing the PITCH wheel's spring physics, range (±2 semitones), or MIDI pitch-bend sync.
- Changing the MOD wheel's MIDI CC 1 sync behaviour (CC 1 still snaps the cursor).
- Inertia/flick velocity imparted to the PITCH spring from scroll magnitude (scroll is a fixed step, not a velocity gesture).
- Any change to knob drag, double-click reset, or MIDI CC behaviour.
- Touch/trackpad-specific gesture tuning beyond treating each wheel event by the sign of `deltaY`.

## Decisions

### D1 — Scroll is quantized by the sign of `deltaY`, not its magnitude

`WheelEvent.deltaY` is wildly inconsistent across devices (mouse notch ≈ ±100px in pixel mode, ±1 in line mode; trackpads emit continuous small deltas). Scaling value by raw magnitude is unpredictable. Instead each wheel event contributes a fixed step in the direction of `Math.sign(deltaY)` (scroll up / `deltaY < 0` increases, matching "up = more"). For knobs this reuses the existing `step`/`fineStep` grid; a knob with no `step` prop moves its normalized position by `0.01` (1% of travel) per notch, converted to a value via the knob's `scale`. The `0.01` is defined in **normalized** space and inherits the knob's nonlinearity — on a log/exponential knob the value-space step is therefore non-uniform across travel, which is intended (uniform perceptual feel, not uniform value steps); the implementer should not "correct" it. For wheels it reuses the `KEY_STEP = 0.05` increment already used by the arrow keys.

_Alternative considered:_ proportional `deltaY/divisor` like the pointer-drag sensitivity model. Rejected — inconsistent across input devices and gives the trackpad a runaway feel.

### D2 — `preventDefault` on element-level `onwheel`; the page never scrolls

The handler calls `event.preventDefault()` so the gesture is consumed by the control. Element-level `wheel` listeners (which is what Svelte's `onwheel` attaches) are **not** passive by default — the passive-by-default rule applies only to `window`/`document`/`body` — so `preventDefault` is honoured. No part of the synth UI *that hosts these controls* is scrollable, so there is no legitimate page-scroll to preserve and no focus-gating is needed: hover-to-scroll is unconditionally safe. The one scrollable region in the app is the patch-manager popover's `.patch-list` (`overflow-y: auto`, capped at 200px), but it is a separate overlay layer and contains no knobs or wheels, so the control wheel handlers never sit inside it and cannot interfere with scrolling the patch list. This matches the existing `touch-action: none` posture on these controls.

_Alternative considered:_ focus-gated scroll (only when the control is focused). Rejected — less discoverable, and unnecessary given nothing scrolls.

**Interaction precedence.** While a pointer drag is in progress on a control, its wheel/keyboard handlers ignore input — the drag owns the cursor — so a combined drag+scroll gesture cannot make the cursor jump between two positions. Scroll reuses the same value-write path as drag, so any powered-off behaviour is identical to drag's (no new power gating is introduced: knobs adjust as they do under drag; the wheels keep their existing powered-off "animate but don't write the param" guard). An incoming MIDI CC 1 (MOD) or pitch-bend (PITCH) message is a position-set rather than an increment, so it overrides a scrolled position exactly as it overrides a dragged one — scroll and MIDI do not conflict.

### D3 — A spring-disable + rest-position seam on the shared `Wheel` component

`Wheel.svelte` drives both wheels, so MOD's new behaviour is expressed as props rather than a fork:

- `springBack` (boolean, default `true`): when `false`, releasing the wheel leaves the cursor where it is — the RAF spring loop is never started and no spring-back occurs.
- `rest` (number, default `0.5`): the cursor's initial/default position. PITCH keeps `0.5`; MOD passes `0`. The component initialises `value` to `rest` instead of the hard-coded `REST`, and arrow/scroll/drag clamp to `[0, 1]` as before.

`WheelsPanel` passes `springBack={false} rest={0}` for MOD and the defaults for PITCH. The `wheelPhysics.js` `REST` constant stays `0.5` and continues to govern the PITCH spring; it is simply no longer the source of MOD's resting value.

A scroll event arriving on a spring wheel (PITCH) while a spring-back is already animating SHALL set the cursor to the current animated value plus one increment and **restart** the spring from there — not compound onto the spring's stale target. This makes repeated scroll-flicks read as discrete fresh bends. (For MOD there is no spring, so the value simply holds at the scrolled position.) The "current animated value" is the physics engine's in-flight cursor position, which the RAF loop updates each frame — the scroll handler reads that live position (the same state the loop integrates and writes to `value`), not a stale pre-spring target; the increment is the wheels' `KEY_STEP` (0.05), reused from the arrow keys.

_Alternative considered:_ a separate `ModWheel` component. Rejected — duplicates the cursor rendering, ARIA, drag, and scroll logic the two wheels share; a two-prop seam is smaller and keeps a single tested surface.

### D4 — MOD wheel rests at `0`, and the FAUST `modWheel` default becomes `0`

A real mod wheel's zero-modulation point is the bottom of travel, and it stays where it is left. Today the MOD wheel rests at `0.5` (50% modulation at rest — a latent bug masked by spring-back). Moving the rest to `0` makes power-on state silent until the user raises it. To keep the Svelte state and DSP agreeing at power-on without user interaction, `faust/synth.dsp` `modWheel` default changes `0.5 → 0` and the FAUST WASM artifact is rebuilt. The `modulation` spec's "rests at 0.5 / DSP default 0.5" requirement is updated accordingly.

### D5 — Persistence drops `mod`; legacy blobs load without error

`wheelPhysicsStore.js` save/load/validate moves from `{ mod, pitch }` to `{ pitch }`. The load path validates the `pitch` branch as today and **ignores** any `mod` field present in older stored blobs (it is neither read nor re-saved), so a user upgrading does not error and is silently migrated to the new shape on the next save. The settings popup renders the three PITCH knobs only.

_Alternative considered:_ a versioned migration that rewrites the stored blob on load. Rejected as over-engineered — the field is simply unused; tolerate-and-drop-on-next-save is sufficient and the existing per-field fallback already handles missing/invalid data.

### D6 — Knob gains ARIA slider semantics **and** keyboard operability

The knob today has no arrow-key handling (only a `Shift` listener) and no ARIA. Adopting `role="slider"` without keyboard operation would be an accessibility anti-pattern — a screen-reader user would meet a slider they cannot drive. So this decision pairs two additions: (1) `role="slider"` with `aria-valuemin`/`aria-valuemax`/`aria-valuenow` (and `aria-valuetext` for the formatted label), `aria-label` set to the knob's `label` for an accessible name, plus `tabindex="0"`, mirroring `Wheel.svelte`; and (2) keyboard handling per WAI-ARIA slider semantics — `ArrowUp`/`ArrowRight` increment, `ArrowDown`/`ArrowLeft` decrement (by the same step/fineStep/`0.01`-default rule as scroll), `Home`/`End` jump to `min`/`max`, each clamped and `preventDefault`-ed. Both the scroll and keyboard handlers respect the existing `disabled` prop — a disabled knob ignores wheel and key events exactly as it ignores drag. Both are additive and do not change pointer/drag behaviour.

## Risks / Trade-offs

- **Scroll over a knob/wheel swallows the page scroll** → Acceptable and intended: no UI region is scrollable, so there is no scroll to swallow. If a scrollable panel is ever added, scroll handlers will need focus- or hover-intent gating; noted here so the assumption is explicit.
- **Trackpad emits many small `deltaY` events, making sign-based stepping feel fast** → Each event still maps to exactly one step; if it proves too sensitive, a small per-control debounce/accumulator can be added without changing the spec (one notch = one step holds regardless).
- **Changing MOD rest `0.5 → 0` and the FAUST default alters power-on state** → Behavioural change is intended and specced; existing tests/E2E that assert mod rests at `0.5` or springs back must be updated as part of the change, not worked around.
- **Old `localStorage` blobs carry a now-unused `mod` object** → Load path explicitly tolerates and ignores it; covered by a persistence scenario.
- **MOD wheel no longer cancels a spring on CC 1 (there is no spring to cancel)** → CC 1 still snaps the cursor; the "cancel active spring-back" clause simply no longer applies to MOD. The `modulation` spec is updated so it does not assert spring-back cancellation for the MOD wheel.

## Migration Plan

1. Add the `springBack`/`rest` seam to `Wheel.svelte`; default behaviour (PITCH) is unchanged.
2. Wire MOD with `springBack={false} rest={0}` in `WheelsPanel`; remove MOD physics knobs from the popup.
3. Update `wheelPhysicsStore.js` to the `{ pitch }` shape with legacy-`mod` tolerance.
4. Change `faust/synth.dsp` `modWheel` default to `0` and rebuild the WASM artifact.
5. Add scroll handlers to `Knob` and `Wheel`; add ARIA to `Knob`.
6. Update tests and any E2E expectations tied to the old MOD behaviour.

Rollback is a straight revert: the seam props default to today's behaviour, and restoring the FAUST default + `{ mod, pitch }` store shape returns the old MOD wheel. Legacy stored blobs remain readable across the rollback because the `mod` field is preserved in old data and merely ignored by the new code.

## Open Questions

_None — the human has settled the load-bearing decisions: MOD is a real non-spring wheel resting at `0`; all three controls ship in one change; hover-to-scroll (nothing is scrollable); MOD physics knobs removed; scroll quantized to step/fineStep._
