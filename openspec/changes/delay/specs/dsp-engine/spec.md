## MODIFIED Requirements

### Requirement: FAUST DSP compiles to WebAssembly

The system SHALL provide a `faust/synth.dsp` FAUST source file implementing the full synthesizer signal chain. The DSP SHALL be compiled with the local `faust` CLI via the `faust:build` npm script to produce `public/synth.wasm` and `public/synth.json`, both placed in the `public/` directory for static serving.

#### Scenario: Successful compilation

- **WHEN** developer runs `npm run faust:build`
- **THEN** `public/synth.wasm` and `public/synth.json` are produced without errors

#### Scenario: Signal chain order

- **WHEN** an audio buffer is processed
- **THEN** signal flows: oscillator bank (OSC 1 + OSC 2 + OSC 3) → mixer (level-scaled sum + noise) → ladder filter (with ADSR contour + key tracking) → VCA (ADSR) → master volume → tape delay (bypass when delayOn = 0) → shimmer reverb (bypass when reverbOn = 0) → stereo output
