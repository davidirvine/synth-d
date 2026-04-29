## ADDED Requirements

### Requirement: LED level meter displays pre-filter mixer signal level
The mixer panel SHALL display a vertical LED level meter showing the real-time peak level of the pre-filter mixer output. The meter SHALL have 8 segments arranged vertically, updated at display frame rate (~60fps). Segments SHALL be coloured by level zone:

- Segments 1–4 (0.0–0.5 linear): green
- Segments 5–6 (0.5–0.85 linear): yellow
- Segment 7 (0.85–1.0 linear): orange
- Segment 8 (>1.0 linear): red — this is the clip indicator

Inactive (unlit) segments SHALL be rendered in a dark neutral colour consistent with the panel background.

#### Scenario: Silence shows no lit segments
- **WHEN** no note is playing and all oscillator levels are at zero
- **THEN** all eight LED segments are unlit

#### Scenario: Moderate level lights green segments
- **WHEN** the mixer output is at approximately 0.3 linear
- **THEN** the lower green segments are lit and no yellow, orange, or red segments are lit

#### Scenario: Hot signal lights through orange
- **WHEN** the mixer output reaches 0.9 linear
- **THEN** green, yellow, and orange segments are all lit and the clip segment is not lit

#### Scenario: Clip segment lights when signal exceeds 1.0
- **WHEN** the mixer output exceeds 1.0 linear
- **THEN** the red clip segment lights

---

### Requirement: Clip indicator latches after a peak
The red clip segment SHALL remain lit for approximately 1.5 seconds after the peak level drops back below the clip threshold. This ensures transient peaks that exceed 1.0 remain visible even if the signal quickly returns to a clean level.

#### Scenario: Clip latches after transient peak
- **WHEN** a brief loud transient pushes the mixer output above 1.0 and then the signal drops below 1.0
- **THEN** the red clip segment remains lit for approximately 1.5 seconds before turning off

#### Scenario: Clip stays lit while signal remains clipped
- **WHEN** the mixer output continuously exceeds 1.0
- **THEN** the clip segment remains continuously lit without flickering

---

### Requirement: Meter is inactive when engine is powered off
When the synthesizer is powered off, the level meter SHALL show all segments unlit. The meter SHALL NOT attempt to poll the DSP for level data while the engine is off.

#### Scenario: All segments unlit when powered off
- **WHEN** the power button is off
- **THEN** all eight LED segments are dark
