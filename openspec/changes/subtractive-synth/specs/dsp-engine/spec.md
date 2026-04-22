## ADDED Requirements

### Requirement: FAUST DSP compiles to WebAssembly
The system SHALL provide a `synth.dsp` FAUST source file implementing the full signal chain. The DSP SHALL be compiled with the local `faust` CLI to produce a `.wasm` binary and a JavaScript wrapper, both placed in the `public/` directory for static serving.

#### Scenario: Successful compilation
- **WHEN** developer runs `faust -lang wasm synth.dsp -o public/synth.wasm`
- **THEN** `public/synth.wasm` and `public/synth.js` are produced without errors

#### Scenario: Signal chain order
- **WHEN** an audio buffer is processed
- **THEN** signal flows: oscillator → filter → VCA → master volume → stereo output

---

### Requirement: DSP runs in AudioWorklet
The system SHALL load the FAUST WASM module inside a Web Audio `AudioWorkletProcessor`, ensuring DSP runs on the dedicated audio thread with low-latency scheduling.

#### Scenario: Worklet registration
- **WHEN** the audio engine initializes
- **THEN** the AudioWorklet module is registered and the WASM DSP is instantiated inside the processor before any audio plays

#### Scenario: Audio thread isolation
- **WHEN** the UI main thread is busy (e.g., DOM updates)
- **THEN** audio processing continues without glitches or dropouts

---

### Requirement: Parameters flow from UI to DSP via message passing
The system SHALL communicate all parameter changes (frequency, gate, knob values) from the main thread to the AudioWorklet via `port.postMessage`. The DSP SHALL apply parameter changes on the next audio buffer boundary.

#### Scenario: Knob value reaches DSP
- **WHEN** user adjusts a knob in the UI
- **THEN** the corresponding FAUST parameter is updated in the WASM DSP within one audio buffer

#### Scenario: Gate triggers envelope
- **WHEN** a keyboard key is pressed
- **THEN** gate=1 message is sent to DSP, triggering both AD envelopes

---

### Requirement: Browser autoplay policy is handled
The system SHALL NOT start the AudioContext before a user gesture. A visible prompt SHALL be shown until the user interacts, at which point the AudioContext is created and resumed.

#### Scenario: Initial page load
- **WHEN** the page loads with no user interaction
- **THEN** a "Click to start" overlay is displayed and no audio context is created

#### Scenario: User gesture starts audio
- **WHEN** user clicks the start overlay or any synth control
- **THEN** AudioContext is created and resumed, overlay is dismissed, synth is ready to play
