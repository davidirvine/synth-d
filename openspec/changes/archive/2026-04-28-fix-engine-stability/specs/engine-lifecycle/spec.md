## ADDED Requirements

### Requirement: Power-off performs full WASM teardown
When the power button is toggled off, the engine SHALL disconnect the DSP AudioWorklet node from the audio graph, close the AudioContext, and null all engine references (`ctx`, `node`, `analyserNode`). After teardown the engine SHALL be in the same state as before the first power-on. The `initialized` flag SHALL be removed; teardown state is implied by null references.

#### Scenario: Power-off disconnects and closes context
- **WHEN** the power button is toggled off
- **THEN** the AudioWorklet node is disconnected, the AudioContext is closed, and all engine references are null

#### Scenario: Power-off from crashed context
- **WHEN** the AudioContext has entered a closed or failed state and the power button is toggled off
- **THEN** teardown completes without error (references are nulled regardless of context state)

---

### Requirement: Power-on always performs full initialisation
When the power button is toggled on, the engine SHALL always fetch the WASM module, compile it, create a new AudioContext, instantiate a new AudioWorklet node, and connect the audio graph — regardless of whether a previous session existed. There SHALL be no early-return path based on a cached `initialized` flag.

#### Scenario: First power-on initialises fresh
- **WHEN** the power button is toggled on for the first time
- **THEN** a new AudioContext is created, the WASM DSP is compiled and loaded, and audio is ready to play

#### Scenario: Subsequent power-on also initialises fresh
- **WHEN** the power button is toggled on after a previous power-off
- **THEN** a new AudioContext and DSP node are created, identical to the first power-on

#### Scenario: Power-on after crash recovers fully
- **WHEN** the power button is toggled on after a NaN crash that silenced the previous AudioContext
- **THEN** a new healthy AudioContext and DSP node are created and audio plays correctly
