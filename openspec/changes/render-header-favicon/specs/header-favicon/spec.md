## ADDED Requirements

### Requirement: Favicon glyph is rendered inline in the header

The SYNTH-D favicon glyph SHALL be rendered in the app header as an inline `<svg>` containing only the glyph path from `public/favicon.svg`. The black rounded-rectangle background of the favicon SHALL NOT be rendered. The glyph SHALL NOT be loaded via `<img src="/favicon.svg">`, because that would include the background rectangle and a fixed fill color.

#### Scenario: Glyph path is present inline

- **WHEN** the header is rendered
- **THEN** an inline `<svg>` containing the favicon glyph path appears in the header
- **AND** no `<rect>` background from the favicon is rendered

#### Scenario: Browser tab icon is unchanged

- **WHEN** the change is applied
- **THEN** `public/favicon.svg` and the `<link rel="icon">` in `index.html` are unchanged

### Requirement: Glyph is horizontally centered in the header

The glyph SHALL be positioned at the horizontal center of the full header width, independent of the asymmetric left content (GitHub icon link + title block) and right content (status stack + power button). The glyph SHALL be removed from the header's flex flow so it neither shifts nor is shifted by the existing header groups.

#### Scenario: Glyph sits at the header center

- **WHEN** the header is rendered
- **THEN** the glyph is centered across the full width of the header bar
- **AND** the GitHub icon link and title block remain at the left
- **AND** the status stack and power button remain at the right

#### Scenario: Glyph does not displace existing header content

- **WHEN** the header is rendered with the glyph present
- **THEN** the positions of the GitHub icon, title block, version label, status stack, and power button are unchanged from before the glyph was added

### Requirement: Glyph height matches the status stack

The glyph SHALL be sized so its height matches the full height of the right-hand status stack (the MIDI status row, the gap, and the PATCH button together). The glyph SHALL remain square (its width tracking its height). The glyph SHALL NOT increase the header's height.

#### Scenario: Glyph height equals the status stack height

- **WHEN** the header is rendered
- **THEN** the glyph's rendered height equals the height of the status stack (MIDI status row + gap + PATCH button)

#### Scenario: Glyph does not grow the header

- **WHEN** the glyph is rendered at the status-stack height
- **THEN** the header's overall height is unchanged from before the glyph was added

### Requirement: Glyph is a low-contrast mark

The glyph SHALL be filled `#2a2a2a` so it reads as a quiet, low-contrast mark against the `#1c1c1c` header background. The glyph SHALL NOT be rendered as a hard badge (no rounded-rectangle background, no border).

#### Scenario: Glyph fill color

- **WHEN** the header is rendered
- **THEN** the glyph is filled `#2a2a2a`

#### Scenario: No badge styling

- **WHEN** the header is rendered
- **THEN** the glyph has no background rectangle and no border

### Requirement: Glyph is decorative for assistive technology

The glyph SHALL be marked decorative for assistive technology (e.g. `aria-hidden="true"`) and SHALL provide no interactive behavior. The glyph SHALL set `pointer-events: none` so it never intercepts pointer events aimed at the header beneath it. The header's existing GitHub icon link remains the only brand hyperlink.

#### Scenario: Glyph is hidden from assistive technology

- **WHEN** a screen reader traverses the header
- **THEN** the glyph is not announced

#### Scenario: Glyph is not interactive

- **WHEN** the user clicks or hovers the glyph
- **THEN** nothing happens (no navigation, no hover affordance)

#### Scenario: Glyph does not intercept header clicks

- **WHEN** the user clicks at the header center where the glyph overlays the header
- **THEN** the click passes through to the header beneath (the glyph has `pointer-events: none`)
