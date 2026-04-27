## MODIFIED Requirements

### Requirement: White and pink noise source with selector
The mixer noise input SHALL offer two noise variants selectable by a toggle switch: white noise (flat spectrum) and pink noise (−3 dB/octave rolloff). The selected noise variant is the signal scaled by the noise level knob. When pink noise is selected, the noise source SHALL produce audible output at the same `noiseLevel` setting as white noise — both variants SHALL contribute equally to the mixer sum at a given level.

#### Scenario: White noise selected
- **WHEN** the noise selector is set to white
- **THEN** the noise source is flat-spectrum white noise (FAUST `no.noise`)

#### Scenario: Pink noise selected
- **WHEN** the noise selector is set to pink
- **THEN** the noise source is pink noise with −3 dB/octave rolloff (FAUST `no.pink_noise`) and audible output is present at the mixer sum when `noiseLevel` is above zero

#### Scenario: Pink noise produces output at same level as white noise
- **WHEN** the noise selector is switched from white to pink with `noiseLevel` above zero
- **THEN** audio output remains present and at comparable perceived level

#### Scenario: Noise level at zero
- **WHEN** noise level is 0 regardless of white/pink selector
- **THEN** noise contributes nothing to the filter input
