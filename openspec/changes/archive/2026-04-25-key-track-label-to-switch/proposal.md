## Why

The key track control currently has a separate "Key Track" text label above a small button that shows "on" or "off". The label is redundant — moving the control name into the button text in both states removes the visual clutter and makes the button self-documenting. Removing the label also drops the vertical offset it created, so the button sits level with the adjacent cutoff and resonance knobs.

## What Changes

- `src/components/Filter.svelte`: remove the `<span class="key-track-label">` element and its CSS rule; change the button's inner text from `{keyTrackOn === 1 ? 'on' : 'off'}` to the constant string `KEY TRACK` in both states; update `aria-label` to remain accessible

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `ladder-filter`: add a UI presentation requirement — the keyboard tracking toggle SHALL display "KEY TRACK" as its label in both the enabled and disabled states, with no separate text label above it, and SHALL be vertically aligned with the cutoff and resonance knobs in the same row

## Impact

- `src/components/Filter.svelte`: template and style changes only — no logic, no DSP, no FAUST changes
- `src/components/Filter.test.js`: existing tests query by `name: /key track/i`; button text changes from "on"/"off" to "KEY TRACK" so tests that check button text need updating
