## Why

When the synth powers on, all knobs remain at whatever positions they were previously rendered in rather than snapping to their DSP-default values, causing a mismatch between the UI and the audio engine state. The knob component has no spring animation for everyday use (it would be too sluggish), but a brief spring-driven sweep back to defaults during the power-on sequence would provide clear visual feedback that the synth is initialising and all parameters are at their starting positions.

## What Changes

- The `Knob` component gains a `spring` boolean prop (default `false`). When `true`, value changes animate to the target via a damped spring instead of snapping instantly.
- The `PowerButton` component triggers a coordinated reset: on power-on it sets all knob values to their defaults with `spring={true}`, then disables the spring once the animation completes.
- The spring is **only active during the power-on reset sequence** — it is never enabled during normal drag interaction, ensuring no added latency for the player.

## Capabilities

### New Capabilities

- `knob-spring-reset`: Knob spring animation mode used exclusively during power-on to animate all knobs to their default values, then disabled.

### Modified Capabilities

- `knob`: Adding `spring` boolean prop that, when `true`, animates value changes with a damped spring instead of snapping.
- `power-button`: On power-on, broadcasting a "reset to defaults with spring" signal to all knobs; disabling spring after animations complete.

## Impact

- `src/lib/Knob.svelte` — new `spring` prop + spring interpolation logic
- `src/lib/PowerButton.svelte` (or parent orchestration component) — emit reset signal on power-on; listen for animation-complete to clear spring mode
- All knob instances in `src/routes/+page.svelte` (or equivalent) — must receive and react to the spring-reset signal
- No DSP or audio engine changes required
