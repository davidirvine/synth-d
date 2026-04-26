## ADDED Requirements

### Requirement: Keyboard tracking toggle button self-labels in both states

The keyboard tracking toggle SHALL display the text "KEY TRACK" as its visible label in both the enabled and disabled states. No separate text label SHALL appear above or beside the toggle. The toggle SHALL be vertically aligned with the adjacent cutoff and resonance knobs — its top edge SHALL be level with the top of those knob SVG bodies. The `aria-pressed` attribute SHALL reflect the current state (`true` when tracking is on, `false` when off).

#### Scenario: Toggle displays KEY TRACK when tracking is off

- **WHEN** keyboard tracking is disabled
- **THEN** the toggle button text reads "KEY TRACK" and `aria-pressed` is `false`

#### Scenario: Toggle displays KEY TRACK when tracking is on

- **WHEN** keyboard tracking is enabled
- **THEN** the toggle button text reads "KEY TRACK" and `aria-pressed` is `true`

#### Scenario: No separate label above the toggle

- **WHEN** the filter panel is rendered
- **THEN** there is no standalone "Key Track" text element separate from the toggle button itself
