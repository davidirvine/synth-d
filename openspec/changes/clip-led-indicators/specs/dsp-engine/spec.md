## ADDED Requirements

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
