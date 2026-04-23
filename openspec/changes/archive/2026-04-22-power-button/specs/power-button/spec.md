## ADDED Requirements

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
- **THEN** the AudioContext is created, the WASM DSP is loaded and connected, audio output becomes active, and the power button power icon lights up

#### Scenario: Power-on while loading
- **WHEN** the DSP engine is still initializing after the first power-on click
- **THEN** the power button is non-interactive (disabled) until initialization completes

---

### Requirement: Power off suspends audio immediately
The system SHALL suspend the AudioContext when the user deactivates the power button, halting all audio output immediately.

#### Scenario: Power off
- **WHEN** the user clicks the power button while it is in the ON state
- **THEN** the AudioContext is suspended, all audio output stops immediately, and the power button power icon goes unlit

---

### Requirement: Subsequent power-on resumes the AudioContext
The system SHALL resume the existing suspended AudioContext on any power-on after the first, without reloading or reinitializing the DSP engine.

#### Scenario: Power on after previous power off
- **WHEN** the user clicks the power button while it is in the OFF state and the AudioContext has already been initialized
- **THEN** the AudioContext is resumed, audio output resumes immediately, and the power button power icon lights up

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
The power button SHALL use the Moog-inspired dark theme: dark body (`#1c1c1c`), amber power icon (`#c87941`) with glow when ON, unlit (`#3a3a3a`) when OFF. The icon is the universal power symbol (SVG arc and line). No text label is shown.

#### Scenario: Power button ON appearance
- **WHEN** the power button is in the ON state
- **THEN** the power icon is amber (`#c87941`) with a drop-shadow glow and is visibly distinct from the surrounding panel

#### Scenario: Power button OFF appearance
- **WHEN** the power button is in the OFF state
- **THEN** the power icon is dark (`#3a3a3a`), indicating no active audio
