## MODIFIED Requirements

### Requirement: Mixer panel displays a clip LED indicator in the panel label row

The mixer panel SHALL display a `ClipLed` component right-aligned in the `panel-header` flex row alongside the "MIXER" label. The `ClipLed` SHALL receive `getPeak` (bound to `getMixerPeak` from the engine) and `powered` props. The existing `panel-header` structure SHALL be retained; the `LevelMeter` component import and usage SHALL be replaced by `ClipLed`. The `LevelMeter.svelte` and `LevelMeter.test.js` files SHALL be deleted.

#### Scenario: Mixer panel header contains the clip LED

- **WHEN** the mixer panel is rendered
- **THEN** the panel label row contains both the "MIXER" text and a single circular LED element right-aligned

#### Scenario: LED is dark at rest

- **WHEN** the synth is powered and mixer output is below the clip threshold
- **THEN** the LED displays dim red

#### Scenario: LED lights when mixer output clips

- **WHEN** the pre-filter mixer signal exceeds 1.0 (driving the ma.tanh into saturation)
- **THEN** the LED displays bright red and latches for 1.5 s

#### Scenario: LED goes dark when synth is powered off

- **WHEN** the synth is powered off
- **THEN** the LED returns to dim red and polling stops
