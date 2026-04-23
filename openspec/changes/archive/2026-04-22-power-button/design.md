## Context

The synthesizer currently shows a full-screen "CLICK TO START" overlay on page load to satisfy the browser autoplay policy (AudioContext must not be created before a user gesture). Once clicked, the overlay disappears and the AudioContext is created. There is no way to stop audio after it has started short of reloading the page.

The overlay lives in `App.svelte` (`started` state, `.overlay` CSS). The audio engine in `src/audio/engine.js` exposes `initAudio()` which creates and resumes the AudioContext on first call.

## Goals / Non-Goals

**Goals:**
- Replace the full-screen overlay with a power button that satisfies browser autoplay policy
- Allow the user to stop all audio at any time by powering off
- Keep the synth panel controls visible in both power states (no hidden UI)
- Match the hardware synthesizer aesthetic (LED-style indicator, amber/dark palette)

**Non-Goals:**
- Persisting power state across page reloads
- Muting individual oscillators or channels independently
- Changing the DSP signal chain or any parameter logic

## Decisions

### AudioContext lifecycle: suspend/resume rather than destroy/recreate

On first power-on, `initAudio()` is called (creates the AudioContext, loads WASM, connects the node). On power-off, `ctx.suspend()` is called — this immediately stops audio output without tearing down the graph. On subsequent power-on, `ctx.resume()` is called instead of re-initializing.

**Why not destroy and recreate?** Recreating the AudioContext on every power-on would re-fetch and re-compile the WASM module, adding ~500ms of latency and risking a visible stutter. `suspend/resume` is instant and preserves all parameter state.

**Alternative considered:** Disconnect/reconnect the AudioWorklet node from the destination. Rejected — `suspend()` is semantically cleaner and guaranteed to halt the audio thread output.

### Engine API: add `powerOff()` export alongside existing `initAudio()`

`initAudio()` is renamed to `powerOn()` for semantic clarity (it already guards against double-init). A new `powerOff()` export calls `ctx.suspend()`. App.svelte calls `powerOn()` / `powerOff()` on button toggle.

**Why not a single `setPower(bool)` toggle?** Two named functions are more readable at the call site and easier to test independently.

### Power button placement: header strip above the panels

A narrow header row above the five control panels holds the synth title ("SYNTH-1") on the left and the power button on the right. This mirrors hardware synth layouts (power switch top-right) without disturbing the existing panel flex layout.

**Alternative considered:** Embed the power button inside the Oscillator panel. Rejected — power is a global transport control, not an oscillator parameter.

### Controls visible-but-dimmed when powered off

When power is off, the main panel area has `opacity: 0.4` and `pointer-events: none`. This makes the powered-off state obvious without hiding the controls entirely.

**Why not hide controls?** Hiding would shift layout on power-on, causing a jarring reflow. Dimming is instant and avoids layout shift.

## Risks / Trade-offs

- **Safari AudioContext quirk** → `suspend()` on a never-started context may no-op silently. Mitigation: only call `powerOff()` after `powerOn()` has succeeded (guard with `initialized` flag in engine).
- **WASM load time on first power-on** → user may experience a ~200–500ms delay the first time they power on while WASM loads. Original mitigation (show "STARTING…" label during init) was dropped — the changing label caused UX issues. Mitigation: button is disabled during init, preventing double-clicks.
- **Dimmed controls still focusable via keyboard** → `pointer-events: none` does not prevent keyboard focus. Mitigation: add `inert` attribute to the main panel when powered off (supported in all modern browsers).
