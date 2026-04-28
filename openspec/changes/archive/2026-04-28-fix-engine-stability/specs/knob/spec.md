## ADDED Requirements

### Requirement: Spring animation on external value changes
The Knob component SHALL animate its visual indicator and arc smoothly to a new position when the value changes via the `externalValue` prop (MIDI CC input or reset). The animation SHALL use a spring with tuned stiffness and damping so the sweep completes in approximately 400–600ms. During pointer drag the spring SHALL be bypassed entirely — the visual position SHALL track the pointer directly with no lag. The logical value (reported via `onchange`) SHALL update immediately on any value change, independent of the visual animation.

#### Scenario: Knob springs to new external value
- **WHEN** the externalValue prop changes (e.g., from a power-on reset)
- **THEN** the knob indicator and arc animate smoothly to the new position over approximately 400–600ms

#### Scenario: No spring lag during drag
- **WHEN** the user drags the knob
- **THEN** the visual indicator tracks the pointer position directly with no spring delay

#### Scenario: onchange fires immediately regardless of animation
- **WHEN** externalValue changes
- **THEN** onchange is called with the new value immediately, before the spring animation completes
