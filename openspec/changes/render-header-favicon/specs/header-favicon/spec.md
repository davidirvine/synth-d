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

### Requirement: Glyph is rendered at a fixed 55px square

The glyph SHALL be rendered as a 55px square (55px wide by 55px tall), centered vertically within the header bar. The glyph SHALL remain square (its width equal to its height). The glyph SHALL NOT increase the header's height — the 55px glyph fits within the existing header bar.

#### Scenario: Glyph is 55px square

- **WHEN** the header is rendered
- **THEN** the glyph's rendered size is 55px wide by 55px tall

#### Scenario: Glyph does not grow the header

- **WHEN** the glyph is rendered at 55px square
- **THEN** the header's overall height is unchanged from before the glyph was added

### Requirement: Glyph is a glowing purple mark

The glyph SHALL be filled purple (`#a64dff`) and SHALL carry a purple glow so it reads as a luminous accent against the `#1c1c1c` header background. The glow SHALL be rendered as a CSS `filter` (e.g. `drop-shadow`) painted around the glyph shape, not as a badge. The glyph SHALL NOT be rendered as a hard badge (no rounded-rectangle background, no border).

#### Scenario: Glyph fill color

- **WHEN** the header is rendered
- **THEN** the glyph is filled purple (`#a64dff`)

#### Scenario: Glyph glows

- **WHEN** the header is rendered
- **THEN** the glyph carries a purple glow around its shape

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
