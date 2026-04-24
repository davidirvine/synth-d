# DSP Engine

## Purpose

Provides the audio processing infrastructure for the subtractive synthesizer. The DSP signal chain is authored in FAUST and compiled to WebAssembly, running inside a Web Audio AudioWorklet for low-latency, isolated audio processing. Parameter changes from the UI are communicated via message passing, and browser autoplay policy is handled gracefully.

## Requirements

### Requirement: FAUST DSP compiles to WebAssembly

The system SHALL provide a `faust/synth.dsp` FAUST source file implementing the full Model D signal chain. The DSP SHALL be compiled with the local `faust` CLI via the `faust:build` npm script to produce `public/synth.wasm` and `public/synth.json`, both placed in the `public/` directory for static serving.

#### Scenario: Successful compilation

- **WHEN** developer runs `npm run faust:build`
- **THEN** `public/synth.wasm` and `public/synth.json` are produced without errors

#### Scenario: Signal chain order

- **WHEN** an audio buffer is processed
- **THEN** signal flows: oscillator bank (OSC 1 + OSC 2 + OSC 3) → mixer (level-scaled sum + noise) → ladder filter (with ADSR contour + key tracking) → VCA (ADSR) → master volume → stereo output

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

### Requirement: Audio engine exposes powerOn and powerOff functions

The audio engine module SHALL export a `powerOn()` async function and a `powerOff()` function. `powerOn()` creates the AudioContext and loads the DSP on first call; on subsequent calls it resumes a suspended AudioContext. `powerOff()` suspends the AudioContext immediately.

#### Scenario: powerOn first call

- **WHEN** `powerOn()` is called for the first time
- **THEN** an AudioContext is created, the WASM DSP is instantiated and connected, and the context is in the running state

#### Scenario: powerOn subsequent call

- **WHEN** `powerOn()` is called after a previous `powerOff()`
- **THEN** the existing AudioContext is resumed without reloading the WASM DSP

#### Scenario: powerOff call

- **WHEN** `powerOff()` is called while the AudioContext is running
- **THEN** the AudioContext is suspended and audio output stops immediately

#### Scenario: powerOff before powerOn

- **WHEN** `powerOff()` is called before `powerOn()` has ever been called
- **THEN** `powerOff()` is a no-op and no error is thrown

---

### Requirement: Browser autoplay policy is handled

The system SHALL NOT start the AudioContext before a user gesture. The power button SHALL serve as the required user gesture. No overlay or additional prompt is required — the power button in its default OFF state communicates that audio is not yet active.

#### Scenario: Initial page load

- **WHEN** the page loads with no user interaction
- **THEN** no AudioContext is created and no audio is produced

#### Scenario: User activates power button

- **WHEN** user clicks the power button to turn it ON
- **THEN** `powerOn()` is called, the AudioContext is created and resumed, and the synth is ready to play

#### Scenario: User deactivates power button

- **WHEN** user clicks the power button to turn it OFF
- **THEN** `powerOff()` is called and the AudioContext is suspended, stopping all audio output

---

### Requirement: Audio engine exposes an AnalyserNode for visualisation

The audio engine module SHALL create a Web Audio `AnalyserNode` with `fftSize` set to 2048 and connect it inline between the FAUST worklet node and `ctx.destination`. The engine SHALL export a `getAnalyser()` function that returns the `AnalyserNode` instance, or `null` before `powerOn()` has been called.

#### Scenario: AnalyserNode is in the signal chain

- **WHEN** `powerOn()` completes
- **THEN** the signal path is: FAUST worklet node → AnalyserNode → AudioContext.destination

#### Scenario: getAnalyser returns the node after powerOn

- **WHEN** `getAnalyser()` is called after `powerOn()` has completed
- **THEN** it returns the `AnalyserNode` instance (not null)

#### Scenario: getAnalyser returns null before powerOn

- **WHEN** `getAnalyser()` is called before `powerOn()` has been called
- **THEN** it returns `null`
