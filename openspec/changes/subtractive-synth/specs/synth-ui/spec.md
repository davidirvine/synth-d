## ADDED Requirements

### Requirement: Panel layout with five sections
The system SHALL arrange controls in five labeled panels from left to right: Oscillator, Filter, Filter Env, Amp Env, Volume. The keyboard SHALL appear below all panels spanning the full width.

#### Scenario: Panel order
- **WHEN** the UI is rendered
- **THEN** panels appear in order: Oscillator | Filter | Filter Env | Amp Env | Volume, with keyboard below

#### Scenario: Responsive to window width
- **WHEN** browser window is at least 900px wide
- **THEN** all panels are visible in a single horizontal row without horizontal scrolling

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
The Oscillator panel SHALL contain: waveform selector (5 options: sine, saw, square, triangle, noise) and octave transpose selector (integer steps, ±2 octaves).

#### Scenario: Waveform selector
- **WHEN** user selects a waveform from the oscillator panel
- **THEN** DSP waveform parameter updates immediately

#### Scenario: Octave control
- **WHEN** user changes the octave setting
- **THEN** all subsequently pressed keys produce frequencies shifted by the corresponding number of octaves

---

### Requirement: Filter panel controls
The Filter panel SHALL contain three knobs: cutoff (log, 20Hz–20kHz, default 2000Hz), resonance (linear, 0–1, default 0.3), and mode (linear, 0–2, default 0, labeled LP/BP/HP at tick positions).

#### Scenario: Mode knob labels
- **WHEN** the filter panel is rendered
- **THEN** LP, BP, and HP labels are visible at positions 0, 1, and 2 on the mode knob

---

### Requirement: Filter Env panel controls
The Filter Env panel SHALL contain three knobs: attack (log, 1ms–4000ms, default 10ms), decay (log, 1ms–4000ms, default 300ms), and envelope amount (log, 0–10000Hz, default 3000Hz).

#### Scenario: Envelope amount at zero
- **WHEN** envelope amount knob is at minimum
- **THEN** filter cutoff is not affected by envelope motion regardless of attack/decay settings

---

### Requirement: Amp Env panel controls
The Amp Env panel SHALL contain two knobs: attack (log, 1ms–4000ms, default 10ms) and decay (log, 1ms–4000ms, default 500ms).

#### Scenario: Long amp decay
- **WHEN** amp decay is set to maximum (4000ms)
- **THEN** notes audibly fade over approximately 4 seconds after trigger

---

### Requirement: Volume panel control
The Volume panel SHALL contain a single knob: master volume (linear, 0–1, default 0.75).

#### Scenario: Zero volume
- **WHEN** master volume is set to 0
- **THEN** no audio output is produced regardless of other settings

#### Scenario: Default volume
- **WHEN** the synth initializes
- **THEN** master volume knob is at 0.75 (75%)
