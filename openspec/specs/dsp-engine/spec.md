# DSP Engine

## Purpose

Provides the audio processing infrastructure for the subtractive synthesizer. The DSP signal chain is authored in FAUST and compiled to WebAssembly, running inside a Web Audio AudioWorklet for low-latency, isolated audio processing. Parameter changes from the UI are communicated via message passing, and browser autoplay policy is handled gracefully.
## Requirements
### Requirement: FAUST DSP compiles to WebAssembly

The system SHALL provide a `faust/synth.dsp` FAUST source file implementing the full synthesizer signal chain. The DSP SHALL be compiled with the local `faust` CLI via the `faust:build` npm script to produce `public/synth.wasm` and `public/synth.json`, both placed in the `public/` directory for static serving.

#### Scenario: Successful compilation

- **WHEN** developer runs `npm run faust:build`
- **THEN** `public/synth.wasm` and `public/synth.json` are produced without errors

#### Scenario: Signal chain order

- **WHEN** an audio buffer is processed
- **THEN** signal flows: oscillator bank (OSC 1 + OSC 2 + OSC 3) → mixer (level-scaled sum + noise) → ladder filter (with ADSR contour + key tracking) → VCA (ADSR) → master volume → tape delay (bypass when delayOn = 0) → shimmer reverb (bypass when reverbOn = 0) → stereo output

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
The audio engine module SHALL export a `powerOn()` async function and a `powerOff()` async function. `powerOn()` SHALL always create a new AudioContext, fetch and compile the WASM DSP, instantiate a new AudioWorklet node, and connect the audio graph — on every call, without exception. `powerOff()` SHALL disconnect the AudioWorklet node, close the AudioContext, and null all engine-level references (`ctx`, `node`, `analyserNode`). There SHALL be no `initialized` flag or early-return path in `powerOn()`.

#### Scenario: powerOn first call
- **WHEN** `powerOn()` is called for the first time
- **THEN** a new AudioContext is created, the WASM DSP is compiled and instantiated, and the context is in the running state

#### Scenario: powerOn after powerOff
- **WHEN** `powerOn()` is called after a previous `powerOff()`
- **THEN** a new AudioContext and DSP node are created from scratch, identical to the first power-on

#### Scenario: powerOn after NaN crash
- **WHEN** `powerOn()` is called after a DSP NaN crash that closed the previous AudioContext
- **THEN** a new healthy AudioContext and DSP node are created and audio plays correctly

#### Scenario: powerOff disconnects and closes
- **WHEN** `powerOff()` is called while the AudioContext is running
- **THEN** the AudioWorklet node is disconnected, the AudioContext is closed, all references are null, and audio stops immediately

#### Scenario: powerOff before powerOn
- **WHEN** `powerOff()` is called before `powerOn()` has ever been called
- **THEN** `powerOff()` is a no-op and no error is thrown

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

### Requirement: DSP signal chain includes pre-filter soft clipping and resonance safety cap
The FAUST DSP signal chain SHALL apply `ma.tanh` to the mixer output before passing it to the ladder filter, replicating the natural soft saturation of the analog ladder's input stage. The resonance parameter SHALL be capped internally at 0.97 before being passed to `ve.moog_vcf`, preventing the digital filter from reaching the mathematical singularity at resonance=1.0. These protections SHALL be transparent to the user — the resonance knob range and all other parameters remain unchanged.

#### Scenario: Hot mixer signal does not crash the filter
- **WHEN** all four mixer sources (OSC 1, OSC 2, OSC 3, noise) are at full level simultaneously with high resonance
- **THEN** the filter output remains a finite, non-NaN signal and audio continues

#### Scenario: Resonance at maximum does not produce NaN
- **WHEN** the resonance knob is at its maximum value (1.0)
- **THEN** the DSP applies a cap of 0.97 internally and the filter self-oscillates without producing NaN or silencing the AudioContext

### Requirement: Engine exposes pre-filter mixer peak level
The audio engine SHALL export a `getMixerPeak()` function that returns the current pre-filter mixer output peak as a linear value in the range 0–4. When the engine is powered off (node is null) the function SHALL return 0. The value is sourced from a FAUST `vbargraph` parameter computed inside the DSP before the `ma.tanh` soft clipper.

#### Scenario: getMixerPeak returns 0 when powered off
- **WHEN** `getMixerPeak()` is called while the engine is off
- **THEN** it returns 0 without error

#### Scenario: getMixerPeak returns a positive value during audio playback
- **WHEN** a note is playing with at least one oscillator level above zero
- **THEN** `getMixerPeak()` returns a positive value greater than 0

### Requirement: Output peak vbargraph exposes pre-master-tanh signal level

The DSP SHALL include a `vbargraph` measuring `abs(vcaOut × (masterVol / 0.6))` — the signal amplitude immediately before the master output `ma.tanh` saturation stage. The vbargraph SHALL be labelled `"outputPeak [unit:linear]"` with range `[0, 2]`. It SHALL be attached to the `masterOut` signal path using the `attach` primitive to prevent dead-code elimination, following the same pattern as the existing `mixerPeak` bargraph. The peak value SHALL be delivered to the main thread via the `setOutputParamHandler` callback at path `/synth/outputPeak`.

#### Scenario: outputPeak reports zero at silence

- **WHEN** no note is playing and all mixer levels are zero
- **THEN** the value delivered by `setOutputParamHandler` for `/synth/outputPeak` is 0

#### Scenario: outputPeak exceeds 1.0 when master output saturates

- **WHEN** the pre-master-tanh intermediate value exceeds 1.0 (masterVol above ~0.6 with full-amplitude signal)
- **THEN** the value delivered for `/synth/outputPeak` exceeds 1.0, indicating active saturation

### Requirement: getOutputPeak exports the latest output peak value

The audio engine module SHALL export a `getOutputPeak()` function that returns the most recent `outputPeak` value received from the DSP via `setOutputParamHandler`. The function SHALL return `0` before `powerOn()` has been called or after `powerOff()`. The `setOutputParamHandler` callback SHALL handle both `mixerPeak` and `outputPeak` paths in a single registration, since only one handler may be registered per node.

#### Scenario: getOutputPeak returns 0 before powerOn

- **WHEN** `getOutputPeak()` is called before `powerOn()` has completed
- **THEN** it returns `0`

#### Scenario: getOutputPeak returns live values after powerOn

- **WHEN** `powerOn()` has completed and a note is playing
- **THEN** `getOutputPeak()` returns a value reflecting the current pre-master-tanh amplitude

#### Scenario: getOutputPeak resets to 0 after powerOff

- **WHEN** `powerOff()` is called
- **THEN** `getOutputPeak()` returns `0`

#### Scenario: Both mixerPeak and outputPeak are captured in one handler

- **WHEN** the audio worklet fires an output parameter callback
- **THEN** both `/synth/mixerPeak` and `/synth/outputPeak` are handled by the single registered `setOutputParamHandler`, with no handler being overwritten by a second registration

### Requirement: setParam rejects non-finite values

The `setParam` function in the audio engine SHALL validate that the `value` argument is a finite number before forwarding it to the DSP node. If `value` is `NaN`, `Infinity`, or `-Infinity`, the call SHALL be silently discarded and the DSP node SHALL NOT be called. This provides a system-boundary guard against corrupt or unexpected values reaching the FAUST DSP regardless of their origin (MIDI scaling, corrupt localStorage, programming errors in future code).

#### Scenario: Finite value is forwarded normally

- **WHEN** `setParam` is called with a finite numeric value
- **THEN** `node.setParamValue` is called with that value and the DSP parameter is updated

#### Scenario: NaN value is silently discarded

- **WHEN** `setParam` is called with `NaN` as the value
- **THEN** `node.setParamValue` is NOT called and no error is thrown

#### Scenario: Infinity value is silently discarded

- **WHEN** `setParam` is called with `Infinity` or `-Infinity` as the value
- **THEN** `node.setParamValue` is NOT called and no error is thrown

#### Scenario: Guard does not affect normal parameter flow

- **WHEN** knob interactions, MIDI CC messages, and note events produce parameter values
- **THEN** all values pass the `isFinite` check and reach the DSP without observable delay or change

