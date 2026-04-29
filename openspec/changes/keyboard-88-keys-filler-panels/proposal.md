## Why

The current keyboard has two problems. First, it spans only 2 octaves (25 keys, 420 px), limiting playability and leaving the keyboard row much narrower than the control panels. Second, the black keys (fill `#1a1a1a`) blend invisibly into the dark panel background (`#1c1c1c`) — no visual top edge separates them.

76 keys would span 1 260 px, within 9 px of the estimated 1 269 px panel row width — an unsafe margin. 61 keys at 1 008 px fits comfortably. To cover the full 88-key range (A0–C8) with a 61-key window, a register panel on the left provides two one-shot jump buttons: one jumps the keyboard view to the very bottom of the 88-key range (A0, MIDI 21); the other jumps it to the very top (C3–C8, MIDI 48). A plain EmptyPanel on the right balances the layout.

## What Changes

- A 6 px keybed top rail is added to the keyboard SVG, giving the black keys a defined top boundary.
- The Keyboard component is extended from 25 keys (MIDI 48–72) to 61 keys with a configurable base MIDI note (default MIDI 36, C2–C7).
- The keyboard base MIDI note is reactive; two buttons in the left register panel shift it instantly to the extremes of the 88-key range.
- A **register panel** (left of the control-panel grid) contains two buttons:
  - **Oct ▼**: sets base MIDI to 21 — keyboard shows A0–A5
  - **Oct ▲**: sets base MIDI to 48 — keyboard shows C3–C8
- A plain **EmptyPanel** (right of the control-panel grid) fills the remaining space symmetrically.
- Middle C (MIDI 60, C4) is marked with a thin vertical line down the center of the key. The indicator follows the keyboard window — it moves when the register shifts and disappears when C4 is outside the visible range.

## Capabilities

### New Capabilities

- `keyboard-register-shift`: Left-side panel with Oct ▼ / Oct ▲ buttons that jump the 61-key keyboard view to the bottom or top of the 88-key range in one click.
- `keyboard-filler-panels`: Register panel (left) and plain EmptyPanel (right) flanking the control-panel grid so the panel row matches the keyboard row width.

### Modified Capabilities

- `keyboard`: Key count changes from 25 (MIDI 48–72) to 61 (configurable base MIDI, default 36); top rail added; middle C indicator added; MIDI highlighting range follows the active window.
- `synth-ui`: Layout requirement updated — the panel row fills to keyboard width with a register panel left and EmptyPanel right.

## Impact

- `src/components/Keyboard.svelte` — top rail rect added; middle C indicator added; key array made reactive on `baseMidi` prop; MIDI range follows `baseMidi`.
- `src/components/RegisterPanel.svelte` — new component with Oct ▼ / Oct ▲ buttons.
- `src/App.svelte` — `keyboardBase` state added; RegisterPanel and EmptyPanel added left/right of `.panels` grid; `keyboardBase` passed to Keyboard.
- `openspec/specs/keyboard/spec.md` — key count, MIDI range, top-rail, and base-MIDI reactivity requirements updated.
- `openspec/specs/synth-ui/spec.md` — panel-row layout requirement updated.
- No audio engine changes.
