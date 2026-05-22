## ADDED Requirements

### Requirement: Wheels panel with MOD and PITCH wheels

The UI SHALL present a wheels panel containing two wheels — MOD and PITCH — laid out side by side, each with a horizontally centered label ("MOD", "PITCH") above its rectangular track. Each wheel SHALL show its value as a full-width horizontal cursor line in the accent colour `#c87941` at 4px thickness (twice the knob indicator's 2px), positioned vertically by value without clipping at the track edges. The panel SHALL NOT display a standalone "WHEEL" label. A gear/settings icon button SHALL appear in the top-left of the panel.

#### Scenario: Wheels panel shows two labeled wheels
- **WHEN** the wheels panel is rendered
- **THEN** a MOD wheel and a PITCH wheel are visible, each with its centered label above its track, and a gear button is shown in the top-left

#### Scenario: Value shown as a cursor line
- **WHEN** a wheel has a value
- **THEN** a 4px full-width horizontal `#c87941` cursor line indicates the value's vertical position, with no separate filled rectangle

#### Scenario: Physics popup dismisses on Escape or outside click
- **WHEN** the physics popup is open and the user presses Escape or clicks outside it
- **THEN** the popup closes

### Requirement: Each wheel is independently focusable with keyboard control

Each wheel SHALL be an independently focusable control (`role="slider"`, in tab order MOD → PITCH → gear button) with a visible focus indicator. Arrow keys SHALL adjust whichever wheel currently has focus, and the wheel SHALL spring back to 0.5 on key release just as it does on pointer release.

#### Scenario: Arrow keys drive the focused wheel
- **WHEN** the PITCH wheel has keyboard focus and the user presses an arrow key
- **THEN** the PITCH wheel's value changes (and the MOD wheel is unaffected)

#### Scenario: Focused wheel shows a focus ring
- **WHEN** a wheel receives keyboard focus
- **THEN** a visible focus indicator is shown on that wheel

#### Scenario: Both wheels can be dragged simultaneously
- **WHEN** the user drags both wheels at once (e.g. two-finger touch)
- **THEN** each wheel tracks its own pointer independently without interfering with the other

## MODIFIED Requirements

### Requirement: Modulation panel controls

The Modulation panel SHALL contain: a mod mix knob (OSC 3 ↔ noise) and three routing toggle switches (OSC 1 pitch, OSC 2 pitch, filter cutoff). The mod wheel is no longer part of the Modulation panel; it lives in the standalone wheels panel as the MOD wheel.

#### Scenario: Modulation panel has mod mix and switches
- **WHEN** the modulation panel is rendered
- **THEN** the mod mix knob and three routing switches are all visible

#### Scenario: Mod mix knob crossfades the modulation source
- **WHEN** user turns the mod mix knob
- **THEN** the modulation source crossfades between OSC 3 output and white noise
