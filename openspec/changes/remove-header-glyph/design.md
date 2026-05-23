## Context

The app header (`src/App.svelte`) renders a decorative `.header-glyph` element: an inline `<svg>` carrying the SYNTH-D favicon glyph path, filled `#a64dff` and given a two-layer purple `drop-shadow` glow, absolutely positioned at the header center with `pointer-events: none`. It was introduced by the `header-favicon` capability. This change removes it.

The glyph's footprint is small and fully localized:

- **Markup**: the `.header-glyph` block in [App.svelte](src/App.svelte) (`<div class="header-glyph" aria-hidden="true"> … </svg></div>`).
- **CSS**: the `.header-glyph` and `.header-glyph svg` rules (absolute centering, fixed 55px square, `pointer-events: none`, purple fill, `drop-shadow` glow) plus their explanatory comment.
- **Tests**: the `App — header brand glyph` describe block in [App.test.js](src/App.test.js).

A repo-wide search confirms no other references to `header-glyph`, `#a64dff`, or the glow `rgba(166, 77, 255, …)`.

## Goals / Non-Goals

**Goals:**

- Remove the decorative glyph markup, CSS, and tests so the header has no centered brand glyph.
- Leave the rest of the header (GitHub icon link, title block, version label, status stack, power button) byte-for-byte unchanged in behavior and layout.
- Update the `header-favicon` spec so the capability is fully removed.

**Non-Goals:**

- Changing the browser tab icon. `public/favicon.svg` and the `<link rel="icon">` in `index.html` are explicitly out of scope and must not be touched.
- Re-centering or otherwise re-laying-out the remaining header content. The header already used absolute positioning for the glyph precisely so it sat outside the flex flow; removing it leaves the side groups exactly where they were.
- Removing or altering the `synth-title-link` or `github-icon-link` capabilities.

## Decisions

**Decision: Remove the capability outright rather than retain a disabled stub.**
The glyph provides no function and is not referenced elsewhere, so the cleanest result is full removal of markup, styling, tests, and the `header-favicon` spec. Alternative considered: hide it via CSS (`display: none`) or a feature flag — rejected as dead-code clutter that still carries maintenance and test weight for no benefit.

**Decision: Do not adjust the surrounding header layout.**
The glyph was absolutely positioned and removed from the flex flow specifically so it neither shifted nor was shifted by the side groups. Therefore deleting it cannot move the remaining content, and no compensating layout edit is needed. Alternative considered: introduce a centered spacer or re-balance the flex groups — rejected because the header layout requirement was that side content positions are independent of the glyph, so nothing needs rebalancing.

**Decision: Keep the browser tab favicon.**
The `header-favicon` spec already drew a hard line between the inline header copy and the tab icon. This change honors that line: only the inline header copy is removed.

## Risks / Trade-offs

- **[Risk] A stale test still asserts the glyph exists after removal]** → Remove the entire `App — header brand glyph` describe block in the same change; run `npx vitest run` to confirm no glyph assertion remains.
- **[Risk] An orphaned `.header-glyph` CSS rule is left behind, triggering an unused-selector lint warning]** → Remove both `.header-glyph` rules and their comment together with the markup; run `npx eslint --fix` and `npx prettier --write` on `App.svelte`.
- **[Risk] Accidentally touching the browser tab favicon]** → Scope edits to `App.svelte` and `App.test.js` only; do not open `public/favicon.svg` or `index.html`. The spec's "browser tab icon unchanged" scenario guards this.
- **[Trade-off] Mutation score (Stryker ≥ 85%) could shift slightly]** as glyph-related test cases are removed → The completion gate re-runs `npx stryker run`; if the score drops below threshold the change halts per `STACK.md`.
