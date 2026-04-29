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

### D1 — Top rail: 1 px SVG rect

A filled rect `x=0`, `y=0`, `width={totalWidth}`, `height={RAIL_H}` (1 px), fill `#333` is rendered as the first element inside the SVG, behind all keys. All key y-positions offset by `RAIL_H`. SVG height becomes `WHITE_H + RAIL_H + 2`.

`#333` matches the panel border color — a subtle hairline separator that defines the top of the key area without adding visual weight. A 6 px bold rail was prototyped but found too prominent relative to the ambient panel styling.

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

### D5 — Middle C indicator: not implemented

A middle C indicator (thin SVG `<line>` on MIDI 60) was considered but removed after visual review. Note labels (`C4`, etc.) already appear at the bottom of each white key, providing sufficient orientation. No line element is rendered.

### D6 — Layout: keyboard row with WheelPanel and RegisterPanel

The keyboard is presented in a `.keyboard-row` flex row: `WheelPanel` on the left, `Keyboard` in the center, and `RegisterPanel` on the right. Both flanking panels use `flex: 1` to fill the available space. The control panels remain in a separate `.panels` grid row above.

Placing both keyboard accessories in the keyboard row keeps playing controls spatially co-located with the keyboard, matching hardware synthesizer conventions (mod wheel to the left, register controls to the right).

**Alternative considered:** `RegisterPanel` to the left of `.panels` with `EmptyPanel` to the right (as originally drafted). Rejected after visual review — the keyboard row arrangement is more intuitive for a player.

### D7 — WheelPanel component

A new `WheelPanel.svelte` provides a vertical mod-wheel slider in the keyboard row. Props: `externalValue` (0–1, synced from incoming MIDI CC 1) and `onchange` (emits `{ param: 'modWheel', value }` on drag). The slider starts at 0.5. Styled to match panel aesthetics: `#1c1c1c` background, 1px `#333` border, amber fill `#c87941`.

**Alternative considered:** Keeping the virtual mod wheel inside the Modulation panel. Rejected — physical mod wheels live beside the keys; co-locating them in the keyboard row reinforces that convention.

## Risks / Trade-offs

- **Static filler width drifts** if a future panel change widens the grid → visible immediately; kept in sync by spec requirement.
- **Minimum viewport widens** from 420 px to 1 008 px → the synth does not reflow on resize (synth-ui spec requirement); this is an accepted consequence.
- **QWERTY notes shift visually** when register changes — pressing Z still plays MIDI 48 even when keyboard shows A0, but MIDI 48 remains visible in the window at both positions. No confusion for a player.

## Migration Plan

Purely visual/UI — no data migration:

1. Update `Keyboard.svelte` — add rail (1 px, `#333`), make key array reactive on `baseMidi`.
2. Create `RegisterPanel.svelte` — label + two buttons; placed in keyboard row to the right of keyboard.
3. Create `WheelPanel.svelte` — vertical mod-wheel slider; placed in keyboard row to the left of keyboard.
4. Update `App.svelte` — `keyboardBase` state (default 36); wire WheelPanel and RegisterPanel in keyboard row.
5. Update `Keyboard.test.js` — key count, range, rail assertions.
6. Create `RegisterPanel.test.js` — button renders, callbacks fire.
7. Create `WheelPanel.test.js` — drag interaction, externalValue sync.

Rollback: revert the changed/added component files; no state or data affected.
