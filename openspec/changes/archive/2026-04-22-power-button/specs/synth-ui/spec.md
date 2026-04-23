## ADDED Requirements

### Requirement: Header strip with power button above the panels
The system SHALL render a header strip above the five control panels containing the synth name on the left and the power button on the right.

#### Scenario: Header layout
- **WHEN** the UI is rendered
- **THEN** a header strip is visible above all panels with the synth title on the left and the power button on the right

---

## MODIFIED Requirements

### Requirement: Panel layout with five sections
The system SHALL arrange controls in five labeled panels from left to right: Oscillator, Filter, Filter Env, Amp Env, Volume. The keyboard SHALL appear below all panels spanning the full width. A header strip containing the synth title and power button SHALL appear above the panels.

#### Scenario: Panel order
- **WHEN** the UI is rendered
- **THEN** panels appear in order: Oscillator | Filter | Filter Env | Amp Env | Volume, with keyboard below and header strip above

#### Scenario: Responsive to window width
- **WHEN** browser window is at least 900px wide
- **THEN** all panels are visible in a single horizontal row without horizontal scrolling

---

## REMOVED Requirements

### Requirement: Browser autoplay overlay
**Reason**: Replaced by the power button as the mechanism for browser autoplay policy compliance. The power button provides a persistent on/off control that satisfies the required user gesture without obscuring the UI.
**Migration**: Remove the `.overlay` element and `started` state from `App.svelte`. Wire power state to the `PowerButton` component instead.
