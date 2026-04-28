# AD Envelope

## Purpose

Provides full ADSR envelope generators triggered on gate rising edges. Two independent instances are used: one for filter cutoff modulation, one for VCA gain control. The envelope fires on key press, supports sustain while the key is held, and decays to zero after key release.

## Requirements

### Requirement: One-shot AD envelope triggered on gate rising edge
The system SHALL implement a full ADSR envelope (attack, decay, sustain, release) triggered on gate rising edges. The attack phase rises to peak on key press; decay falls to the sustain level while the key is held; release decays to zero after key release. The system SHALL provide two independent instances: one for filter contour modulation, one for VCA (loudness) control.

#### Scenario: Envelope attack and decay on key press
- **WHEN** a keyboard key is pressed (gate 0→1)
- **THEN** the envelope rises from 0 to 1 over the attack time, then decays to the sustain level over the decay time

#### Scenario: Sustain holds while key is held
- **WHEN** a key is held down longer than attack + decay time
- **THEN** the envelope output remains at the sustain level until the key is released

#### Scenario: Release on key-off
- **WHEN** a key is released (gate 1→0)
- **THEN** the envelope decays from the current level to zero over the release time

#### Scenario: Rising edge detection
- **WHEN** the gate transitions 0→1
- **THEN** the envelope triggers from its current output level; no trigger occurs when gate transitions 1→0

---

### Requirement: Legato note transition
The system SHALL use legato behavior — when a new key is pressed while a previous key is still held, only the oscillator frequency SHALL be updated. No gate pulse is sent, so both envelopes continue their current phase without interruption. This avoids clicks on rapid successive presses.

#### Scenario: New key while holding previous
- **WHEN** key A is held and key B is pressed before A's envelope has decayed to zero
- **THEN** oscillator frequency updates to key B's pitch; both envelopes continue uninterrupted (no retrigger)

#### Scenario: Rapid successive presses
- **WHEN** keys are pressed in rapid succession while a key is held
- **THEN** frequency changes on each press; no envelope retrigger occurs and no click is produced

---

### Requirement: Attack, decay, sustain, and release time controls
Each envelope instance SHALL expose independent attack, decay, and release time parameters with logarithmic range 1ms–4 000ms (4 seconds). Sustain SHALL be a linear normalised level 0–1 (dimensionless) representing the fraction of peak held during key hold.

#### Scenario: Short attack
- **WHEN** attack time is set to 1ms
- **THEN** the envelope reaches peak within approximately 1ms of trigger

#### Scenario: Long release
- **WHEN** release time is set to 4 000ms and a key is released
- **THEN** the envelope takes approximately 4 seconds to decay to zero after key release

#### Scenario: Sustain level at 0.5
- **WHEN** sustain is 0.5 and a key is held past the decay phase
- **THEN** the envelope output stabilises at 0.5 (50% of peak)

#### Scenario: Sustain at zero produces AD-style behavior
- **WHEN** sustain is 0 and decay completes
- **THEN** the envelope output is 0 regardless of whether the key is still held, matching previous one-shot behavior

---

### Requirement: Filter envelope amount control
The filter envelope instance SHALL expose a positive-only envelope amount parameter (linear, 0–10 000 Hz, default 0 Hz) controlling how much the envelope raises the filter cutoff above its base value. Negative envelope amounts are not supported.

#### Scenario: Zero envelope amount
- **WHEN** filter envelope amount is 0 Hz
- **THEN** the filter cutoff is unaffected by the envelope regardless of ADSR settings

#### Scenario: Positive envelope amount opens filter on key press
- **WHEN** filter envelope amount is set to a positive value
- **THEN** the effective cutoff rises above the base cutoff at envelope peak, settles to `baseCutoff + amount × sustain` during key hold, then returns to base cutoff during release

---

### Requirement: Amp envelope decay/release lock switch
The VCA envelope SHALL provide a decay/release lock (D/R) switch. When the switch is on, the release time is locked to the same value as the decay time: both parameters move in tandem. When the switch is off, decay and release are independent. The D/R lock switch SHALL initialise to on (locked) by default, and SHALL return to on when the component is reset.

#### Scenario: D/R lock on — release tracks decay
- **WHEN** the D/R lock switch is on and the decay knob is adjusted
- **THEN** the release time updates to match the decay time

#### Scenario: D/R lock off — decay and release are independent
- **WHEN** the D/R lock switch is off
- **THEN** decay and release knobs control their parameters independently with no coupling

#### Scenario: D/R lock defaults to on
- **WHEN** the AmpEnv component is first rendered
- **THEN** the D/R lock switch is in the on (locked) state

#### Scenario: D/R lock resets to on
- **WHEN** the AmpEnv component reset is called (e.g., on power-off)
- **THEN** the D/R lock switch returns to the on (locked) state
