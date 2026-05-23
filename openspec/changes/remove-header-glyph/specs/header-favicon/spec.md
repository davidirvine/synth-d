## REMOVED Requirements

### Requirement: Favicon glyph is rendered inline in the header

**Reason**: The decorative header glyph is being removed entirely; the header no longer renders an inline favicon glyph.
**Migration**: None. The browser tab icon (`public/favicon.svg` and the `<link rel="icon">` in `index.html`) is unchanged and continues to serve as the SYNTH-D mark. No header markup replaces the glyph.

### Requirement: Glyph is horizontally centered in the header

**Reason**: With the glyph removed, there is no element to center in the header.
**Migration**: None. The header retains its existing left group (GitHub icon link + title block) and right group (status stack + power button) with no centered element.

### Requirement: Glyph is rendered at a fixed 55px square

**Reason**: With the glyph removed, there is no element to size.
**Migration**: None. The header bar height is unaffected; no glyph occupies the header center.

### Requirement: Glyph is a glowing purple mark

**Reason**: The purple fill and `drop-shadow` glow styled an element that no longer exists.
**Migration**: None. The `.header-glyph` and `.header-glyph svg` CSS rules, including the purple fill (`#a64dff`) and glow filter, are removed.

### Requirement: Glyph is decorative for assistive technology

**Reason**: The decorative, non-interactive, `pointer-events: none` glyph is removed, so its assistive-technology semantics no longer apply.
**Migration**: None. The header's GitHub icon link remains the only brand hyperlink, exactly as before.
