## ADDED Requirements

### Requirement: Spring-back physics model with mass

Each wheel SHALL return to its 0.5 rest position on release using a damped harmonic oscillator that assigns the cursor mass. The model SHALL integrate `acceleration = (−spring·displacement − damping·velocity) / mass` over animation frames, where `displacement` is the cursor's offset from 0.5. With an underdamped configuration the cursor SHALL overshoot the midpoint, decelerate, and reverse direction before settling. The animation SHALL stop once the cursor is within a small threshold of 0.5 with negligible velocity.

#### Scenario: Underdamped release overshoots and settles
- **WHEN** a wheel is released away from center with an underdamped physics configuration
- **THEN** the cursor overshoots 0.5, reverses, and oscillates with decreasing amplitude until it comes to rest at 0.5

#### Scenario: Heavier mass returns more slowly
- **WHEN** a wheel's mass is increased and the wheel is released from the same position
- **THEN** the cursor takes longer to return to center than with a lighter mass

#### Scenario: Critical damping returns without overshoot
- **WHEN** a wheel's damping is set to its maximum (critical) and the wheel is released
- **THEN** the cursor returns to 0.5 without crossing past it

#### Scenario: Spring-back animates visually while powered off without writing the parameter
- **WHEN** the synth is powered off and the user drags and releases a wheel
- **THEN** the cursor still springs back to 0.5 visually, but no parameter write occurs (matching the powered-off guard on wheel changes)

### Requirement: Per-wheel physics parameters editable via knobs

A gear/settings icon button SHALL be present in the top-left of the wheels component. Activating it SHALL open a popup that exposes, for each of the MOD and PITCH wheels, three knob controls — mass, spring strength, and damping — reusing the standard knob control. The popup SHALL provide a reset-to-defaults action. Changes SHALL take effect on the next release of the corresponding wheel.

Each parameter SHALL use the following range, default, and unit:

| Parameter         | Min  | Max | Default | Notes                                                        |
| ----------------- | ---- | --- | ------- | ------------------------------------------------------------ |
| Mass              | 0.05 | 5   | 0.1     | Higher mass returns more slowly; min below default for speed |
| Spring strength   | 1    | 50  | 50      | Higher spring returns faster                                 |
| Damping ratio (ζ) | 0.05 | 1   | 0.3     | Lower bound >0 (never perpetually undamped); ζ=1 is critical |

#### Scenario: Physics knobs use their defined defaults
- **WHEN** the wheels load with no saved physics
- **THEN** each wheel uses mass 0.1, spring strength 50, and damping ratio 0.3

#### Scenario: Gear button opens the physics popup
- **WHEN** the user activates the gear button in the top-left of the wheels component
- **THEN** a popup opens showing mass, spring strength, and damping knobs for both the MOD and PITCH wheels

#### Scenario: Adjusting a physics knob changes the wheel feel
- **WHEN** the user changes the MOD wheel's spring strength knob and then releases the MOD wheel
- **THEN** the MOD wheel's spring-back uses the new spring strength

#### Scenario: Reset restores default physics
- **WHEN** the user activates the reset-to-defaults action in the popup
- **THEN** all six physics knobs return to their default values

### Requirement: Physics parameters persist in local storage

The per-wheel physics parameters SHALL be saved to and loaded from browser local storage under the key `synth-d:wheel-physics`, structured as `{ mod: { mass, spring, damping }, pitch: { mass, spring, damping } }`. On load, each field SHALL be validated as a finite number within its allowed range and SHALL fall back to its default when missing or invalid, so corrupt or partial data never breaks the wheels.

#### Scenario: Edited physics survive reload
- **WHEN** the user changes physics parameters and reloads the page
- **THEN** the wheels load with the previously saved physics parameters

#### Scenario: Missing or invalid stored values fall back to defaults
- **WHEN** the `synth-d:wheel-physics` entry is absent, partial, or contains invalid values
- **THEN** the affected parameters use their default values and the wheels function normally
