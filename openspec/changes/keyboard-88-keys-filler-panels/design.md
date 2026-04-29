## Context

The Keyboard component currently generates 25 keys (MIDI 48–72) via `Array.from({ length: 25 }, ...)` using a fixed `BASE_MIDI = 48`. Each white key is 28 px wide; 15 white keys give 420 px total. The App layout places the keyboard in a flex column below the `.panels` grid, centered with `justify-content: center`.

The black keys (fill `#1a1a1a`) share nearly the same darkness as the surrounding panel background (`#1c1c1c`). Because all key y-positions start at y=0 and there is no border on the SVG or its container, the top edge of the black keys bleeds into the background.

The three-column `.panels` grid width is content-driven at approximately 1 269 px. A 61-key keyboard (36 white keys × 28 px = 1 008 px) fits within that width, leaving ~261 px for flanking panels. The existing `EmptyPanel` component is available for the right side. A new `RegisterPanel` component occupies the left side with keyboard range controls.

## Goals / Non-Goals

**Goals:**
- Add a 6 px top rail to the keyboard SVG so black keys have a defined upper boundary.
- Expand the keyboard from 25 keys to 61 keys with a reactive base MIDI note.
- Provide Oct ▼ / Oct ▲ buttons in a labeled "KEYBOARD RANGE" panel (left spacer) that jump the 61-key view to the bottom or top of the 88-key range in one click.
- Ensure the panel row fills to the keyboard row width using the register panel (left) and EmptyPanel (right).

**Non-Goals:**
- Incremental octave shifts (one semitone or one octave at a time).
- Changing key dimensions or QWERTY mapping.
- Responsive scaling of key size to viewport.
- More than two register positions.

## Decisions

### D1 — Top rail: 6 px SVG rect

A filled rect `x=0`, `y=0`, `width={totalWidth}`, `height={RAIL_H}` (6 px), fill `#2a2a2a` is rendered as the first element inside the SVG, behind all keys. All key y-positions offset by `RAIL_H`. SVG height becomes `WHITE_H + RAIL_H + 2`.

`#2a2a2a` matches the knob-body color — lighter than black keys (`#1a1a1a`), darker than the amber active highlight, consistent with the palette.

**Alternative considered:** CSS `border-top` on keyboard-wrap. Rejected — border appears above the 12 px top padding, divorcing it visually from the keys.

### D2 — Keyboard base MIDI: reactive prop

`Keyboard.svelte` receives a `baseMidi` prop (default 36, C2). The key array becomes a `$derived` value: `buildKeys(baseMidi, 61)`. `totalWidth` is derived from the white-key count within the current window (always 36 × 28 = 1 008 px for 61 consecutive keys starting on any note).

QWERTY mapping (MIDI 48–72) is unchanged. At both register positions (base 21 and base 48), QWERTY notes fall within the visible window:
- Base 21 (A0–A5, MIDI 21–81): QWERTY plays MIDI 48–72 — visible ✓
- Base 48 (C3–C8, MIDI 48–108): QWERTY plays MIDI 48–72 — visible ✓

**Alternative considered:** Exporting a `shiftRegister` method from Keyboard. Rejected — Svelte 5 idiomatic pattern is reactive props from the parent; methods add unnecessary coupling.

### D3 — Register positions: two fixed jumps only

| Button  | Base MIDI | Visible range |
|---------|-----------|---------------|
| Oct ▼   | 21        | A0–A5 (MIDI 21–81) |
| Oct ▲   | 48        | C3–C8 (MIDI 48–108) |

Both positions are hardcoded constants. No intermediate step. No wrapping. Pressing the button for the current position is a no-op.

**Alternative considered:** Incremental octave steps. Rejected — the user specifically requested one-click jumps to the extremes; intermediate steps add navigation overhead without benefit.

### D4 — RegisterPanel component

A new `RegisterPanel.svelte` styled as a panel (same background, border, padding as other panels) containing:
- A `"KEYBOARD RANGE"` label (same style as other panel labels: 10 px, uppercase, cream `#e8dcc8`, letter-spacing 0.1em).
- An `"Oct ▼"` button (jumps to base MIDI 21).
- An `"Oct ▲"` button (jumps to base MIDI 48).
- Props: `ondown: () => void`, `onup: () => void`, `activeRegister: 'bottom' | 'top' | 'mid'` (drives active state styling on the buttons).

Panel width is set to fill the left gap (~130 px). Buttons use the same style as other toggle buttons in the synth (`font-family: inherit`, 9 px, uppercase, `#2a2a2a` background, `#444` border, amber active: `#c87941`/`#3a2a1a`).

**Alternative considered:** Putting buttons directly in App.svelte without a dedicated component. Rejected — a component keeps panel styling encapsulated and consistent.

### D5 — Middle C indicator: thin SVG line on MIDI 60

When MIDI 60 (C4, middle C) is within the current keyboard window, a thin vertical line is drawn down the center of that white key. The line spans from just below the top rail to just above the bottom of the key (`y = RAIL_H + 4`, height = `WHITE_H - 8`), width = 1 px, color `#555` — visible but subtle, darker than the key itself (`#dddddd`) and not confused with the amber active highlight.

The indicator is a single SVG `<line>` element derived from the key array: find the white key with `midi === 60`, if present compute `x = key.x + WHITE_W / 2`. If MIDI 60 is not in the current window (e.g., top register starts at MIDI 48; C4 = MIDI 60 is in that window; bottom register MIDI 21–81 also includes MIDI 60), the indicator renders only when the key object exists in the current derived array.

Both register positions (base 21 and base 48) include MIDI 60, so the indicator is always visible. The default (base 36) also includes it. The indicator disappears automatically if `baseMidi` is ever set such that MIDI 60 falls outside the 61-key window (outside the scope of this change, but handled correctly by the derived lookup).

**Alternative considered:** A dot or small circle above the key. Rejected — a line is more subtle and does not add visual bulk. A triangle below the key was also considered; rejected for the same reason.

### D6 — Layout: panel row filled by RegisterPanel + EmptyPanel

The keyboard SVG is 1 008 px. The panels grid is ~1 269 px — wider than the keyboard. `App.svelte` adds:
- `RegisterPanel` to the left of `.panels` (width ≈ 130 px).
- `EmptyPanel` to the right of `.panels` (width ≈ 131 px).

The three items (RegisterPanel | .panels | EmptyPanel) are arranged in a flex row to fill the panel row to the keyboard width. Because both widths are static at author time, flex-grow or fixed widths are acceptable.

**Alternative considered:** ResizeObserver to compute filler widths dynamically. Rejected — introduces reactive complexity for a static layout.

## Risks / Trade-offs

- **Static filler width drifts** if a future panel change widens the grid → visible immediately; kept in sync by spec requirement.
- **Minimum viewport widens** from 420 px to 1 008 px → the synth does not reflow on resize (synth-ui spec requirement); this is an accepted consequence.
- **QWERTY notes shift visually** when register changes — pressing Z still plays MIDI 48 even when keyboard shows A0, but MIDI 48 remains visible in the window at both positions. No confusion for a player.

## Migration Plan

Purely visual/UI — no data migration:

1. Update `Keyboard.svelte` — add rail, make key array reactive on `baseMidi`.
2. Create `RegisterPanel.svelte` — label + two buttons.
3. Update `App.svelte` — `keyboardBase` state; wire RegisterPanel and EmptyPanel.
4. Update `Keyboard.test.js` — key count, range, rail assertions.
5. Create `RegisterPanel.test.js` — button renders, callbacks fire.

Rollback: revert the changed/added component files; no state or data affected.
