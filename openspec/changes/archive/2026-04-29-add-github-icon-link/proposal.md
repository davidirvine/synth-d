## Why

The synth UI has no visual link back to its source repository, making it harder for users who encounter the deployed synth to find the project. A small GitHub icon placed in the dead space below the keyboard — bottom-aligned with the left edge of the Oscillator Bank panel — provides a persistent, unobtrusive path to the repo without cluttering any control area.

## What Changes

- A GitHub mark icon is added to the synth layout, rendered as a clickable anchor that opens the repository in a new tab
- The icon is positioned in the area below the keyboard, horizontally aligned with the left edge of the Oscillator Bank panel and vertically aligned with the bottom of the overall synth module

## Capabilities

### New Capabilities

- `github-icon-link`: A GitHub mark icon rendered as an anchor element linking to the synth-d repository, placed below the keyboard aligned to the left edge of the Oscillator Bank panel

### Modified Capabilities

- `synth-ui`: The layout area below the keyboard gains a new absolutely- or flex-positioned GitHub icon element; no existing panel or keyboard geometry changes

## Impact

- `src/` — the Svelte component that renders the overall synth layout gains a new anchor + SVG icon element
- No DSP, MIDI, or audio code is affected
- No existing layout constraints change; the icon occupies space that is currently empty
