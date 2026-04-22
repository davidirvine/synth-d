## Context

A browser-based monophonic subtractive synthesizer for self-education and creative use. No existing codebase — this is a greenfield project. The design must balance DSP correctness (real audio processing), learnability (exposed, labeled modules), and implementation simplicity (one developer, no backend).

Key constraint: all audio processing happens in a Web Audio AudioWorklet on a dedicated audio thread. The main thread (UI) communicates with the worklet via message passing only — no shared mutable state.

## Goals / Non-Goals

**Goals:**
- Correct, glitch-free monophonic subtractive synthesis in the browser
- Full signal chain: oscillator → filter → VCA → master volume
- Two independent AD envelopes with musically correct one-shot behavior
- Continuous filter mode crossfade (LP/BP/HP) rather than hard switching
- Moog-aesthetic UI with reusable rotary knob component
- QWERTY keyboard + visual piano keyboard with legato behavior
- Precompile FAUST DSP locally; ship static assets only

**Non-Goals:**
- Polyphony
- MIDI device input
- Patch save/load
- Audio recording/export
- Mobile touch optimization (desktop-first)
- Real-time FAUST compilation in browser

## Decisions

### D1: FAUST → WASM precompiled with local CLI

**Decision**: Compile `synth.dsp` with `faust -lang wasm` at development time, output `.wasm` + JS wrapper into `public/`, served statically.

**Rationale**: Keeps the runtime simple — no in-browser compiler, no npm build complexity around WASM compilation. FAUST is already installed and verified. The DSP is stable once correct; recompilation is a dev-time operation.

**Alternative considered**: `@grame/faustwasm` npm plugin for Vite build-time compilation. Adds toolchain complexity without benefit at this stage.

---

### D2: AudioWorklet hosts WASM DSP

**Decision**: Load the FAUST-generated WASM inside an `AudioWorkletProcessor`. The UI sends parameter updates via `port.postMessage`.

**Rationale**: AudioWorklet runs on the audio thread with guaranteed low-latency scheduling. The FAUST-generated JS wrapper is designed to run in this context. Alternative (ScriptProcessorNode) is deprecated and runs on the main thread.

**Parameter flow**:
```
UI event (knob/key)
  → engine.js: audioWorkletNode.port.postMessage({ param, value })
  → AudioWorkletProcessor: faust DSP setParamValue(path, value)
  → WASM: next audio buffer uses new value
```

---

### D3: Waveform selection via ba.selectn (all oscillators run in parallel)

**Decision**: Generate all five waveforms simultaneously in FAUST, select one with `ba.selectn(5, waveform)`.

**Rationale**: FAUST's static graph prevents dynamic routing. Parallel generation is negligible CPU overhead for five simple oscillators. Simplest correct implementation.

**Alternative considered**: Multiple compiled FAUST variants (one per waveform). Rejected — far more complexity for no perceptible benefit.

---

### D4: Filter envelope as one-shot AD triggered on gate rising edge

**Decision**: Use `gate > gate'` (previous-sample comparison) to detect rising edge, feed as trigger into `en.ar(attack, decay)`. Envelope fires and decays to zero regardless of whether key is still held.

**Rationale**: True AD behavior — the envelope is a one-shot event, not a sustained gate. Teaches the correct mental model of envelope-as-event vs. gate-as-level. `en.ar` is attack-release; using it with a one-shot trigger gives AD semantics.

**Legato**: New key press updates frequency only — no gate pulse is sent. The FAUST rising-edge detector exists in the DSP but is unused for note-to-note transitions; legato avoids clicks on rapid presses.

---

### D5: SEM filter with continuous LP/BP/HP crossfade

**Decision**: Use `fi.svf` (FAUST stdlib state variable filter). Extract all three outputs (LP, BP, HP) and crossfade with triangular gains driven by a 0–2 `mode` parameter.

```
lpGain = max(0, 1 - mode)
bpGain = max(0, 1 - |mode - 1|)
hpGain = max(0, mode - 1)
output = lp*lpGain + bp*bpGain + hp*hpGain
```

**Rationale**: Continuous morphing is more expressive than hard switching. The triangular crossfade ensures energy is preserved at the transitions and the three pure modes are reachable at 0, 1, 2.

**Alternative considered**: Hard `ba.selectn` between filter outputs. Simpler but produces clicks when switching and loses the intermediate timbres.

---

### D6: Knob with two-layer non-linear response

**Decision**: Vertical drag maps linearly to normalized position (0.0–1.0). Normalized position maps to actual value via a per-knob curve:
- **Logarithmic** (cutoff, attack, decay, filter env amount): `value = min * (max/min)^pos`
- **Linear** (resonance, master volume): `value = min + (max - min) * pos`

Shift key reduces drag sensitivity by 10×. Double-click resets to default.

**Rationale**: Frequency and time parameters span orders of magnitude — logarithmic mapping ensures fine resolution at low values and fast sweep at high values. The drag layer stays linear so physical control feel is consistent across all knobs.

---

### D7: Svelte + Vite frontend

**Decision**: Svelte for component reactivity, Vite for dev server and bundling.

**Rationale**: Svelte's reactivity model (stores + reactive assignments) maps cleanly to synthesizer parameter state — a knob's value is just a writable store that flows to the audio engine. Vite handles WASM file serving with correct MIME types out of the box. Minimal bundle, no virtual DOM overhead.

---

## Risks / Trade-offs

**AudioWorklet WASM initialization timing** → Mitigation: Disable UI interaction until AudioContext is running and worklet is loaded. Show a "Click to start" overlay (browser autoplay policy requires user gesture before audio).

**fi.svf API signature uncertainty** → Mitigation: Verify against FAUST stdlib source before writing DSP. The SVF may need explicit signal routing syntax.

**FAUST en.ar with one-shot trigger: envelope behavior on initial key press verified correct.** Legato note transitions do not trigger the envelope, so rapid-retrigger reset is not a concern.

**Knob drag on trackpad vs. mouse** → Mitigation: Use `movementY` from `pointerlockchange` or accumulate `clientY` delta. Test on both input types.

**WASM MIME type on some static hosts** → Mitigation: Use Vite's built-in asset handling; document correct server config in README.

## Migration Plan

No existing system to migrate. Deployment is a static build (`vite build`) producing `dist/` — deployable to any static host (GitHub Pages, Netlify, etc.).

Rollback: not applicable for a new project.

## Open Questions

- Exact `fi.svf` argument order and output routing in current FAUST stdlib version — verify before writing DSP.
- Resolved: legato behavior was chosen, so rapid-retrigger envelope reset is not required.
- Octave transpose range on the oscillator panel — ±2 octaves is a reasonable starting point.
