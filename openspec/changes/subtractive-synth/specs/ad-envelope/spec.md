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

### Requirement: Retrigger on new key press
The system SHALL retrigger both envelopes when a new key is pressed while a previous key is still held. Retrigger SHALL restart the envelope from its current value (not from zero) to avoid a click.

#### Scenario: New key while holding previous
- **WHEN** key A is held and key B is pressed before A's envelope has decayed to zero
- **THEN** both envelopes restart their attack phase from the current envelope value

#### Scenario: Rapid retrigger
- **WHEN** keys are pressed in rapid succession
- **THEN** each press restarts the envelope without audio clicks or silence gaps

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
The filter envelope instance SHALL expose an envelope amount parameter (0–10,000Hz, logarithmic) controlling how much the envelope modulates the filter cutoff.

#### Scenario: Zero envelope amount
- **WHEN** filter envelope amount is 0
- **THEN** filter cutoff is unaffected by the envelope regardless of attack/decay settings

#### Scenario: Maximum envelope amount
- **WHEN** filter envelope amount is at maximum
- **THEN** envelope adds up to 10,000Hz to the base cutoff at peak
