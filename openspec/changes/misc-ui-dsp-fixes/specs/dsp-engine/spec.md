## MODIFIED Requirements

### Requirement: Audio engine exposes powerOn and powerOff functions
The audio engine module SHALL export a `powerOn()` async function and a `powerOff()` function. `powerOn()` creates the AudioContext at exactly 48 kHz (via `{ sampleRate: 48000 }`) and loads the DSP on first call; on subsequent calls it resumes a suspended AudioContext. `powerOff()` suspends the AudioContext immediately. Locking the sample rate to 48 kHz ensures the DSP's fixed `maxDelayLen = 96000` sample buffer covers the full 2-second delay range at all times.

#### Scenario: powerOn first call
- **WHEN** `powerOn()` is called for the first time
- **THEN** an AudioContext is created at 48 kHz, the WASM DSP is instantiated and connected, and the context is in the running state

#### Scenario: AudioContext sample rate is 48 kHz
- **WHEN** `powerOn()` completes
- **THEN** `ctx.sampleRate` is 48000

#### Scenario: powerOn subsequent call
- **WHEN** `powerOn()` is called after a previous `powerOff()`
- **THEN** the existing AudioContext is resumed without reloading the WASM DSP

#### Scenario: powerOff call
- **WHEN** `powerOff()` is called while the AudioContext is running
- **THEN** the AudioContext is suspended and audio output stops immediately

#### Scenario: powerOff before powerOn
- **WHEN** `powerOff()` is called before `powerOn()` has ever been called
- **THEN** `powerOff()` is a no-op and no error is thrown
