## MODIFIED Requirements

### Requirement: Power button visual style matches the synth aesthetic
The power button SHALL use a tri-state color scheme on its icon to communicate the current audio engine lifecycle state. The button body remains dark (`#1c1c1c`) in all states. The icon is the universal power symbol (SVG arc and line). No text label is shown.

| State   | Icon color | Glow |
|---------|-----------|------|
| Off     | orange `#e07820` | none |
| Loading | yellow `#e0c020` | none |
| On      | green `#20b040`  | `drop-shadow(0 0 3px #20b040)` |

#### Scenario: Power button ON appearance
- **WHEN** the power button is in the ON state
- **THEN** the power icon is green (`#20b040`) with a drop-shadow glow, visibly distinct from the surrounding panel

#### Scenario: Power button OFF appearance
- **WHEN** the power button is in the OFF state
- **THEN** the power icon is orange (`#e07820`), indicating the engine is stopped and ready to start

#### Scenario: Power button loading appearance
- **WHEN** the DSP engine is initializing after the first power-on click
- **THEN** the power icon is yellow (`#e0c020`) and the button is non-interactive, signaling that the engine is starting up

#### Scenario: Icon color transitions smoothly between states
- **WHEN** the power button changes state (off → loading, loading → on, on → off)
- **THEN** the icon color fades smoothly to the new color over approximately 0.3 s rather than switching instantly
