## ADDED Requirements

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

## MODIFIED Requirements

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
