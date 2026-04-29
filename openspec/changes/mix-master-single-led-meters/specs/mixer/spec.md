## MODIFIED Requirements

### Requirement: Mixer panel displays a level LED indicator in the panel label row

The mixer panel SHALL display a `LevelLed` component right-aligned in the `panel-header` flex row alongside the "MIXER" label. The `LevelLed` SHALL receive `getPeak` (bound to `getMixerPeak` from the engine) and `powered` props. The `ClipLed` import SHALL be removed and replaced by `LevelLed`. The `ClipLed.svelte` and `ClipLed.test.js` files SHALL be deleted once both usages are replaced.

#### Scenario: Mixer panel header contains the level LED

- **WHEN** the mixer panel is rendered
- **THEN** the panel label row contains both the "MIXER" text and a single circular LED element right-aligned

#### Scenario: Mixer LED color reflects signal level

- **WHEN** the mixer output is at a low level (below 0.5 linear)
- **THEN** the mixer LED displays a green color

#### Scenario: Mixer LED turns red and latches on clip

- **WHEN** the mixer output exceeds 1.0 linear
- **THEN** the mixer LED displays bright red and latches for 1.5 s
