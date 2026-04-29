## ADDED Requirements

### Requirement: springEnabled prop controls indicator animation on external value changes

The `Knob` component SHALL accept a `springEnabled` boolean prop (default `false`). When `springEnabled` is `false`, all calls to `springPos.set()` triggered by `externalValue` changes SHALL use `{ instant: true }`, snapping the indicator to the new position immediately. When `springEnabled` is `true`, `springPos.set()` SHALL animate naturally via the configured spring parameters. The `springEnabled` prop SHALL NOT affect drag interaction — drag always snaps the indicator instantly regardless of `springEnabled`.

#### Scenario: External value snaps instantly when springEnabled is false

- **WHEN** a `Knob` receives an updated `externalValue` and `springEnabled` is `false`
- **THEN** the visual indicator moves to the new position instantly without spring animation

#### Scenario: External value animates when springEnabled is true

- **WHEN** a `Knob` receives an updated `externalValue` and `springEnabled` is `true`
- **THEN** the visual indicator animates to the new position via the Svelte spring store

#### Scenario: Drag always instant regardless of springEnabled

- **WHEN** the user drags a knob while `springEnabled` is `true`
- **THEN** the visual indicator tracks the drag position instantly (no spring lag)

#### Scenario: springEnabled defaults to false

- **WHEN** a `Knob` is rendered without a `springEnabled` prop
- **THEN** external value changes snap the indicator instantly (spring is inactive)
