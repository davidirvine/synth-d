## ADDED Requirements

### Requirement: One-shot AD envelope triggered on gate rising edge
The system SHALL implement an AD (attack-decay) envelope that fires once when the gate signal transitions from 0 to 1 (rising edge). After the attack phase completes, the envelope SHALL decay to zero regardless of whether the gate remains high. The system SHALL provide two independent instances: one for filter cutoff modulation, one for VCA gain.

#### Scenario: Envelope fires on key press
- **WHEN** a keyboard key is pressed (gate 0→1)
- **THEN** the envelope rises from 0 to 1 over the attack time, then decays from 1 to 0 over the decay time

#### Scenario: Key hold does not sustain
- **WHEN** a key is held down longer than attack + decay time
- **THEN** the envelope output is 0 (fully decayed); no sustain phase

#### Scenario: Rising edge detection
- **WHEN** the gate transitions 0→1
- **THEN** the envelope triggers; no trigger occurs when gate transitions 1→0

---

### Requirement: Legato note transition
The system uses legato behavior — when a new key is pressed while a previous key is still held, only the oscillator frequency is updated. No gate pulse is sent, so both envelopes continue their current phase without interruption. This avoids clicks on rapid successive presses.

#### Scenario: New key while holding previous
- **WHEN** key A is held and key B is pressed before A's envelope has decayed to zero
- **THEN** oscillator frequency updates to key B's pitch; both envelopes continue uninterrupted (no retrigger)

#### Scenario: Rapid successive presses
- **WHEN** keys are pressed in rapid succession while a key is held
- **THEN** frequency changes on each press; no envelope retrigger occurs and no click is produced

---

### Requirement: Attack and decay time controls
Each envelope instance SHALL expose independent attack and decay time parameters with logarithmic range 1ms–4000ms (4 seconds).

#### Scenario: Short attack
- **WHEN** attack time is set to 1ms
- **THEN** envelope reaches peak within approximately 1ms of trigger

#### Scenario: Long decay
- **WHEN** decay time is set to 4000ms
- **THEN** envelope takes approximately 4 seconds to decay from peak to zero

---

### Requirement: Filter envelope amount control
The filter envelope instance SHALL expose a bipolar envelope amount parameter (linear, −10,000Hz–+10,000Hz, default 0Hz) controlling how much the envelope modulates the filter cutoff. Positive values raise the cutoff; negative values lower it.

#### Scenario: Zero envelope amount
- **WHEN** filter envelope amount is 0Hz (center)
- **THEN** filter cutoff is unaffected by the envelope regardless of attack/decay settings

#### Scenario: Positive envelope amount
- **WHEN** filter envelope amount is set to a positive value
- **THEN** the effective cutoff rises above the base cutoff at envelope peak, then returns as the envelope decays

#### Scenario: Negative envelope amount
- **WHEN** filter envelope amount is set to a negative value
- **THEN** the effective cutoff drops below the base cutoff at envelope peak, then returns as the envelope decays
