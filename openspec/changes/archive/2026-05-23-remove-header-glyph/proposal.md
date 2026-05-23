## Why

The glowing purple favicon glyph in the app header is a purely decorative brand mark that no longer earns its place: it overlaps the header center, adds a luminous accent that competes with the functional controls, and carries ongoing markup, CSS, and test maintenance for zero functional value. Removing it simplifies the header back to its functional elements (GitHub link, title, status, power).

## What Changes

- Remove the decorative `.header-glyph` element (inline `<svg>` favicon glyph) from the app header markup.
- Remove the associated `.header-glyph` and `.header-glyph svg` CSS, including the purple fill accent and the `drop-shadow` glow filter.
- Remove the header brand-glyph test block that asserts the glyph's presence, fill, decorative semantics, and positioning hook.
- The browser tab icon is **unchanged**: `public/favicon.svg` and the `<link rel="icon">` in `index.html` are not touched — only the inline copy rendered in the header is removed.
- The existing header content (GitHub icon link, title block, version label, status stack, power button) is unchanged and remains in its current layout.

## Capabilities

### New Capabilities

<!-- None. This change only removes an existing capability. -->

### Modified Capabilities

- `header-favicon`: The entire capability is removed. Every requirement (inline render, horizontal centering, fixed 55px square, glowing purple mark, decorative-for-assistive-technology) is deleted, since the header glyph no longer exists.

## Impact

- `src/App.svelte`: header markup (the `.header-glyph` block) and the `.header-glyph` / `.header-glyph svg` CSS rules removed.
- `src/App.test.js`: the `App — header brand glyph` describe block removed.
- `openspec/specs/header-favicon/`: capability spec removed when the change is archived.
- No impact on the browser tab favicon, the DSP engine, or any other header control.
