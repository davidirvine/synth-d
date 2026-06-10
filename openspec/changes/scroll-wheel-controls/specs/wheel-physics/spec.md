## MODIFIED Requirements

### Requirement: Spring-back physics model with mass

The PITCH wheel SHALL return to its 0.5 rest position on release using a damped harmonic oscillator that assigns the cursor mass. The model SHALL integrate `acceleration = (−spring·displacement − damping·velocity) / mass` over animation frames, where `displacement` is the cursor's offset from 0.5. With an underdamped configuration the cursor SHALL overshoot the midpoint, decelerate, and reverse direction before settling. The animation SHALL stop once the cursor is within a small threshold of 0.5 with negligible velocity. The MOD wheel SHALL NOT use this spring-back model — it is a non-spring control that holds its position (see the `modulation` capability).

#### Scenario: Underdamped release overshoots and settles
- **WHEN** the PITCH wheel is released away from center with an underdamped physics configuration
- **THEN** the cursor overshoots 0.5, reverses, and oscillates with decreasing amplitude until it comes to rest at 0.5

#### Scenario: Heavier mass returns more slowly
- **WHEN** the PITCH wheel's mass is increased and the wheel is released from the same position
- **THEN** the cursor takes longer to return to center than with a lighter mass

#### Scenario: Critical damping returns without overshoot
- **WHEN** the PITCH wheel's damping is set to its maximum (critical) and the wheel is released
- **THEN** the cursor returns to 0.5 without crossing past it

#### Scenario: Spring-back animates visually while powered off without writing the parameter
- **WHEN** the synth is powered off and the user drags and releases the PITCH wheel
- **THEN** the cursor still springs back to 0.5 visually, but no parameter write occurs (matching the powered-off guard on wheel changes)

#### Scenario: Mod wheel does not spring back
- **WHEN** the user drags and releases the MOD wheel away from its current position
- **THEN** the cursor holds where it was released and no spring-back animation runs

### Requirement: Per-wheel physics parameters editable via knobs

A gear/settings icon button SHALL be present in the top-left of the wheels component. Activating it SHALL open a popup that exposes, for the PITCH wheel only, three knob controls — mass, spring strength, and damping — reusing the standard knob control. The MOD wheel SHALL NOT have physics knobs (it has no spring physics to tune). The popup SHALL provide a reset-to-defaults action. Changes SHALL take effect on the next release of the PITCH wheel.

Each parameter SHALL use the following range, default, and unit:

| Parameter         | Min  | Max | Default | Notes                                                        |
| ----------------- | ---- | --- | ------- | ------------------------------------------------------------ |
| Mass              | 0.05 | 5   | 0.1     | Higher mass returns more slowly; min below default for speed |
| Spring strength   | 1    | 70  | 50      | Higher spring returns faster                                 |
| Damping ratio (ζ) | 0.05 | 1   | 0.3     | Lower bound >0 (never perpetually undamped); ζ=1 is critical |

#### Scenario: Physics knobs use their defined defaults
- **WHEN** the wheels load with no saved physics
- **THEN** the PITCH wheel uses mass 0.1, spring strength 50, and damping ratio 0.3

#### Scenario: Gear button opens the physics popup
- **WHEN** the user activates the gear button in the top-left of the wheels component
- **THEN** a popup opens showing mass, spring strength, and damping knobs for the PITCH wheel only

#### Scenario: Popup shows no MOD wheel physics knobs
- **WHEN** the physics popup is open
- **THEN** it contains exactly three physics knobs (for the PITCH wheel) and no MOD wheel physics knobs

#### Scenario: Adjusting a physics knob changes the wheel feel
- **WHEN** the user changes the PITCH wheel's spring strength knob and then releases the PITCH wheel
- **THEN** the PITCH wheel's spring-back uses the new spring strength

#### Scenario: Reset restores default physics
- **WHEN** the user activates the reset-to-defaults action in the popup
- **THEN** the three PITCH physics knobs return to their default values

### Requirement: Physics parameters persist in local storage

The PITCH wheel physics parameters SHALL be saved to and loaded from browser local storage under the key `synth-d:wheel-physics`, structured as `{ pitch: { mass, spring, damping } }`. On load, each field SHALL be validated as a finite number within its allowed range and SHALL fall back to its default when missing or invalid, so corrupt or partial data never breaks the wheels. A legacy stored blob that also contains a `mod` physics object (from before the MOD wheel became a non-spring control) SHALL load without error: the `mod` field SHALL be ignored and SHALL NOT be re-saved.

#### Scenario: Edited physics survive reload
- **WHEN** the user changes the PITCH physics parameters and reloads the page
- **THEN** the wheels load with the previously saved PITCH physics parameters

#### Scenario: Missing or invalid stored values fall back to defaults
- **WHEN** the `synth-d:wheel-physics` entry is absent, partial, or contains invalid values
- **THEN** the affected parameters use their default values and the wheels function normally

#### Scenario: Legacy blob with a mod field loads without error
- **WHEN** the stored `synth-d:wheel-physics` entry contains both a `mod` and a `pitch` object (legacy shape)
- **THEN** the `pitch` parameters load normally, the `mod` field is ignored, and the wheels function normally
