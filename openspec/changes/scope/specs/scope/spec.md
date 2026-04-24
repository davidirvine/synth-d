## ADDED Requirements

### Requirement: Scope displays a live waveform from the audio output
The system SHALL render a real-time oscilloscope trace on a `<canvas>` element by reading time-domain samples from the audio engine's `AnalyserNode` once per animation frame. The trace SHALL be a single continuous polyline drawn left-to-right across the full canvas width.

#### Scenario: Waveform updates while powered on
- **WHEN** the synth is powered on and a note is playing
- **THEN** the canvas shows a moving waveform that changes in response to the audio signal

#### Scenario: Flat line while powered off
- **WHEN** the synth is powered off
- **THEN** the canvas shows a horizontal line at the vertical midpoint and the animation loop is not running

#### Scenario: Flat line at silence
- **WHEN** the synth is powered on but no note is playing
- **THEN** the canvas shows a horizontal line at the vertical midpoint

### Requirement: Scope visual style matches Moog dark aesthetic
The scope canvas SHALL use the project's defined colour palette: dark panel background (`#1c1c1c`) with a 1 px `#333` border, and a cream (`#e8dcc8`) waveform trace. The canvas SHALL be 80 px tall and span the full available width of the layout.

#### Scenario: Colours are correct
- **WHEN** the scope is rendered
- **THEN** the canvas background is `#1c1c1c`, the trace colour is `#e8dcc8`, and the panel border is `1px solid #333`

#### Scenario: Canvas dimensions
- **WHEN** the scope is rendered at the browser default viewport
- **THEN** the canvas height is 80 px and its width fills the full layout width

### Requirement: Scope panel is positioned between the header strip and the control panels
The system SHALL render the `Scope` component in the main layout below the header strip and above the oscillator/mixer/filter/output/modulation/glide panels.

#### Scenario: Layout order
- **WHEN** the UI is rendered
- **THEN** the scope strip appears below the header and above all control panels
