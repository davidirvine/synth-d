## Why

The synth UI has several small visual inconsistencies: the product name is wrong, the window title does not match the product name, outer spacing differs from inter-panel spacing, the secondary panel row extends below the primary panel row creating an uneven bottom edge, and the layout reflows when the browser window is resized.

## What Changes

- Rename the synth from `SYNTH-1` to `SYNTH-D` in the header and browser window title
- Standardise outer padding to `8px` to match the `8px` inter-panel gap
- Replace the flex panel container with a CSS grid so all top-level columns share the same height and the layout never wraps on resize

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `synth-ui`: panel layout requirements change — fixed-column grid, uniform outer spacing, no responsive reflow, updated product name

## Impact

- `src/App.svelte` — header title text, `main` padding, `.panels` layout (flex → grid)
- `index.html` — `<title>` element
- `openspec/specs/synth-ui/spec.md` — updated requirements for name, spacing, and layout behaviour
