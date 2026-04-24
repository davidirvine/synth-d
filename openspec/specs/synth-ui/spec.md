# Synth UI

## Purpose

Defines the overall layout, visual aesthetic, and panel-level controls for the subtractive synthesizer user interface. The UI is organized into six labeled control panels arranged above a full-width keyboard, applying a consistent Moog-inspired dark theme throughout.

## Requirements

### Requirement: Header strip with power button above the panels

The system SHALL render a header strip above the control panels containing the synth name on the left, MIDI status in the middle, and the power button on the right.

#### Scenario: Header layout

- **WHEN** the UI is rendered
- **THEN** a header strip is visible above all panels with the synth title on the left and the power button on the right

---

### Requirement: Panel layout with six sections

The system SHALL arrange controls in six labeled panels: Oscillator Bank, Mixer, Filter (combined with filter contour envelope), Output (combined volume and loudness contour), Modulation, and Glide. Filter and Output panels share a two-column grid row; Modulation and Glide appear below Filter in a second row. The keyboard SHALL appear below all panels spanning the full width. A header strip containing the synth title, MIDI status, and power button SHALL appear above the panels. The previously unused panel slot under Output SHALL host the oscilloscope panel.

#### Scenario: Panel arrangement

- **WHEN** the UI is rendered
- **THEN** panels appear with header above, then Oscillator Bank | Mixer | [Filter over Modulation+Glide] | [Output over Oscilloscope], keyboard below

#### Scenario: Responsive to window width

- **WHEN** browser window is at least 1200px wide
- **THEN** all panels are visible without horizontal scrolling

---

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

The Filter panel SHALL contain: a cutoff knob (20–20 000 Hz, log), a resonance knob (0–1, linear), and a key track knob (0–1, linear). No filter mode selector is present.

#### Scenario: Filter panel has three knobs

- **WHEN** the filter panel is rendered
- **THEN** cutoff, resonance, and key track knobs are visible; no mode selector is present

#### Scenario: Key track knob routes to DSP

- **WHEN** user adjusts the key track knob
- **THEN** the `keyTrack` DSP parameter updates immediately

---

### Requirement: Filter contour controls (within Filter panel)

The Filter panel's lower section SHALL contain the filter contour envelope: four knobs — attack, decay, sustain, release — and a positive-only amount knob (0–10 000 Hz), grouped under a "filter contour" sub-label.

#### Scenario: Filter contour has five knobs

- **WHEN** the filter panel is rendered
- **THEN** attack, decay, sustain, release, and amount knobs are all visible below the filter contour sub-label

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

The Modulation panel SHALL contain: a mod mix knob (OSC 3 ↔ noise), three routing toggle switches (OSC 1 pitch, OSC 2 pitch, filter cutoff), and a vertical virtual mod wheel slider.

#### Scenario: Modulation panel has mod mix, switches, and wheel

- **WHEN** the modulation panel is rendered
- **THEN** the mod mix knob, three routing switches, and the virtual mod wheel slider are all visible

#### Scenario: Virtual mod wheel is a vertical slider

- **WHEN** user drags the virtual mod wheel
- **THEN** the modulation depth parameter updates and audible modulation changes if routing is active

---

### Requirement: Glide panel controls

The Glide panel SHALL contain an on/off toggle switch and a rate knob (0–5 s, logarithmic).

#### Scenario: Glide panel has toggle and rate knob

- **WHEN** the glide panel is rendered
- **THEN** the glide on/off toggle and the rate knob are both visible

#### Scenario: Rate knob inactive when glide is off

- **WHEN** the glide toggle is off
- **THEN** the rate knob is visually disabled (portamento time is zero regardless of knob position)
