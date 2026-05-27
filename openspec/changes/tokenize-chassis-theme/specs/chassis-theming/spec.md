## ADDED Requirements

### Requirement: Visual identity is expressed through layered design tokens

A synth's visual identity SHALL be expressed through CSS custom-property design tokens in two layers: a **palette** layer (the identity — accent, text, surfaces, LED/clip colors, fonts) and a **component** layer that derives from the palette. Component tokens SHALL reference palette tokens (e.g. `--knob-arc-color: var(--accent-warm)`) so that setting the palette cascades to components without per-component edits.

#### Scenario: Palette change reskins components via cascade

- **WHEN** a palette token (e.g. `--accent-warm`) is given a new value at the document root
- **THEN** every component token that derives from it (e.g. `--knob-arc-color`) and every chassis component and instrument panel that consumes it render with the new color, with no change to component source

#### Scenario: Deep override remains available

- **WHEN** a specific component token (e.g. `--knob-track-color`) is set directly
- **THEN** that component's appearance changes for that token alone, independent of the palette

### Requirement: Chassis components contain no hardcoded visual literals

Chassis components SHALL NOT contain hardcoded identity color literals; every themeable identity color SHALL be a `var(--token, <fallback>)` reference. Out of scope and acceptable: the default fallback inside a `var(--token, …)` reference, algorithmically computed colors (e.g. a level-meter's HSL ramp driven by a runtime value), `font-family: inherit` and bare `monospace` declarations preserved for pixel-identity, and structural values (layout, spacing, geometry, transitions).

#### Scenario: No hardcoded identity color literals remain in chassis components

- **WHEN** the chassis component styles are searched (matching hex, `rgba(`, and `hsl(`) for identity color literals outside token definitions and `var()` fallbacks
- **THEN** none are found, except algorithmically computed colors and the documented preserved cases; each themeable identity color is a `var(--token, …)` reference

#### Scenario: Structural CSS is left untokenized

- **WHEN** layout, spacing, sizing geometry, or transition values are inspected
- **THEN** they remain plain CSS and are not converted to tokens (only identity values are tokenized)

### Requirement: A single override point holds the synth's palette

The synth's palette SHALL live in one override file (`theme.css`) applied at the document root so the cascade reaches every chassis component and instrument panel. A synth SHALL be able to change its entire visual identity by editing only this file, without touching component source.

#### Scenario: Identity changes from one file

- **WHEN** the palette block in `theme.css` is replaced
- **THEN** the whole app reskins coherently — chassis components and instrument panels alike — and no component file is edited

### Requirement: The default palette renders pixel-identically to the pre-tokenization app

Tokenization SHALL NOT change the rendered appearance at the default palette. Each token's fallback SHALL equal the value it replaced, and `theme.css` SHALL set each token to that same value, so the app is byte-for-byte equivalent in appearance.

#### Scenario: No visual change at the default palette

- **WHEN** the app is rendered with the default `theme.css` and compared to the pre-change render at power-off and power-on
- **THEN** the screenshots match within a small threshold, and the existing `vitest`/`stryker`/`playwright` suites pass without assertion changes

#### Scenario: Fallback and theme value agree

- **WHEN** a tokenized declaration's fallback is compared to the corresponding value in `theme.css`
- **THEN** they are equal; a disagreement is treated as a defect to fix, not a new appearance to accept

### Requirement: The token catalog is the chassis's versioned styling contract

The set of tokens a synth may set — their names, meaning, and layer — SHALL be documented as the theme contract: the chassis's public styling API. The reusable contract SHALL comprise the chassis component tokens and the palette; instrument-panel styling is the synth's own and is not part of the inherited contract. Token names SHALL be treated as a versioned interface, since renaming one breaks downstream synths' `theme.css` on sync.

#### Scenario: A documented token set defines the contract

- **WHEN** a new synth wants to restyle the chassis
- **THEN** it sets the documented palette/component tokens in its own `theme.css`, and the chassis renders accordingly without source edits

#### Scenario: Token renames are breaking changes

- **WHEN** a chassis token is renamed upstream
- **THEN** it is treated as a breaking change to the styling contract (downstream `theme.css` files referencing the old name must be updated), with the same governance as other versioned chassis interfaces
