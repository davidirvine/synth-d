# Clip LED

## Purpose

Superseded by the `level-led` spec. `ClipLed.svelte` has been deleted and replaced by `LevelLed.svelte`, which provides continuous green-to-red color mapping in addition to clip latching. All requirements previously defined here are now covered by the `level-led` spec.

## Requirements

### Requirement: Clip LED capability is retired

The `clip-led` capability is retired. `ClipLed.svelte` has been deleted and replaced by `LevelLed.svelte`; all clip-indication behaviour is now defined by the `level-led` capability, which SHALL be treated as authoritative. This spec is retained only as a tombstone that points to its replacement.

#### Scenario: level-led is authoritative for clip indication

- **WHEN** a contributor looks for clip-LED behaviour
- **THEN** the behaviour is defined by the `level-led` spec
- **THEN** this `clip-led` spec defines no active requirements of its own
