## MODIFIED Requirements

### Requirement: Tape delay DSP stage inserted after master volume and before reverb

The system SHALL implement a tape-delay-modelled feedback delay stage in `faust/synth.dsp` positioned after `masterVol` and before the shimmer reverb stage. The delay SHALL use `de.fdelay` (linear interpolation, tape character) with a slow wow/flutter LFO (≈ 0.5 Hz, ±0.3% of delay time) modulating the read position. The feedback path SHALL include a first-order low-pass filter at 6 kHz (`fi.lowpass(1, 6000)`) to darken successive repeats and `ma.tanh` soft saturation to model tape saturation. The feedback coefficient SHALL be capped via `max(0) : min(0.9)` to prevent unbounded buildup. When `delayOn` is 0 the delay input SHALL be driven with zeros so the buffer stays silent and enabling delay for the first time produces no jarring burst of buffered audio. The wet/dry blend SHALL be controlled by `delayMix` (0–1). A `delayOn` parameter (0 or 1, default 0) SHALL bypass the entire delay stage via `select2` when 0. Default values: `delayOn` = 0, `delayTime` = 0.3 s, `delayFeedback` = 0.3, `delayMix` = 0.3.

The `delayTime` control value SHALL be rate-limit-slewed before it reaches `de.fdelay`: the slewed time SHALL change by at most a fixed `slewStep` (a tuned constant, expressed in delay-samples per audio sample) on any single sample, modelling capstan-motor inertia, after which it SHALL pass through a light one-pole smoother (`si.smoo`) to round the start and end corners of the glide. The rate limiter SHALL be applied to the base `delayTime` value; the wow and `delayMod` LFOs SHALL ride on the slewed value, and the `min`/`max` sample clamp SHALL remain downstream of the slew so the resulting read offset stays within `[1, maxDelayLen - 1]`. The fixed `slewStep` SHALL bound the maximum pitch-bend depth independently of how far the time changes, so that the glide duration scales with the size of the time change while the bend depth stays constant. The slew SHALL NOT be exposed as a UI control, parameter, default, or MIDI-learnable mapping; it is fixed internal character.

#### Scenario: delayOn at zero bypasses the delay

- **WHEN** `delayOn` is 0
- **THEN** the VCA output passes through unchanged with no delay repeats audible

#### Scenario: delayOn at one activates delay repeats

- **WHEN** `delayOn` is 1 and `delayMix` is greater than 0
- **THEN** audible delay repeats are heard after the initial note

#### Scenario: Delay repeats ring freely after VCA closes

- **WHEN** `delayOn` is 1, `delayFeedback` is greater than 0, and the note is released (VCA closes)
- **THEN** delay repeats continue to decay after the VCA output reaches zero

#### Scenario: Delay output feeds into reverb stage

- **GIVEN** an audio signal is present, a note is playing, and `delayTime` is 0.3 s (the default)
- **WHEN** `delayOn` is 1, `reverbOn` is 1, and `delayFeedback` is greater than 0
- **THEN** the output signal in a 500 ms window beginning at note-off has non-zero energy that exceeds the dry-only baseline, confirming delay signal is entering the reverb wet path

#### Scenario: Tape character — repeats darken and soften over time

- **WHEN** `delayOn` is 1 and `delayFeedback` is greater than 0
- **THEN** each successive delay repeat is noticeably darker (high frequencies attenuated) than the previous one, and the repeats exhibit subtle pitch wavering from the wow LFO

#### Scenario: Mix at zero passes dry signal only

- **WHEN** `delayOn` is 1 and `delayMix` is 0
- **THEN** no delay repeats are audible; only the dry signal is present

#### Scenario: Mix at one passes wet signal only

- **WHEN** `delayOn` is 1 and `delayMix` is 1
- **THEN** the output consists entirely of the delay wet signal; the dry signal is absent

#### Scenario: Feedback at zero produces single repeat

- **WHEN** `delayOn` is 1, `delayFeedback` is 0, and `delayMix` is greater than 0
- **THEN** a single delayed copy of the signal is heard with no further repeats

#### Scenario: Feedback near 0.9 produces long-decaying repeats

- **WHEN** `delayOn` is 1 and `delayFeedback` is 0.9
- **THEN** multiple repeats are audible, decaying slowly over several seconds

#### Scenario: Feedback coefficient is capped at 0.9 in the DSP

- **WHEN** `delayFeedback` is set to any value via UI or MIDI CC
- **THEN** the feedback gain applied inside the delay circuit is clamped to [0, 0.9], preventing self-oscillation and negative-feedback phase inversion

#### Scenario: Enabling delay produces no burst of buffered audio

- **WHEN** `delayOn` transitions from 0 to 1 for the first time
- **THEN** no delay repeats from before the toggle are audible; the first repeat arrives one `delayTime` after the toggle

#### Scenario: Time change glides smoothly with a tape-style pitch slide

- **WHEN** `delayTime` is adjusted while `delayOn` is 1, `delayFeedback` is greater than 0, and audio is playing
- **THEN** the repeats already circulating in the feedback path Doppler-shift into a smooth, continuous pitch glide toward the new time with no hard click or teleport, the glide direction follows the time change (downward in pitch as time increases, upward as it decreases), and the read offset never leaves `[1, maxDelayLen - 1]`

#### Scenario: Larger time changes glide for longer at the same bend depth

- **WHEN** two `delayTime` changes of different magnitudes are made while `delayOn` is 1 and audio is playing
- **THEN** the larger time change takes proportionally longer to reach its target while the peak pitch-bend depth of both glides is the same, consistent with a fixed slew rate
