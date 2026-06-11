## MODIFIED Requirements

### Requirement: Resonance control with self-oscillation

The filter SHALL accept a resonance parameter spanning 0–1 (linear). The full knob range SHALL map into the filter such that high knob values drive the filter into its near-self-oscillation region; at values approaching the top of the range the filter SHALL ring strongly and approach self-oscillation, producing a pitched tone at the cutoff frequency. No artificial cap below the filter's stability ceiling SHALL be imposed — in particular, the effective resonance SHALL be allowed to reach the documented `ve.moog_vcf_2bn` stability ceiling (≈0.97 at SR = 48 kHz), so the high-resonance "squelch" zone is reachable. The only permitted limit is a stability ceiling at (or just below) the point where the filter becomes unstable; its exact value is listening-tuned at the audio-verification gate and is not fixed by this spec.

#### Scenario: Low resonance produces gentle peak

- **WHEN** resonance is 0.3 and a signal passes through
- **THEN** a slight emphasis is audible at the cutoff frequency

#### Scenario: High resonance reaches the near-self-oscillation zone

- **WHEN** the resonance knob is set near the top of its range (near 1.0)
- **THEN** the filter rings strongly and approaches self-oscillation, producing a prominent pitched tone at the cutoff frequency — the effective resonance is driven up to the stability ceiling (≈0.97), not capped at the former 0.7 limit

#### Scenario: Resonance is not artificially capped below the squelch zone

- **WHEN** the resonance knob is swept from 0 to 1
- **THEN** the effective resonance applied to the filter rises continuously into the high-resonance / near-self-oscillation region, and is never clamped to a value (such as the former 0.7) that would prevent the squelch zone from being reached

#### Scenario: Filter stays stable at the resonance ceiling

- **WHEN** resonance is at maximum and audio passes through at SR = 48 kHz
- **THEN** the filter output remains bounded and stable (no runaway resonance, NaN, or denormal blow-up); loud self-oscillation is expected and is managed by master volume

### Requirement: Cutoff modulation input smoothing

The modulation component of the cutoff sum (`filterModHz`) SHALL be passed through a one-pole IIR smoother with a time constant of approximately 5 ms before it enters `ve.moog_vcf`. This prevents audio-rate transients on the modulation path from destabilising the filter, which can manifest as pops or resonance runaway when OSC 3 or noise is used as a modulation source.

#### Scenario: Audio-rate modulation source does not cause filter instability

- **WHEN** OSC 3 is in audio-frequency mode, routed to filter modulation at non-zero depth, with resonance set near the resonance ceiling (≈0.95)
- **THEN** the filter output remains stable with no audible pops or runaway resonance

#### Scenario: LFO-rate modulation is unaffected perceptibly

- **WHEN** OSC 3 is in LFO mode at 5 Hz, routed to filter modulation
- **THEN** the cutoff sweeps smoothly and the 5 ms smoother introduces no audible lag

### Requirement: Final cutoff frequency signal is slew-rate limited before entering the VCF

The fully-summed, clamped `cutoffMod` value — which includes base cutoff, key tracking, filter envelope contribution, and modulation — SHALL be passed through a one-pole IIR smoother with a time constant of approximately 2 ms before being supplied to `ve.moog_vcf`. This prevents discontinuous jumps in the cutoff coefficient from destabilising the filter's internal feedback state, regardless of whether the jump originates from the envelope, a MIDI CC sweep, key tracking, or any combination.

#### Scenario: Fast filter envelope does not crash the filter

- **WHEN** `filterEnvAmt` is set to 8000 Hz or above, `filterAttack` is at its minimum (0.001 s), resonance is above 0.5, and a note is triggered
- **THEN** the filter output remains stable with no NaN, silence, or audio worklet crash

#### Scenario: Rapid MIDI CC on filterEnvAmt does not crash the filter

- **WHEN** a MIDI CC mapped to `filterEnvAmt` is swept from 0 to 127 in less than 100 ms while a note is held with resonance near the resonance ceiling (≈0.95)
- **THEN** the filter output remains stable and the cutoff sweep is audible without pops or silence

#### Scenario: 2 ms smoother does not audibly degrade normal envelope sweeps

- **WHEN** `filterEnvAmt` is set to 2000 Hz and `filterAttack` is 10 ms or longer
- **THEN** the filter opens with no perceptible delay or rounding compared to the unsmoothed case

## ADDED Requirements

### Requirement: Fixed input drive feeds the ladder

The filter input SHALL be driven into the ladder with a fixed gain greater than unity applied to the mixer signal before the pre-filter saturation stage, so that more level reaches the saturating ladder and the high-resonance peak overdrives and fattens, producing the rubbery "squelch" character. The drive SHALL be a fixed internal DSP constant — there SHALL be no user-facing drive/overdrive control in this capability. The exact gain value is listening-tuned at the audio-verification gate and is not fixed by this spec, but SHALL be greater than 1 and no greater than 3 — this upper fence keeps the audio gate from turning the synth into a distortion box (beyond ≈3 the input hard-clips through the `tanh` before the filter sees it). The drive SHALL be applied **after** the `attach(mixerOut, mixerPeak)` expression so the `mixerPeak` meter continues to report the undriven mixer level.

#### Scenario: Driven input saturates the high-resonance peak

- **WHEN** resonance is high and a signal passes through the filter
- **THEN** the resonant peak audibly saturates and fattens compared to an undriven input, giving a rubbery, vocal squelch rather than a clean ring

#### Scenario: Drive is fixed, with no user control

- **WHEN** a player inspects the filter controls
- **THEN** no drive or overdrive knob, slider, or toggle is present; the drive is a fixed internal constant applied ahead of the filter

#### Scenario: Low-resonance, low-level tones remain usable

- **WHEN** resonance is low and the input signal is at a moderate level
- **THEN** the fixed drive does not render the sound unusably distorted; the filter still produces clean low-resonance tones

#### Scenario: Mixer peak meter is unaffected by the drive

- **WHEN** the drive gain is applied ahead of the filter
- **THEN** the `mixerPeak` meter reports the undriven mixer level (the drive is applied after the `attach(mixerOut, mixerPeak)` expression), so the meter is not inflated by the drive
