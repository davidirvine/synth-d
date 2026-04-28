## MODIFIED Requirements

### Requirement: OSC 2 and OSC 3 continuous detune
OSC 2 and OSC 3 SHALL each provide a continuous detune knob spanning −100 to +100 cents (bipolar, center = 0 cents). The detune is applied as a frequency multiplier: `detunedFreq = baseFreq × pow(2, detuneCents / 1200)`. The detune knob SHALL use the `bipolar` prop so the arc extends from 12 o'clock in the direction of the current offset. The detune knob SHALL use the `'fine-center'` scale so that the center region (±10 cents) occupies a larger proportion of the knob sweep, providing finer control for subtle chorus and beating effects.

#### Scenario: Zero detune — oscillator in tune
- **WHEN** OSC 2 detune is 0 cents
- **THEN** OSC 2 produces exactly the same pitch as OSC 1 (given matching waveform and octave settings)

#### Scenario: Positive detune raises pitch
- **WHEN** OSC 2 detune is +10 cents
- **THEN** OSC 2 frequency is slightly above OSC 1, producing a chorus/beating effect

#### Scenario: Negative detune lowers pitch
- **WHEN** OSC 3 detune is −50 cents
- **THEN** OSC 3 frequency is a quarter-tone below the base keyboard frequency

#### Scenario: Fine-center scale gives more travel near zero
- **WHEN** the detune knob is turned from center to approximately 32% of its half-sweep
- **THEN** the detune value is approximately ±10 cents, not ±32 cents as linear would give
