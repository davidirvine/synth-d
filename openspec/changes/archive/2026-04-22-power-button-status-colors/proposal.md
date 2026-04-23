## Why

The power button currently communicates only two visual states (unlit when off, amber when on), leaving the WASM loading phase invisible — the button goes disabled with reduced opacity but gives no indication that something is happening. Color-coding the icon across all three lifecycle states (off / loading / on) eliminates the ambiguity and keeps the UI layout constant with no spinners or overlays.

## What Changes

- Power icon color changes from a binary scheme (dark `#3a3a3a` / amber `#c87941`) to a tri-state traffic-light scheme:
  - **Off**: orange — the engine is stopped and ready to start
  - **Loading**: yellow — WASM is initializing; button is non-interactive
  - **On**: green — audio engine is running and producing sound
- The `opacity: 0.7` dimming applied during the loading/disabled state is removed; the yellow color alone signals the transitional state
- No layout changes: button dimensions, position, and surrounding panel structure are unchanged

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `power-button`: Icon color requirements change from a two-state (unlit/amber) scheme to a three-state (orange/yellow/green) scheme that reflects the full audio engine lifecycle including the WASM loading phase

## Impact

- `src/components/PowerButton.svelte` — CSS color values and disabled-state styling
- `openspec/specs/power-button/spec.md` — visual style requirements must be updated to reflect the new tri-state color scheme
