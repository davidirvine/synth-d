## Context

The app header in `src/App.svelte` is a single flex row (`align-items: center`, `gap: 12px`) with asymmetric content: a left group (GitHub icon link + title block) and a right group (`.header-right` → `.status-stack` + `PowerButton`) pushed to the far edge by `margin-left: auto`. The horizontal center is empty.

The SYNTH-D glyph lives in `public/favicon.svg` as a 256×256 artwork: a black rounded `<rect>` background plus a single white `fill-rule="evenodd"` glyph `<path>`. It is currently referenced only by `<link rel="icon">` in `index.html`.

The header already establishes the pattern for inline brand SVGs: the GitHub icon at `App.svelte:339` is an inline `<svg>` with a hardcoded `<path>` and `fill="currentColor"`, not an `<img>`.

## Goals / Non-Goals

**Goals:**

- Render the glyph (path only, no background rect) centered in the header.
- Style it as a low-contrast `#2a2a2a` mark on the `#1c1c1c` bar.
- Match its height to the right-hand `.status-stack` (MIDI LED row + 6px gap + PATCH button).
- Keep it decorative — no new link, no assistive-tech announcement.

**Non-Goals:**

- Changing `public/favicon.svg` or the browser-tab icon.
- Making the glyph interactive (hover, click, link) — the GitHub icon link is the brand link.
- Altering the GitHub icon, title block, version label, status stack, or power button.
- Responsive/breakpoint behavior — the synth body forces a wide fixed layout.

## Decisions

**Inline the glyph `<path>` rather than `<img src="/favicon.svg">`.**
Glyph-only + recolor cannot be achieved by pointing an `<img>` at the existing file, because the file includes the black `<rect>` and a fixed white fill. Inlining the single `<path>` (copied verbatim from `public/favicon.svg`, omitting the `<rect>`) lets us drop the background and set `fill` freely. This matches the existing GitHub-icon precedent in the same header. Alternative — a second trimmed SVG asset in `public/` — adds a file to keep in sync with the favicon for no benefit; rejected.

**Fill `#2a2a2a` (one step lighter than the `#1c1c1c` bar).**
A pure-black glyph on `#1c1c1c` is effectively invisible; `#2a2a2a` reads as a deliberately quiet mark without becoming a hard badge. This is the explicitly chosen low-contrast look, not an accessibility target (the glyph is decorative, so WCAG text-contrast minimums do not apply).

**Center via absolute positioning, not a flex child.**
The left and right header groups have unequal widths, so a plain flex child cannot sit at the true horizontal center. Wrapping the glyph in `position: absolute; left: 50%; transform: translateX(-50%)` inside a `position: relative` `.header` centers it against the full header width regardless of side content. The element is removed from flow, so it neither shifts the existing groups nor is shifted by them. Alternative — equal-width spacer flex children flanking the glyph — is brittle (must track both side widths) and rejected.

Because the glyph sits over the header center, it also carries `pointer-events: none` so it never intercepts a click aimed at the header (e.g. the title). This makes the spec's "nothing happens on click" literally true rather than relying on the absence of a click handler.

**Derive height from the header content row, not a hardcoded pixel value.**
The header padding is `12px 20px 12px 8px` — asymmetric horizontally (8px left, 20px right) but with equal 12px top and bottom. With `align-items: center` and the glyph absolutely positioned with `top: 12px; bottom: 12px` pinned to those equal vertical values, the glyph's box spans the header content height — which the `.status-stack` defines as the tallest right-side element. For top/bottom pinning to define the size, the positioned element must NOT carry an explicit `height` (it stays `auto`), and the inner `<svg>` takes `height: 100%` to fill the derived box. The glyph therefore auto-matches the stack height (~38px today) and stays matched if the stack's contents change, avoiding a magic number. The SVG `viewBox` is square (256×256), so width tracks height and the glyph stays square. A hardcoded `height: 38px` is the acceptable fallback if pinning proves awkward.

**Decorative semantics: `aria-hidden="true"` (and empty `alt` if ever an `<img>`).**
The glyph conveys no information beyond the already-present title and GitHub link, and adds no interaction, so it is hidden from assistive tech to avoid a redundant/empty announcement.

## Risks / Trade-offs

- **Glyph path drifts from `public/favicon.svg`** → The inlined path is a copy; a future favicon redesign won't propagate. Mitigation: copy the path verbatim now and note in the spec that the two share the same artwork; the glyph is decorative, so minor drift is cosmetic, not functional.
- **Absolute element overlaps side content at narrow widths** → Mitigation: none needed — the synth grid forces a wide fixed header with ample empty center; there is no responsive/narrow case in scope.
- **Power button taller than the status stack would change the derived height** → Mitigation: if the pinned-padding height ever exceeds the intended `.status-stack` height, fall back to an explicit height matching the stack; verified visually at the human gate.
- **Glyph height couples to `.header`'s vertical padding** → The `top: 12px; bottom: 12px` values must stay in sync with `.header`'s vertical padding (`12px` top/bottom today); a future padding change silently resizes the glyph. Mitigation: keep the values matched (a shared CSS custom property would make the coupling explicit if the padding is ever parameterized), and the human visual gate catches any mismatch.
