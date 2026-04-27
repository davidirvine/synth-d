## ADDED Requirements

### Requirement: Final cutoff frequency signal is hard-clamped to 18 000 Hz

The fully-summed `cutoffMod` value SHALL be clamped to a maximum of 18 000 Hz before the smoother and before `ve.moog_vcf`. This keeps the filter below its mathematical stability limit (`4·r·(g/(1+g))⁴ < 1`) for all resonance values up to the 0.97 cap at SR 48 kHz.

#### Scenario: Total cutoff never reaches the VCF instability region

- **WHEN** `cutoff`, `filterEnvAmt`, and key tracking combine to exceed 18 000 Hz
- **THEN** the summed `cutoffMod` is clamped to 18 000 Hz and the filter remains stable

### Requirement: Final cutoff frequency signal is slew-rate limited before entering the VCF

The fully-summed, clamped `cutoffMod` value — which includes base cutoff, key tracking, filter envelope contribution, and modulation — SHALL be passed through a one-pole IIR smoother with a time constant of approximately 2 ms before being supplied to `ve.moog_vcf`. This prevents discontinuous jumps in the cutoff coefficient from destabilising the filter's internal feedback state, regardless of whether the jump originates from the envelope, a MIDI CC sweep, key tracking, or any combination.

#### Scenario: Fast filter envelope does not crash the filter

- **WHEN** `filterEnvAmt` is set to 8000 Hz or above, `filterAttack` is at its minimum (0.001 s), resonance is above 0.5, and a note is triggered
- **THEN** the filter output remains stable with no NaN, silence, or audio worklet crash

#### Scenario: Rapid MIDI CC on filterEnvAmt does not crash the filter

- **WHEN** a MIDI CC mapped to `filterEnvAmt` is swept from 0 to 127 in less than 100 ms while a note is held with resonance above 0.7
- **THEN** the filter output remains stable and the cutoff sweep is audible without pops or silence

#### Scenario: 2 ms smoother does not audibly degrade normal envelope sweeps

- **WHEN** `filterEnvAmt` is set to 2000 Hz and `filterAttack` is 10 ms or longer
- **THEN** the filter opens with no perceptible delay or rounding compared to the unsmoothed case

### Requirement: Filter output is tanh-saturated

The signal produced by `ve.moog_vcf` SHALL be passed through `ma.tanh` before continuing to the VCA stage. This provides a secondary safeguard: if any transient instability in the filter produces a large-amplitude spike, `ma.tanh` soft-clips it to the ±1 range, preventing the spike from propagating through the remainder of the signal chain.

#### Scenario: Normal-amplitude signal passes through unmodified

- **WHEN** the filter output is within normal operating range (peak amplitude < 0.5)
- **THEN** the tanh stage introduces no audible saturation or level change

#### Scenario: Instability spike is contained at the filter output

- **WHEN** a filter transient produces a signal spike above 1.0 in amplitude
- **THEN** the spike is soft-clipped by tanh before it reaches the VCA, preventing downstream NaN or silence
