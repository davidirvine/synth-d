## Context

The audio engine (`src/audio/engine.js`) currently routes the FAUST AudioWorklet node directly to `ctx.destination`. There is no intermediate node exposing signal data for visualisation. The UI has no real-time waveform display.

The Web Audio API provides `AnalyserNode`, which can be inserted inline in a signal chain and exposes `getByteTimeDomainData()` for time-domain waveform snapshots without affecting audio quality or latency.

## Goals / Non-Goals

**Goals:**

- Tap the post-master-volume signal with an `AnalyserNode` and expose it from the engine
- Render time-domain waveform data on a `<canvas>` inside a new `Scope.svelte` component
- Display updates in sync with the browser animation loop (`requestAnimationFrame`) while powered on
- Match the existing Moog dark aesthetic (cream trace on dark panel background)
- Fit within the existing panel layout by using the currently unused panel slot under Output

**Non-Goals:**

- Frequency-domain (FFT) spectrum display
- Triggering / sync (the scope is free-running)
- Zoom, freeze, or any interactive controls on the scope
- Recording or exporting waveform data

## Decisions

### 1. Insert `AnalyserNode` between worklet and destination

**Decision:** `node → analyserNode → ctx.destination`

**Rationale:** Inserting inline ensures the scope sees the final signal including master volume. Branching (node → destination AND node → analyser) would also work but produces two output paths unnecessarily.

**Alternative considered:** Read DSP output via `ScriptProcessorNode` — deprecated and runs on the main thread; rejected.

### 2. Expose analyser via a module-level getter

**Decision:** Export `export function getAnalyser() { return analyserNode }` from `engine.js`.

**Rationale:** The existing engine module already uses module-level state (`ctx`, `node`). A getter is consistent with that pattern and avoids prop-drilling through App.svelte.

**Alternative considered:** Pass the analyser as a prop from App — works but couples App to scope internals unnecessarily.

### 3. `Scope.svelte` owns the animation loop

**Decision:** The component starts `requestAnimationFrame` on mount (when powered on) and cancels it on destroy.

**Rationale:** Keeps all rendering logic co-located in the component. The `powered` prop controls whether the loop runs; when off, the canvas shows a flat line.

**Alternative considered:** Global animation manager — over-engineered for a single consumer.

### 4. Canvas size and FFT/buffer size

**Decision:** `fftSize = 2048` (yields 1024 time-domain samples), canvas rendered at `width: 100%` with a fixed 80 px height.

**Rationale:** 1024 samples at 44 100 Hz ≈ 23 ms of signal, sufficient to show ~1 cycle at 40 Hz (lowest audible note). 80 px height fits the header strip without taking panel space.

### 5. Scope location in existing grid

**Decision:** Render `Scope` in the existing empty panel slot beneath Output (right column, second row) instead of introducing a new strip between header and controls.

**Rationale:** Reusing the placeholder slot keeps the established panel architecture intact, avoids adding a new top-level layout band, and matches the existing component pattern where each panel owns its own labeled container.

## Risks / Trade-offs

- **Performance:** `requestAnimationFrame` at 60 fps adds a canvas draw call per frame. At 1024 samples this is negligible, but if future components also use rAF the number of animation callbacks could grow. → Mitigation: acceptable for now; consolidate if profiling shows an issue.
- **No signal when powered off:** Canvas will show a flat line before power-on. This is intentional and consistent with real hardware behaviour.
- **Test coverage:** `AnalyserNode` is not available in the jsdom test environment. The unit test for `getAnalyser()` must mock `AudioContext`, and the Scope component test must stub the analyser's `getByteTimeDomainData`. → Mitigation: follow the existing `engine.test.js` mock pattern.
