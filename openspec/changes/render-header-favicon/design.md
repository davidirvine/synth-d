## Context

The app header in `src/App.svelte` is a single flex row (`align-items: center`, `gap: 12px`) with asymmetric content: a left group (GitHub icon link + title block) and a right group (`.header-right` → `.status-stack` + `PowerButton`) pushed to the far edge by `margin-left: auto`. The horizontal center is empty.

The SYNTH-D glyph lives in `public/favicon.svg` as a 256×256 artwork: a black rounded `<rect>` background plus a single white `fill-rule="evenodd"` glyph `<path>`. It is currently referenced only by `<link rel="icon">` in `index.html`.

The header already establishes the pattern for inline brand SVGs: the GitHub icon at `App.svelte:339` is an inline `<svg>` with a hardcoded `<path>` and `fill="currentColor"`, not an `<img>`.

## Goals / Non-Goals

**Goals:**

- Render the glyph (path only, no background rect) centered in the header.
- Style it as a glowing purple (`#a64dff`) accent on the `#1c1c1c` bar.
- Render it at a fixed 55px square, centered vertically in the header bar.
- Keep it decorative — no new link, no assistive-tech announcement.

**Non-Goals:**

- Changing `public/favicon.svg` or the browser-tab icon.
- Making the glyph interactive (hover, click, link) — the GitHub icon link is the brand link.
- Altering the GitHub icon, title block, version label, status stack, or power button.
- Responsive/breakpoint behavior — the synth body forces a wide fixed layout.

## Decisions

**Inline the glyph `<path>` rather than `<img src="/favicon.svg">`.**
Glyph-only + recolor cannot be achieved by pointing an `<img>` at the existing file, because the file includes the black `<rect>` and a fixed white fill. Inlining the single `<path>` (copied verbatim from `public/favicon.svg`, omitting the `<rect>`) lets us drop the background and set `fill` freely. This matches the existing GitHub-icon precedent in the same header. Alternative — a second trimmed SVG asset in `public/` — adds a file to keep in sync with the favicon for no benefit; rejected.

**Fill purple (`#a64dff`) with a purple glow.**
The glyph is filled `#a64dff` and carries a layered purple glow via a CSS `filter: drop-shadow(...)` — a tight bright halo plus a softer wider one — so it reads as a luminous accent rather than a quiet mark. The glow is a filter on the rendered glyph shape, so it spills past the 55px box without affecting layout or becoming a badge (no rect, no border). An earlier revision used a deliberately low-contrast `#2a2a2a` fill; that was superseded by this glowing-purple look at the human's request. The glyph remains decorative, so WCAG text-contrast minimums do not apply.

**Center via absolute positioning, not a flex child.**
The left and right header groups have unequal widths, so a plain flex child cannot sit at the true horizontal center. Wrapping the glyph in `position: absolute; left: 50%; transform: translateX(-50%)` inside a `position: relative` `.header` centers it against the full header width regardless of side content. The element is removed from flow, so it neither shifts the existing groups nor is shifted by them. Alternative — equal-width spacer flex children flanking the glyph — is brittle (must track both side widths) and rejected.

Because the glyph sits over the header center, it also carries `pointer-events: none` so it never intercepts a click aimed at the header (e.g. the title). This makes the spec's "nothing happens on click" literally true rather than relying on the absence of a click handler.

**Fixed 55px square, centered in both axes.**
The glyph is sized to an explicit `width: 55px; height: 55px` and centered with `top: 50%; left: 50%; transform: translate(-50%, -50%)`. At 55px it is larger than the header content row (~38px, the status-stack height) but still fits inside the ~63px header bar, so vertically centering it keeps the whole glyph visible — it neither clips against the top of the window nor grows the header. The SVG `viewBox` is square (256×256) and the inner `<svg>` fills its box (`width: 100%; height: 100%`), so the glyph stays square. An earlier revision derived the height from the status stack via top/bottom padding pinning; that was superseded by this explicit 55px size at the human's request.

**Decorative semantics: `aria-hidden="true"` (and empty `alt` if ever an `<img>`).**
The glyph conveys no information beyond the already-present title and GitHub link, and adds no interaction, so it is hidden from assistive tech to avoid a redundant/empty announcement.

## Risks / Trade-offs

- **Glyph path drifts from `public/favicon.svg`** → The inlined path is a copy; a future favicon redesign won't propagate. Mitigation: copy the path verbatim now and note in the spec that the two share the same artwork; the glyph is decorative, so minor drift is cosmetic, not functional.
- **Absolute element overlaps side content at narrow widths** → Mitigation: none needed — the synth grid forces a wide fixed header with ample empty center; there is no responsive/narrow case in scope.
- **Fixed 55px could overflow the header if the bar ever shrinks** → The 55px glyph fits within the ~63px header bar today; if the header's height is ever reduced below ~55px, the glyph would clip against the bar. Mitigation: 55px is comfortably within the current bar, and the human visual gate catches any future mismatch.
