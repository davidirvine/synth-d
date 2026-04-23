# Power Button

## Purpose

Defines the power button control that manages the AudioContext lifecycle and replaces the click-to-start overlay as the mechanism for browser autoplay policy compliance. The power button defaults to off on page load and gives the user explicit control over audio output at all times.

## Requirements

### Requirement: Power button defaults to off on page load

The system SHALL render the power button in the OFF state when the page loads. No AudioContext SHALL be created and no audio SHALL be produced until the user activates the power button.

#### Scenario: Initial page load

- **WHEN** the page loads with no prior user interaction
- **THEN** the power button is in the OFF state, its power icon is unlit, and no AudioContext exists

---

### Requirement: Power on creates and starts the AudioContext

The system SHALL create the AudioContext and load the DSP engine on the first power-on activation, then resume audio output. This activation counts as the required user gesture for browser autoplay policy compliance.

#### Scenario: First power-on

- **WHEN** the user clicks the power button while it is in the OFF state for the first time
- **THEN** the AudioContext is created, the WASM DSP is loaded and connected, audio output becomes active, and the power icon lights up

#### Scenario: Power-on while loading

- **WHEN** the DSP engine is still initializing after the first power-on click
- **THEN** the power button is non-interactive (disabled) until initialization completes

---

### Requirement: Power off suspends audio immediately

The system SHALL suspend the AudioContext when the user deactivates the power button, halting all audio output immediately.

#### Scenario: Power off

- **WHEN** the user clicks the power button while it is in the ON state
- **THEN** the AudioContext is suspended, all audio output stops immediately, and the power icon goes unlit

---

### Requirement: Subsequent power-on resumes the AudioContext

The system SHALL resume the existing suspended AudioContext on any power-on after the first, without reloading or reinitializing the DSP engine.

#### Scenario: Power on after previous power off

- **WHEN** the user clicks the power button while it is in the OFF state and the AudioContext has already been initialized
- **THEN** the AudioContext is resumed, audio output resumes immediately, and the power icon lights up

---

### Requirement: Synth controls are dimmed and inert when powered off

The system SHALL render the synth panel controls with reduced opacity and block all pointer and keyboard interaction with them when the power button is in the OFF state.

#### Scenario: Controls dimmed when powered off

- **WHEN** the power button is in the OFF state
- **THEN** the main panel area has visually reduced opacity (≤ 0.5) and the `inert` attribute is applied so controls cannot be interacted with

#### Scenario: Controls active when powered on

- **WHEN** the power button is in the ON state
- **THEN** the main panel area has full opacity and all controls respond normally to pointer and keyboard events

---

### Requirement: Power button visual style matches the synth aesthetic

The power button SHALL use a tri-state color scheme on its icon to communicate the current audio engine lifecycle state. The button body remains dark (`#1c1c1c`) in all states. The icon is the universal power symbol (SVG arc and line). No text label is shown.

| State   | Icon color       | Filter                             |
| ------- | ---------------- | ---------------------------------- |
| Off     | orange `#e07820` | `drop-shadow(0 0 0px transparent)` |
| Loading | yellow `#e0c020` | `drop-shadow(0 0 0px transparent)` |
| On      | green `#20b040`  | `drop-shadow(0 0 3px #20b040)`     |

Note: off and loading use a zero-radius transparent drop-shadow rather than `filter: none` to keep the browser compositing layer present across all states, preventing sub-pixel position shifts on transition.

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
