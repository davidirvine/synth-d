# Synth UI

## Purpose

Defines the overall layout, visual aesthetic, and panel-level controls for the subtractive synthesizer user interface. The UI is organized into six labeled control panels arranged above a full-width keyboard, applying a consistent Moog-inspired dark theme throughout.
## Requirements
### Requirement: Header strip with power button above the panels

The system SHALL render a header strip above the control panels containing the synth name on the left, MIDI status in the middle, and the power button on the right. The header strip SHALL have a fixed, content-driven width that does not change when the browser window is resized. The header strip's left and right edges SHALL overhang the panel grid below it by equal amounts.

#### Scenario: Header layout

- **WHEN** the UI is rendered
- **THEN** a header strip is visible above all panels with the synth title on the left and the power button on the right

#### Scenario: Header does not resize with the window

- **WHEN** the browser window is resized to any width
- **THEN** the header strip width remains constant and does not stretch to fill the viewport

#### Scenario: Header overhangs are symmetric

- **WHEN** the UI is rendered
- **THEN** the distance from the left edge of the header to the left edge of the panel grid equals the distance from the right edge of the panel grid to the right edge of the header

### Requirement: Product name is SYNTH-D

The header strip title SHALL read "SYNTH-D". The browser window `<title>` element SHALL also read "SYNTH-D".

#### Scenario: Header title text

- **WHEN** the UI is rendered
- **THEN** the header title text reads "SYNTH-D"

#### Scenario: Browser window title

- **WHEN** the application loads
- **THEN** the browser tab title reads "SYNTH-D"

---

### Requirement: Panel layout with six sections

The system SHALL arrange controls in six labeled panels: Oscillator Bank, Mixer, Filter (combined with filter contour envelope), Output (combined volume and loudness contour), Modulation, and Glide. The three top-level panel columns (Oscillator Bank, Mixer, and the filter-output grid) SHALL be laid out as a fixed three-column CSS grid. All three columns SHALL share the same height. The keyboard SHALL appear below all panels spanning the full width. A footer row containing the GitHub icon link SHALL appear below the keyboard. A header strip containing the synth title, MIDI status, and power button SHALL appear above the panels. The outer spacing around the synth module area SHALL be `8px` on all sides, matching the `8px` gap between individual panels. The layout SHALL NOT reflow or wrap when the browser window is resized.

#### Scenario: Panel arrangement

- **WHEN** the UI is rendered
- **THEN** panels appear with header above, then three columns: Oscillator Bank | Mixer | filter-output-grid ([Filter/AmpEnv/Effects] over [Modulation+Glide/Scope]), keyboard below, footer row with GitHub icon below the keyboard

#### Scenario: All top-level columns the same height

- **WHEN** the UI is rendered
- **THEN** the Oscillator Bank, Mixer, and filter-output-grid columns all share the same bottom edge

#### Scenario: Outer spacing matches inter-panel gap

- **WHEN** the UI is rendered
- **THEN** the space between the edge of the viewport and the nearest panel edge is `8px`, equal to the gap between panels

#### Scenario: No reflow on resize

- **WHEN** the browser window is resized to any width
- **THEN** the three top-level panel columns remain in a single row and do not wrap or reorder

### Requirement: Moog dark visual aesthetic

The system SHALL apply a consistent dark visual theme throughout:

- Background: `#111111`
- Panel background: `#1c1c1c` with a 1px `#333` border
- Knob body: `#2a2a2a`
- Knob indicator line: amber `#c87941`
- All text labels: cream `#e8dcc8`
- White piano keys: `#dddddd`
- Black piano keys: `#1a1a1a`
- Active key highlight: amber `#c87941`
- Font: monospace (system-ui monospace stack or `JetBrains Mono` if available)

#### Scenario: Consistent theming

- **WHEN** any panel is rendered
- **THEN** all colors match the defined palette with no default browser colors visible

---

### Requirement: Oscillator panel controls

The Oscillators panel SHALL contain three oscillator sub-sections (OSC 1, OSC 2, OSC 3). Each sub-section SHALL provide: a waveform selector with six options (triangle, rev-saw, sawtooth, square, wide pulse, narrow pulse) and an octave range control (integer steps, ±2 octaves). OSC 2 and OSC 3 SHALL additionally provide a detune knob (±100 cents, bipolar arc from 12 o'clock). OSC 3 SHALL additionally provide an LFO mode toggle switch and an LFO rate knob (0.1–20 Hz, visible and active only when LFO mode is on).

#### Scenario: Waveform selector per oscillator

- **WHEN** user selects a waveform for a given oscillator
- **THEN** that oscillator's DSP waveform parameter updates immediately

#### Scenario: OSC 2 detune knob visible

- **WHEN** the oscillator panel is rendered
- **THEN** a bipolar detune knob is visible for OSC 2 and OSC 3 but not OSC 1

#### Scenario: OSC 3 LFO controls

- **WHEN** OSC 3 LFO mode is toggled on
- **THEN** the LFO rate knob becomes active and the keyboard frequency is no longer used for OSC 3

---

### Requirement: Filter panel controls

The Filter panel SHALL contain: a cutoff knob (20–20 000 Hz, log), a resonance knob (0–1, linear), and a Key Track on/off toggle switch. No filter mode selector is present.

#### Scenario: Filter panel has cutoff and res knobs plus Key Track switch

- **WHEN** the filter panel is rendered
- **THEN** cutoff and resonance knobs plus the Key Track toggle switch are visible; no mode selector is present

---

### Requirement: Key Track is a binary on/off switch

The Filter panel SHALL provide a "Key Track" on/off toggle switch in place of a continuous knob. When the switch is off it SHALL emit `keyTrack: 0.0`; when on it SHALL emit `keyTrack: 1.0`. The default state SHALL be off.

#### Scenario: Key Track off by default

- **WHEN** the UI is first rendered
- **THEN** the Key Track switch is in the off state and the `keyTrack` parameter value is `0.0`

#### Scenario: Key Track toggled on

- **WHEN** the user activates the Key Track switch
- **THEN** the switch enters the on state and emits `keyTrack: 1.0`

#### Scenario: Key Track toggled off

- **WHEN** the user deactivates the Key Track switch
- **THEN** the switch enters the off state and emits `keyTrack: 0.0`

---

### Requirement: Filter contour controls (within Filter panel)

The Filter panel's lower section SHALL contain the filter contour envelope: four knobs — attack, decay, sustain, release — and a bipolar amount knob (−10 000 … +10 000 Hz, default 0), grouped under a "filter contour" sub-label. The amount knob SHALL render in bipolar mode (centre detent at 0, arc filling from centre outward) using a linear taper, matching the bipolar-knob idiom used by the oscillator detune knobs. The knob's reserved value-display width SHALL accommodate a negative reading (e.g. `-10.0 kHz`) without layout shift.

#### Scenario: Filter contour has five knobs

- **WHEN** the filter panel is rendered
- **THEN** attack, decay, sustain, release, and amount knobs are all visible below the filter contour sub-label

#### Scenario: Amount knob is bipolar and centred at zero

- **WHEN** the amount knob is at its default value (0)
- **THEN** the knob indicator points to centre and the arc shows no fill; turning it clockwise shows a positive Hz reading and counter-clockwise shows a negative Hz reading

#### Scenario: Negative amount reading does not shift layout

- **WHEN** the amount knob displays a negative value such as `-10.0 kHz`
- **THEN** the value display fits within the reserved width and adjacent knobs do not shift position

---

### Requirement: Output panel controls

The Output panel SHALL contain a volume knob at top, followed by a "loudness contour" section with four knobs — attack, decay, sustain, release — and a decay/release lock (D/R) toggle switch on the same row as the loudness contour label.

#### Scenario: Output panel has five knobs and a switch

- **WHEN** the output panel is rendered
- **THEN** volume, attack, decay, sustain, and release knobs plus a D/R lock switch are all visible

#### Scenario: D/R lock disables release knob

- **WHEN** the D/R lock switch is on
- **THEN** the release knob is visually disabled and tracks the decay knob value

---

### Requirement: Mixer panel controls

The Mixer panel SHALL contain four level knobs (OSC 1, OSC 2, OSC 3, noise) and a white/pink noise selector toggle switch.

#### Scenario: Mixer panel has four level knobs

- **WHEN** the mixer panel is rendered
- **THEN** level knobs for OSC 1, OSC 2, OSC 3, and noise are visible alongside the noise type selector

---

### Requirement: Modulation panel controls

The Modulation panel SHALL contain: a mod mix knob (OSC 3 ↔ noise) and three routing toggle switches (OSC 1 pitch, OSC 2 pitch, filter cutoff). The mod wheel is no longer part of the Modulation panel; it lives in the standalone wheels panel as the MOD wheel.

#### Scenario: Modulation panel has mod mix and switches

- **WHEN** the modulation panel is rendered
- **THEN** the mod mix knob and three routing switches are all visible

#### Scenario: Mod mix knob crossfades the modulation source

- **WHEN** user turns the mod mix knob
- **THEN** the modulation source crossfades between OSC 3 output and white noise

---

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

---

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

---

### Requirement: Glide panel controls

The Glide panel SHALL contain an on/off toggle switch and a rate knob (0–5 s, logarithmic).

#### Scenario: Glide panel has toggle and rate knob

- **WHEN** the glide panel is rendered
- **THEN** the glide on/off toggle and the rate knob are both visible

#### Scenario: Rate knob inactive when glide is off

- **WHEN** the glide toggle is off
- **THEN** the rate knob is visually disabled (portamento time is zero regardless of knob position)

---

### Requirement: Delay and reverb toggle buttons are co-located with section labels

In the Effects panel, each section's on/off toggle button SHALL appear on the same row as its section label ("DELAY" or "REVERB"). The knob row for each section SHALL contain only knobs.

#### Scenario: Delay toggle button row

- **WHEN** the Effects panel is rendered
- **THEN** the "DELAY" label and the delay on/off button appear on the same horizontal row

#### Scenario: Reverb toggle button row

- **WHEN** the Effects panel is rendered
- **THEN** the "REVERB" label and the reverb on/off button appear on the same horizontal row

#### Scenario: Knob rows contain only knobs

- **WHEN** the Effects panel is rendered
- **THEN** the delay knob row contains only the mix, time, and feedback knobs (no toggle button)
- **AND** the reverb knob row contains only the mix, tone, decay, and pre-delay knobs (no toggle button)

### Requirement: All on/off toggle switches use the active green color

The on/off toggle switches for Key Track, Glide, Delay, and Reverb SHALL each display with `color: #20b040` and `border-color: #20b040` when in the active (on) state. This matches the power button's active stroke color and establishes a consistent visual language for active binary controls.

#### Scenario: Toggle switch active appearance

- **WHEN** any on/off toggle switch (Key Track, Glide, Delay, or Reverb) is in the on state
- **THEN** the switch text and border are rendered in `#20b040`

#### Scenario: Toggle switch inactive appearance

- **WHEN** any on/off toggle switch is in the off state
- **THEN** the switch does not display the green active color

