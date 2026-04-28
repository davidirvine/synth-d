## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: DSP signal chain includes pre-filter soft clipping and resonance safety cap
The FAUST DSP signal chain SHALL apply `ma.tanh` to the mixer output before passing it to the ladder filter, replicating the natural soft saturation of the analog ladder's input stage. The resonance parameter SHALL be capped internally at 0.97 before being passed to `ve.moog_vcf`, preventing the digital filter from reaching the mathematical singularity at resonance=1.0. These protections SHALL be transparent to the user — the resonance knob range and all other parameters remain unchanged.

#### Scenario: Hot mixer signal does not crash the filter
- **WHEN** all four mixer sources (OSC 1, OSC 2, OSC 3, noise) are at full level simultaneously with high resonance
- **THEN** the filter output remains a finite, non-NaN signal and audio continues

#### Scenario: Resonance at maximum does not produce NaN
- **WHEN** the resonance knob is at its maximum value (1.0)
- **THEN** the DSP applies a cap of 0.97 internally and the filter self-oscillates without producing NaN or silencing the AudioContext
