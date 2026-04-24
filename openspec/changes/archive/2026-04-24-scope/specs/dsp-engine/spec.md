## ADDED Requirements

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
