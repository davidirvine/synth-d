## Why

The synth UI has several small visual inconsistencies: the product name is wrong, the window title does not match the product name, outer spacing differs from inter-panel spacing, the secondary panel row extends below the primary panel row creating an uneven bottom edge, the layout reflows when the browser window is resized, the key-track control is a continuous knob when it should be binary, and the on/off toggle switches use a different active color from the power button.

## What Changes

- Rename the synth from `SYNTH-1` to `SYNTH-D` in the header and browser window title
- Standardise outer padding to `8px` to match the `8px` inter-panel gap
- Replace the flex panel container with a CSS grid so all top-level columns share the same height and the layout never wraps on resize
- Move the delay and reverb on/off toggle buttons onto the same row as their section labels ("DELAY" / "REVERB")
- Replace the `key trk` knob in the Filter panel with a "Key Track" on/off switch that emits `keyTrack` values of `0.0` (off) and `1.0` (on)
- Standardise the active state color of all on/off toggle switches (Key Track, Glide, Delay, Reverb) to the power button's active green (`#20b040`)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `synth-ui`: panel layout requirements change — fixed-column grid, uniform outer spacing, no responsive reflow, updated product name, delay/reverb toggle co-located with section label, key-track converted to binary switch, all on/off toggle active color standardised to `#20b040`

## Impact

- `src/App.svelte` — header title text, `main` padding, `.panels` layout (flex → grid)
- `index.html` — `<title>` element
- `src/components/Effects.svelte` — restructure delay/reverb sections so the toggle button sits inline with the section label; update active color to `#20b040`
- `src/components/Filter.svelte` — replace `key trk` `<Knob>` with a "Key Track" toggle switch
- `src/components/Glide.svelte` — update glide button active color to `#20b040`
- `openspec/specs/synth-ui/spec.md` — updated requirements for name, spacing, layout behaviour, toggle button placement, key-track switch, and active switch color
