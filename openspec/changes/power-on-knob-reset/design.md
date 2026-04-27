## Context

`Knob.svelte` already imports and uses Svelte's `spring` store from `svelte/motion`. The spring controls the **visual indicator position** only — the logical `value` and the `onchange` callback always update instantly. The spring is currently always active when an `externalValue` prop change arrives (e.g., a MIDI CC message or the power-on reset). During pointer drag the spring is bypassed via `{ instant: true }`.

On power-on, `App.svelte` sets `ccExternalValues = { ...DEFAULTS }`, which propagates as `externalValue` to every `Knob`. This already correctly resets knob values and fires `onchange` to update the DSP engine. The spring then animates the indicator to the default position — but because the spring is always on for external changes, it also causes the same slow animation lag when playing back live MIDI CC input, which users find jarring.

The desired UX is:
- **Power-on only**: spring is active → indicator sweeps visibly to defaults, giving clear "reset" feedback.
- **All other times**: spring is disabled → indicators snap instantly, no lag.

## Goals / Non-Goals

**Goals:**
- Indicator visually animates to default positions during the power-on reset sequence.
- Spring is inactive during normal play (drag, MIDI CC, double-click reset, externalValue updates from automation).
- No change to logical value update timing or DSP parameter delivery — those always stay instant.
- Spring activation and deactivation is controlled from a single place (`App.svelte`).

**Non-Goals:**
- Changing the spring stiffness/damping constants — existing values (`stiffness: 0.1, damping: 0.85`) are appropriate for the power-on sweep duration.
- Persisting synth state across page loads.
- Adding spring animation to drag interaction.

## Decisions

### Decision 1: `springEnabled` boolean prop on `Knob`

Add a `springEnabled: boolean` prop (default `false`) to `Knob`. Inside the `externalValue $effect`, pass `{ instant: !springEnabled }` to `springPos.set()`.

**Why over always-on spring**: The user explicitly wants no spring lag during normal interaction. Making the spring opt-in per call site is the smallest, most auditable change.

**Why over a callback/event approach**: The parent (`App.svelte`) already owns the reset sequencing (it sets `ccExternalValues`). Adding a timed flag on the parent is simpler than propagating completion callbacks through panel components.

**Alternative considered — remove spring entirely, only use it on a dedicated `resetToDefault` prop change**: This would work but requires a separate prop and a more complex `$effect` in `Knob`. The single `springEnabled` flag is simpler.

### Decision 2: `springEnabled` managed in `App.svelte` with a fixed timeout

In `handleToggle` (power-on branch), set `springEnabled = true` immediately before `ccExternalValues = { ...DEFAULTS }`, then schedule `springEnabled = false` after 800 ms via `setTimeout`.

800 ms is chosen to be comfortably longer than the spring settle time (~600 ms for a full-range sweep at `stiffness: 0.1, damping: 0.85`), with headroom for partial sweeps that settle faster.

**Why a fixed timeout over a spring-completion callback**: Svelte's `spring` store provides a `Promise` via `springPos.set()` that resolves when settled. However, propagating per-knob completion signals up through arbitrary panel component trees (each panel renders knobs internally without exposing them) would require non-trivial plumbing. A single conservative timeout at the App level is simpler and reliable.

**Why `App.svelte` over inside `PowerButton.svelte`**: `PowerButton` is a pure UI component with no knowledge of knob state. The reset logic already lives in `handleToggle` in `App.svelte`.

### Decision 3: Pass `springEnabled` as a flat prop through panel components

Each panel component (`Oscillator`, `Mixer`, `Filter`, `AmpEnv`, `Modulation`, `Glide`, `Effects`) receives `springEnabled` and threads it to each `Knob` it owns.

**Why not a Svelte context/store**: The prop count is manageable and keeps data flow explicit and testable. A store would make the connection implicit and harder to trace in tests.

## Risks / Trade-offs

- **Timing brittleness** → The 800 ms timeout is empirical. If the spring parameters are later tuned to be slower, `springEnabled` would be cleared before all animations finish. Mitigation: document the dependency in a code comment linking the timeout to the spring constants.
- **Spring active during power-off then rapid power-on** → If the user power-cycles within the 800 ms window, `springEnabled` may already be `false` from the prior cycle. This is acceptable; the visual sweep is a nice-to-have, not critical functionality.
- **Additional prop threading** → Every panel component needs a new `springEnabled` prop. This is mechanical boilerplate but not risky. It will appear in component tests as a new required/optional prop.

## Migration Plan

This is a fully in-browser change with no server-side or persistent state involved. No migration is required. The feature is gated entirely by the power-on interaction — page reload returns to the default (spring off) state automatically.
