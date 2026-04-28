## ADDED Requirements

### Requirement: Mixer panel embeds a level meter
The mixer panel SHALL display a `LevelMeter` component positioned as a vertical column alongside the source level knobs. The meter SHALL receive a `getPeak` function prop (provided by the engine) and a `powered` boolean prop. When `powered` is false the meter SHALL display all segments unlit.

#### Scenario: Level meter visible in mixer panel
- **WHEN** the mixer panel is rendered while powered on
- **THEN** a vertical LED level meter is visible alongside the oscillator and noise knobs

#### Scenario: Level meter dark when powered off
- **WHEN** the mixer panel is rendered while powered off
- **THEN** all LED meter segments are unlit
