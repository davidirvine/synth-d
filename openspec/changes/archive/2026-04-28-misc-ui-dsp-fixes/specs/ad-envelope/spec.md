## MODIFIED Requirements

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
